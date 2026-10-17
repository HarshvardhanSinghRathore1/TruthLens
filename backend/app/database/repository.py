import logging
from typing import Optional, Dict, Any
from app.database.connection import database
from app.schemas.analysis import AnalysisResponse

logger = logging.getLogger("truthlens.repository")

class AnalysisRepository:
    """Stores and retrieves analysis metadata in optional MongoDB."""

    @property
    def is_available(self) -> bool:
        return database.is_connected and database.db is not None

    async def save_analysis(self, analysis: AnalysisResponse) -> bool:
        if not self.is_available:
            return False

        try:
            doc = analysis.model_dump()
            doc["_id"] = analysis.analysis_id
            await database.db["analyses"].replace_one(
                {"_id": analysis.analysis_id},
                doc,
                upsert=True
            )
            return True
        except Exception as e:
            logger.warning(f"Failed to persist analysis to MongoDB: {e}")
            return False

    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_available:
            return None

        try:
            doc = await database.db["analyses"].find_one({"_id": analysis_id})
            if doc:
                doc.pop("_id", None)
            return doc
        except Exception as e:
            logger.warning(f"Failed to retrieve analysis from MongoDB: {e}")
            return None

analysis_repository = AnalysisRepository()
