from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class EvidenceStatus(str, Enum):
    CONFIRMED_MANIPULATION = "Confirmed Manipulation"
    UNDER_INVESTIGATION = "Under Investigation"
    UNVERIFIED_CLAIM = "Unverified Claim"
    DEBUNKED_CLAIM = "Debunked Claim"
    GENERAL_DEEPFAKE_NEWS = "General Deepfake News"

class NewsCategory(str, Enum):
    ALL = "All"
    POLITICS = "Politics"
    CELEBRITIES = "Celebrities"
    SOCIAL_MEDIA = "Social Media"
    SCAMS = "Scams"
    FACT_CHECKS = "Fact Checks"

class NewsStory(BaseModel):
    id: str = Field(..., description="Unique story identifier derived from canonical URL or headline")
    headline: str = Field(..., description="Cleaned, sanitized article title")
    summary: str = Field(..., description="Short factual synopsis of the news item")
    source: str = Field(..., description="Publishing outlet or reporting organization")
    source_url: str = Field(..., description="Direct link to the original published article")
    published_at: str = Field(..., description="Publication date timestamp in ISO-8601 or formatted format")
    evidence_status: EvidenceStatus = Field(..., description="Editorial and forensic trust classification")
    evidence_reason: str = Field(..., description="Factual justification for the assigned evidence status")
    category: NewsCategory = Field(..., description="Primary topical classification")
    thumbnail_url: Optional[str] = Field(None, description="Article preview thumbnail if provided by source")
    video_url: Optional[str] = Field(None, description="Direct lawful media link if available in source enclosure")
    has_direct_video: bool = Field(False, description="Flag indicating if a direct playable video URL is attached")
    supporting_sources: List[str] = Field(default_factory=list, description="Cross-referenced sources or fact-checkers")
    unverified_aspects: Optional[str] = Field(None, description="Explicit caveats on what remains unverified")

class NewsResponse(BaseModel):
    items: List[NewsStory] = Field(default_factory=list, description="List of trending deepfake stories")
    total: int = Field(0, description="Total matching stories")
    page: int = Field(1, description="Current page number")
    limit: int = Field(12, description="Stories per page")
    total_pages: int = Field(1, description="Total pages available")
    last_refreshed: Optional[str] = Field(None, description="Timestamp of the latest successful ingestion")
    active_sources: List[str] = Field(default_factory=list, description="List of recognized active source outlets")
    provider_status: str = Field("operational", description="Status of the news discovery engine")
    configuration_notice: Optional[str] = Field(None, description="Setup instructions if external API keys are optional")

class NewsStatusResponse(BaseModel):
    last_refreshed: Optional[str] = Field(None, description="Timestamp of the last news cache refresh")
    total_stories: int = Field(0, description="Total indexed stories in memory/cache")
    cache_age_seconds: int = Field(0, description="Seconds since the last external fetch")
    active_sources: List[str] = Field(default_factory=list, description="Active news providers and wire services")
    status: str = Field("operational", description="Engine operating state")
    provider: str = Field("Google News RSS + Fact-Check Feeds", description="Active news ingestion provider")

class AnalyzeRemoteVideoRequest(BaseModel):
    video_url: str = Field(..., description="Direct HTTP/HTTPS link to a publicly accessible media file")
    news_id: Optional[str] = Field(None, description="Associated story identifier if launched from Deepfake Radar")
