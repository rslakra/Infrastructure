import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from routes import router as api_router
from webapp.routes import router as web_router

BASE_DIR = Path(__file__).resolve().parent

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8080"))

app = FastAPI(title="Marks Calculator")

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "webapp" / "static"),
    name="static",
)
app.include_router(web_router)
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host=HOST, port=PORT)
