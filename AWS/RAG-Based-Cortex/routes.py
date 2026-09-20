import logging
import os
import tempfile
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pydantic import BaseModel

from core.config import Config
from core.models.vector_store import VectorStore
from core.services.llm_service import LLMService
from core.services.storage_service import S3Storage

logger = logging.getLogger(__name__)

router = APIRouter()

_vector_store: VectorStore | None = None
_llm_service: LLMService | None = None
_storage_service: S3Storage | None = None


def require_openai_key() -> None:
    if not Config.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured. Set it in .env and restart.",
        )


def get_storage_service() -> S3Storage:
    global _storage_service
    if _storage_service is None:
        _storage_service = S3Storage()
    return _storage_service


def get_vector_store() -> VectorStore:
    global _vector_store
    require_openai_key()
    if _vector_store is None:
        _vector_store = VectorStore(Config.VECTOR_DB_PATH)
    return _vector_store


def get_llm_service() -> LLMService:
    global _llm_service
    require_openai_key()
    if _llm_service is None:
        _llm_service = LLMService(get_vector_store())
    return _llm_service


class QueryRequest(BaseModel):
    question: str


async def process_document(file: UploadFile):
    """Process document based on file type and return text chunks and raw content."""
    temp_dir = tempfile.mkdtemp()
    filename = file.filename or "upload"
    temp_path = os.path.join(temp_dir, filename)

    try:
        content = await file.read()

        with open(temp_path, "wb") as handle:
            handle.write(content)

        if filename.endswith(".pdf"):
            loader = PyPDFLoader(temp_path)
            documents = loader.load()
        elif filename.endswith(".txt"):
            loader = TextLoader(temp_path)
            documents = loader.load()
        else:
            raise ValueError("Unsupported file type")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        text_chunks = text_splitter.split_documents(documents)

        return text_chunks, content, filename

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        os.rmdir(temp_dir)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    require_openai_key()
    try:
        logger.debug("Upload endpoint called")

        if not file.filename:
            logger.warning("Empty filename")
            raise HTTPException(status_code=400, detail="No file selected")

        if not file.filename.endswith((".txt", ".pdf")):
            logger.warning("Unsupported file type: %s", file.filename)
            raise HTTPException(
                status_code=400,
                detail="Only .txt and .pdf files are supported",
            )

        logger.debug("Processing file: %s", file.filename)

        try:
            text_chunks, content, filename = await process_document(file)
            logger.debug("Document processed into %d chunks", len(text_chunks))
        except Exception as e:
            logger.error("Error processing document: %s", e)
            raise HTTPException(
                status_code=500,
                detail=f"Error processing document: {e}",
            ) from e

        try:
            get_storage_service().upload_file(BytesIO(content), filename)
            logger.debug("File uploaded to S3")
        except Exception as e:
            logger.error("Error uploading to S3: %s", e)
            raise HTTPException(
                status_code=500,
                detail=f"Error uploading to S3: {e}",
            ) from e

        try:
            get_vector_store().add_documents(text_chunks)
            logger.debug("Documents added to vector store")
        except Exception as e:
            logger.error("Error adding to vector store: %s", e)
            raise HTTPException(
                status_code=500,
                detail=f"Error adding to vector store: {e}",
            ) from e

        return {
            "message": "File uploaded and processed successfully",
            "chunks_processed": len(text_chunks),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@router.post("/query")
async def query(body: QueryRequest):
    require_openai_key()
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="No question provided")

    try:
        response = get_llm_service().get_response(body.question)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
