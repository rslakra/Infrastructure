from pathlib import Path

from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from routes import average_score

BASE_DIR = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=BASE_DIR / "templates")

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse(request, "index.html")


@router.get("/calculate", response_class=HTMLResponse)
def calculate_form(request: Request):
    return templates.TemplateResponse(request, "form.html")


@router.post("/calculate", response_class=HTMLResponse)
def calculate(
    request: Request,
    maths: float = Form(...),
    science: float = Form(...),
    history: float = Form(...),
):
    results = average_score(maths, science, history)
    return templates.TemplateResponse(
        request,
        "result.html",
        {"results": results},
    )
