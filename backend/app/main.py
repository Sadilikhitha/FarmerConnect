"""
Farmer Connect - FastAPI application entrypoint.
Creates all database tables automatically on startup.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import auth, equipment, bookings

# Automatically create tables (users, equipment, bookings) if they don't exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farmer Connect API", version="1.0.0")

# Allow the React frontend (any origin during development) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Fallback handler so unexpected errors still return a readable JSON message
    # instead of a raw stack trace.
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


# Serve uploaded equipment images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


app.include_router(auth.router)
app.include_router(equipment.router)
app.include_router(bookings.router)


@app.get("/")
def root():
    return {"message": "Farmer Connect API is running"}