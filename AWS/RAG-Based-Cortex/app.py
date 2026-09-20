import logging
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from core.config import Config
from routes import router as api_router
from webapp.routes import router as web_router

BASE_DIR = Path(__file__).resolve().parent

logging.basicConfig(level=logging.DEBUG)

HOST = os.getenv("HOST", Config.HOST)
PORT = int(os.getenv("PORT", str(Config.PORT)))

app = FastAPI(title="RAG-Based Cortex")

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "webapp" / "static"),
    name="static",
)
app.include_router(web_router)
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host=HOST, port=PORT, reload=True)
