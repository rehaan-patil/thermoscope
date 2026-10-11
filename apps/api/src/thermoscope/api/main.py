"""
ThermoScope FastAPI Application Entrypoint.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import analytics, dataset, export
from ..models.schemas import HealthResponse
from .routes.dataset import B0005_CSV, B0005_SUMMARY_CSV

app = FastAPI(
    title="ThermoScope REST API",
    description="Research-Grade Battery Thermal Analytics & Statistical Decision Support",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules under /api/v1
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(dataset.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "ThermoScope Statistical Engine API",
        "tagline": "Understand the signals before they become risks.",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    has_dataset = os.path.exists(B0005_CSV)
    cycles = 168 if os.path.exists(B0005_SUMMARY_CSV) else 0

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=os.getenv("ENVIRONMENT", "production"),
        dataset_loaded=has_dataset,
        b0005_cycle_count=cycles
    )
