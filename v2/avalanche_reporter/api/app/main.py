from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import router as avalanche_router

app = FastAPI(
    title="Avalanche-Risk API",
    version="1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(avalanche_router)
