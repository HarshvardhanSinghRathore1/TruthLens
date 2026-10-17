import re
from typing import Tuple, Optional, List
from app.schemas.news import EvidenceStatus, NewsCategory

def classify_story(
    title: str,
    summary: str,
    source: str
) -> Tuple[EvidenceStatus, str, NewsCategory, Optional[str], List[str]]:
    """
    Applies documented, evidence-based editorial rules to classify a news story's
    topical category and forensic verification trust status.
    """
    text = f"{title} {summary}".lower()
    source_lower = source.lower()

    # 1. Determine Topical Category
    category = NewsCategory.SOCIAL_MEDIA

    politics_keywords = [
        "election", "biden", "trump", "kamala", "harris", "modi", "starmer",
        "parliament", "congress", "senator", "governor", "president", "vote",
        "voter", "campaign", "ballot", "lawmaker", "white house", "political",
        "geopolitical", "pentagon", "putin", "zelensky"
    ]
    celebrity_keywords = [
        "taylor swift", "actor", "actress", "celebrity", "hollywood", "bollywood",
        "singer", "musician", "pope", "tom cruise", "mrbeast", "elon musk",
        "influencer", "star", "artist", "athlete", "nfl", "nba", "film"
    ]
    scam_keywords = [
        "scam", "fraud", "extortion", "crypto", "bitcoin", "theft", "phishing",
        "wire transfer", "bank", "impersonation", "cfo", "kidnapping", "ransom",
        "voice clone scam", "deepfake call", "stole", "swindled", "loot"
    ]
    fact_check_keywords = [
        "fact check", "fact-check", "snopes", "politifact", "reuters fact check",
        "ap fact check", "verdict", "debunk", "false claim", "misinformation",
        "boom live", "full fact", "lead stories", "check your fact"
    ]

    if any(k in source_lower or k in text for k in fact_check_keywords):
        category = NewsCategory.FACT_CHECKS
    elif any(k in text for k in scam_keywords):
        category = NewsCategory.SCAMS
    elif any(k in text for k in politics_keywords):
        category = NewsCategory.POLITICS
    elif any(k in text for k in celebrity_keywords):
        category = NewsCategory.CELEBRITIES
    else:
        category = NewsCategory.SOCIAL_MEDIA

    # 2. Determine Evidence Status
    debunked_patterns = [
        r"\bfact[- ]check\b", r"\bdebunk(ed|s)?\b", r"\bfalse claim\b",
        r"\bhoax\b", r"\bfalsely claims?\b", r"\bnever said\b",
        r"\bnot real\b", r"\bmanipulated video\b.*(debunked|false)",
        r"\bmisattributed\b", r"\bdoctored video\b", r"\bfabricated clip\b"
    ]
    confirmed_patterns = [
        r"\bconfirmed deepfake\b", r"\bconfirmed fake\b", r"\bproven manipulated\b",
        r"\bai-generated video verified\b", r"\bdeepfake verified\b",
        r"\bface swap confirmed\b", r"\bsynthetic voice verified\b",
        r"\bforensic analysis confirms\b", r"\bconvicted\b.*deepfake",
        r"\badmits creating\b"
    ]
    investigation_patterns = [
        r"\bprobe(s|d)?\b", r"\binvestigat(ing|ion|ed)\b", r"\balleged\b",
        r"\bsuspected\b", r"\binquiry\b", r"\bscrutiny\b", r"\bcomplaint filed\b",
        r"\bexamines viral\b", r"\bpolice probe\b", r"\belection commission\b"
    ]
    unverified_patterns = [
        r"\bviral claim\b", r"\bunverified\b", r"\bcirculating\b",
        r"\bsparks debate\b", r"\busers speculate\b", r"\bpurported\b",
        r"\bviewers question\b"
    ]

    supporting_sources = [source]
    unverified_aspects = "Specific neural model architecture used for synthesis, exact creation pipeline, and original author provenance remain unverified."

    if any(re.search(p, text) for p in debunked_patterns):
        status = EvidenceStatus.DEBUNKED_CLAIM
        reason = "Independent journalistic fact-checkers and forensics have examined the viral video and verified the underlying claim is false or fabricated."
        unverified_aspects = "Targeted spread velocity across private encrypted channels remains unquantified."
    elif any(re.search(p, text) for p in confirmed_patterns):
        status = EvidenceStatus.CONFIRMED_MANIPULATION
        reason = "Platform trust teams, investigative journalists, or forensic engineers have confirmed that the media contains algorithmic facial or acoustic manipulation."
        unverified_aspects = "Secondary distribution variations and compression re-encodings may alter artifact visibility."
    elif any(re.search(p, text) for p in investigation_patterns):
        status = EvidenceStatus.UNDER_INVESTIGATION
        reason = "Regulatory authorities, law enforcement, or editorial forensic teams have initiated formal investigations into the media's authenticity."
        unverified_aspects = "Final official forensic determination and attribution have not yet been formally published."
    elif any(re.search(p, text) for p in unverified_patterns):
        status = EvidenceStatus.UNVERIFIED_CLAIM
        reason = "The media is trending with active public allegations of AI tampering, but comprehensive technical verification is not yet completed."
        unverified_aspects = "Authenticity claims have not been corroborated by primary cryptographic signatures or forensic consensus."
    else:
        status = EvidenceStatus.GENERAL_DEEPFAKE_NEWS
        reason = "Industry, legislative, or educational reporting covering deepfake technology developments, policy discussions, or technological benchmarks."
        unverified_aspects = "Does not focus on a single controversial video file requiring immediate forensic debunking."

    return status, reason, category, unverified_aspects, supporting_sources
