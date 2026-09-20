from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Sample FastAPI App", version="1.0.0")

@app.get("/")
async def root():
    """Root endpoint returning a welcome message"""
    return {
        "message": "Welcome to FastAPI Sample App",
        "docs": "/docs",
        "python_version": "3.12"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

