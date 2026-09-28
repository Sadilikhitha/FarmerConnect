from pathlib import Path

from fastapi import FastAPI, Request

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse

from fastapi.staticfiles import StaticFiles

from app.database import Base, engine

from app.routers import (
    auth,
    equipment,
    bookings,
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Farmer Connect API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# SERVE UPLOADED IMAGES
# =========================================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# =========================================================
# ERROR HANDLER
# =========================================================

@app.exception_handler(Exception)
async def generic_exception_handler(
    request: Request,
    exc: Exception
):

    print(
        "SERVER ERROR:",
        repr(exc)
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail":
                "Something went wrong. "
                "Please try again."
        }
    )


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth.router
)

app.include_router(
    equipment.router
)

app.include_router(
    bookings.router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message":
            "Farmer Connect API is running"
    }