from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

router = APIRouter()


class CalculateRequest(BaseModel):
    maths: float
    science: float
    history: float


def average_score(maths: float, science: float, history: float) -> float:
    return (maths + science + history) / 3


@router.get("/welcome", response_class=PlainTextResponse)
def welcome():
    return "Welcome to the FastAPI Application!"


@router.get("/success/{score}", response_class=PlainTextResponse)
def success(score: int):
    return f"The person is passed and the score is {score}"


@router.get("/fail/{score}", response_class=PlainTextResponse)
def fail(score: int):
    return f"The person is failed and the score is {score}"


@router.post("/api/calculate")
def api_calculate(body: CalculateRequest):
    average_marks = average_score(body.maths, body.science, body.history)
    result = "pass" if average_marks >= 50 else "fail"
    return {
        "result": result,
        "average_marks": round(average_marks, 2),
    }
