"""
CareerPilot AI — FastAPI Application Entry Point
=================================================
Initializes the application, manages the startup lifecycle (loading ML model
and O*NET occupational data), configures CORS, and mounts API routers.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import router as api_router
from backend.app.core.config import settings
from backend.app.services import ml_service, onet_service

logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("careerpilot.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler for startup and shutdown actions."""
    logger.info("Starting up %s...", settings.app_name)

    # 1. Load ML model pipeline
    try:
        ml_service.load_model()
        logger.info("ML pipeline initialized successfully.")
    except Exception as exc:
        logger.error("Failed to load ML pipeline: %s", exc, exc_info=True)

    # 2. Load O*NET occupational data
    try:
        onet_service.load_onet_data()
        logger.info("O*NET data initialized successfully.")
    except Exception as exc:
        logger.error("Failed to load O*NET data: %s", exc, exc_info=True)

    yield

    logger.info("Shutting down %s...", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    description=(
        "CareerPilot AI combines an empirical ML model trained on AMEO 2015 "
        "with O*NET occupational knowledge and Gemini-powered agentic intelligence "
        "for actionable career and skill guidance."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(settings.cors_origins + ["http://localhost:3000", "http://127.0.0.1:3000"])),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix=settings.api_v1_prefix)
# Also include router without prefix for /health access directly if desired
app.include_router(api_router)


@app.get("/", tags=["System"])
async def root() -> JSONResponse:
    """Root info endpoint."""
    return JSONResponse(
        content={
            "app": settings.app_name,
            "version": "1.0.0",
            "docs": "/docs",
            "health": f"{settings.api_v1_prefix}/health",
            "ml_model_loaded": ml_service.is_loaded(),
            "onet_loaded": onet_service.is_loaded(),
            "gemini_configured": settings.gemini_available,
        }
    )
