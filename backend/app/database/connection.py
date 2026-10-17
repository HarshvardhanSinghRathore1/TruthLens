import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("truthlens.database")

class Database:
    """Optional MongoDB client manager using Motor (async)."""

    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False

    async def connect(self):
        if not settings.ENABLE_DB or not settings.MONGODB_URI:
            logger.info("MongoDB persistence is disabled or URI is not configured.")
            return

        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
            self.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
            self.db = self.client[settings.MONGODB_DB_NAME]
            # Ping
            await self.client.admin.command('ping')
            self.is_connected = True
            logger.info("Successfully connected to MongoDB.")
        except Exception as e:
            logger.warning(f"Could not connect to MongoDB: {e}. Running without database persistence.")
            self.is_connected = False
            self.client = None
            self.db = None

    async def disconnect(self):
        if self.client:
            self.client.close()
            self.is_connected = False
            logger.info("MongoDB connection closed.")

database = Database()
