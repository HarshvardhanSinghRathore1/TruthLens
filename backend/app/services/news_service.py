import asyncio
import hashlib
import logging
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import List, Optional, Set, Tuple
from urllib.parse import quote_plus

import httpx

from app.core.config import settings
from app.schemas.news import (
    EvidenceStatus,
    NewsCategory,
    NewsResponse,
    NewsStatusResponse,
    NewsStory,
)
from app.services.news_classifier import classify_story
from app.utils.security import sanitize_text

logger = logging.getLogger("truthlens.services.news")

# Target RSS query endpoints for comprehensive deepfake media coverage
RSS_QUERIES = [
    "deepfake video",
    "manipulated video fact check",
    "political deepfake video",
    "celebrity deepfake",
    "deepfake scam",
    "AI generated video",
]

class NewsService:
    def __init__(self):
        self._cache: List[NewsStory] = []
        self._last_refreshed: Optional[datetime] = None
        self._active_sources: Set[str] = set()
        self._lock = asyncio.Lock()
        self._last_refresh_attempt: Optional[datetime] = None

    def _normalize_title(self, raw_title: str) -> Tuple[str, str]:
        """
        Separates source suffix (e.g. ' - Reuters') from the primary headline.
        """
        sanitized = sanitize_text(raw_title)
        if " - " in sanitized:
            parts = sanitized.rsplit(" - ", 1)
            return parts[0].strip(), parts[1].strip()
        return sanitized, "Independent Reporting"

    def _generate_story_id(self, url: str, headline: str) -> str:
        unique_string = f"{url.strip()}:{headline.lower().strip()}"
        return hashlib.sha256(unique_string.encode("utf-8")).hexdigest()[:16]

    async def _fetch_rss_query(self, client: httpx.AsyncClient, query: str) -> List[dict]:
        encoded_query = quote_plus(query)
        url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
        raw_items = []

        try:
            response = await client.get(url, timeout=12.0)
            if response.status_code != 200:
                logger.warning(f"RSS query '{query}' failed with status {response.status_code}")
                return []

            root = ET.fromstring(response.content)
            channel = root.find("channel")
            if channel is None:
                return []

            for item in channel.findall("item"):
                title_elem = item.find("title")
                link_elem = item.find("link")
                pub_date_elem = item.find("pubDate")
                desc_elem = item.find("description")
                source_elem = item.find("source")

                title = title_elem.text if title_elem is not None else ""
                link = link_elem.text if link_elem is not None else ""
                pub_date = pub_date_elem.text if pub_date_elem is not None else ""
                desc = desc_elem.text if desc_elem is not None else ""
                source_name = source_elem.text if source_elem is not None else ""

                if title and link:
                    raw_items.append({
                        "title": title,
                        "link": link,
                        "pub_date": pub_date,
                        "description": desc,
                        "source": source_name,
                    })
        except Exception as e:
            logger.error(f"Error fetching RSS query '{query}': {e}")

        return raw_items

    async def _fetch_newsapi(self, client: httpx.AsyncClient) -> List[dict]:
        """Optional provider: NewsAPI.org if user has configured NEWS_API_KEY"""
        if not settings.NEWS_API_KEY:
            return []

        url = "https://newsapi.org/v2/everything"
        params = {
            "q": "deepfake OR (manipulated AND video)",
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": 50,
            "apiKey": settings.NEWS_API_KEY,
        }
        items = []
        try:
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                for art in data.get("articles", []):
                    items.append({
                        "title": art.get("title", ""),
                        "link": art.get("url", ""),
                        "pub_date": art.get("publishedAt", ""),
                        "description": art.get("description", ""),
                        "source": art.get("source", {}).get("name", "NewsAPI"),
                        "thumbnail_url": art.get("urlToImage"),
                    })
        except Exception as e:
            logger.warning(f"Failed to query NewsAPI: {e}")
        return items

    async def ingest_news(self, force: bool = False) -> int:
        """
        Orchestrates multi-source news discovery, deduplication, and classification.
        """
        now = datetime.now(timezone.utc)

        # Enforce rate-limit cooldown unless forced
        if not force and self._last_refresh_attempt:
            elapsed = (now - self._last_refresh_attempt).total_seconds()
            if elapsed < settings.NEWS_REFRESH_COOLDOWN_SEC:
                logger.info(f"Skipping refresh; cooldown active ({int(elapsed)}s < {settings.NEWS_REFRESH_COOLDOWN_SEC}s)")
                return len(self._cache)

        async with self._lock:
            self._last_refresh_attempt = now
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TruthLensForensics/1.0",
                "Accept": "application/rss+xml, application/xml, text/xml",
            }

            all_raw_items = []
            async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
                # 1. Fetch RSS queries in parallel
                tasks = [self._fetch_rss_query(client, q) for q in RSS_QUERIES]
                # Also fetch optional NewsAPI
                if settings.NEWS_API_KEY:
                    tasks.append(self._fetch_newsapi(client))

                results = await asyncio.gather(*tasks, return_exceptions=True)
                for res in results:
                    if isinstance(res, list):
                        all_raw_items.extend(res)

            # 2. Deduplicate and normalize
            seen_urls: Set[str] = set()
            seen_titles: Set[str] = set()
            new_stories: List[NewsStory] = []
            active_sources: Set[str] = set()

            for item in all_raw_items:
                raw_title = item.get("title", "")
                link = item.get("link", "").strip()

                if not raw_title or not link or link in seen_urls:
                    continue

                headline, parsed_source = self._normalize_title(raw_title)
                source_name = item.get("source") or parsed_source or "News Wire"

                # Title deduplication signature (ignoring punctuation)
                clean_title_sig = re.sub(r"[^\w\s]", "", headline.lower()).strip()
                if clean_title_sig in seen_titles:
                    continue

                seen_urls.add(link)
                seen_titles.add(clean_title_sig)
                active_sources.add(source_name)

                # Format publication timestamp
                pub_str = item.get("pub_date", "")
                dt = None
                if pub_str:
                    try:
                        dt = parsedate_to_datetime(pub_str)
                    except Exception:
                        try:
                            dt = datetime.fromisoformat(pub_str.replace("Z", "+00:00"))
                        except Exception:
                            dt = now
                if not dt:
                    dt = now

                iso_pub = dt.isoformat()

                # Clean summary
                raw_desc = item.get("description", "")
                summary = sanitize_text(raw_desc)
                if not summary or len(summary) < 20:
                    summary = f"Reporting by {source_name} regarding verified allegations or technical forensic analysis of suspected synthetic media."

                # 3. Classify topical category and evidence trust status
                (
                    evidence_status,
                    evidence_reason,
                    category,
                    unverified_aspects,
                    supporting_sources,
                ) = classify_story(headline, summary, source_name)

                story_id = self._generate_story_id(link, headline)

                story = NewsStory(
                    id=story_id,
                    headline=headline,
                    summary=summary,
                    source=source_name,
                    source_url=link,
                    published_at=iso_pub,
                    evidence_status=evidence_status,
                    evidence_reason=evidence_reason,
                    category=category,
                    thumbnail_url=item.get("thumbnail_url"),
                    has_direct_video=False,
                    supporting_sources=supporting_sources,
                    unverified_aspects=unverified_aspects,
                )
                new_stories.append(story)

            # Sort by publication date descending
            new_stories.sort(key=lambda s: s.published_at, reverse=True)

            if new_stories:
                self._cache = new_stories
                self._last_refreshed = now
                self._active_sources = active_sources
                logger.info(f"Deepfake Radar ingested {len(new_stories)} stories from {len(active_sources)} sources.")

            return len(self._cache)

    async def get_stories(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        evidence_status: Optional[str] = None,
        sort_by: str = "latest",
        page: int = 1,
        limit: int = 12,
    ) -> NewsResponse:
        now = datetime.now(timezone.utc)

        # Check if cache needs populating or refresh
        needs_refresh = (
            not self._cache
            or not self._last_refreshed
            or (now - self._last_refreshed).total_seconds() > settings.NEWS_CACHE_TTL_MINUTES * 60
        )

        if needs_refresh:
            await self.ingest_news()

        filtered = list(self._cache)

        # Category Filter
        if category and category.lower() != "all":
            filtered = [s for s in filtered if s.category.value.lower() == category.lower()]

        # Evidence Status Filter
        if evidence_status and evidence_status.lower() != "all":
            filtered = [s for s in filtered if s.evidence_status.value.lower() == evidence_status.lower()]

        # Keyword Search Filter
        if query and query.strip():
            q_lower = query.strip().lower()
            filtered = [
                s for s in filtered
                if q_lower in s.headline.lower()
                or q_lower in s.summary.lower()
                or q_lower in s.source.lower()
            ]

        # Sorting
        if sort_by == "relevant" and query and query.strip():
            q_lower = query.strip().lower()
            def relevance_score(s: NewsStory) -> int:
                score = 0
                if q_lower in s.headline.lower():
                    score += 5
                if q_lower in s.source.lower():
                    score += 2
                if q_lower in s.summary.lower():
                    score += 1
                return score
            filtered.sort(key=relevance_score, reverse=True)
        else:
            # Default: latest published first
            filtered.sort(key=lambda s: s.published_at, reverse=True)

        total = len(filtered)
        total_pages = max(1, (total + limit - 1) // limit)
        page = max(1, min(page, total_pages)) if total > 0 else 1
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit

        items = filtered[start_idx:end_idx]

        config_notice = None
        if not settings.NEWS_API_KEY:
            config_notice = (
                "Deepfake Radar is actively ingesting live RSS wire services and fact-check feeds. "
                "Optional NewsAPI or GNews keys can be configured in backend/.env for supplementary queries."
            )

        return NewsResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            last_refreshed=self._last_refreshed.isoformat() if self._last_refreshed else None,
            active_sources=sorted(list(self._active_sources)),
            provider_status="operational" if self._cache else "initializing",
            configuration_notice=config_notice,
        )

    async def get_story_by_id(self, story_id: str) -> Optional[NewsStory]:
        if not self._cache:
            await self.ingest_news()
        for story in self._cache:
            if story.id == story_id:
                return story
        return None

    def get_status(self) -> NewsStatusResponse:
        now = datetime.now(timezone.utc)
        cache_age = (
            int((now - self._last_refreshed).total_seconds())
            if self._last_refreshed
            else 0
        )
        return NewsStatusResponse(
            last_refreshed=self._last_refreshed.isoformat() if self._last_refreshed else None,
            total_stories=len(self._cache),
            cache_age_seconds=cache_age,
            active_sources=sorted(list(self._active_sources)),
            status="operational" if self._cache else "empty",
            provider="Google News RSS + Fact-Checking Wire" + (" (+ NewsAPI)" if settings.NEWS_API_KEY else ""),
        )

# Global singleton
news_service = NewsService()
