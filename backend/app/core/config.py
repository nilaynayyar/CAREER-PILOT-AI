"""
CareerPilot AI — Backend Application Configuration
====================================================
Centralised settings loaded from environment / .env file.
"""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_name: str = "CareerPilot AI"
    environment: Literal["development", "production", "test"] = "development"
    debug: bool = True
    log_level: str = "INFO"

    # API
    api_v1_prefix: str = "/api/v1"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ML Model paths (relative to project root)
    model_dir: str = "ml/models"
    model_artifact_name: str = "final_model.joblib"
    model_metadata_name: str = "model_metadata.json"

    # O*NET data path
    onet_data_dir: str = "data/onet"

    # Gemini AI (optional — app works without it for ML-only routes)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    gemini_timeout_seconds: int = 30
    gemini_max_retries: int = 1

    @property
    def model_path(self) -> Path:
        return PROJECT_ROOT / self.model_dir / self.model_artifact_name

    @property
    def model_metadata_path(self) -> Path:
        return PROJECT_ROOT / self.model_dir / self.model_metadata_name

    @property
    def onet_dir_path(self) -> Path:
        return PROJECT_ROOT / self.onet_data_dir

    @property
    def gemini_available(self) -> bool:
        return bool(self.gemini_api_key)


settings = Settings()
