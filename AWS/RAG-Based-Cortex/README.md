#Cortex — FastAPI RAG Based Knowledge Management System

A FastAPI RAG (Retrieval-Augmented Generation) app that uploads documents to S3, indexes them in ChromaDB, and answers questions via LangChain and OpenAI. It includes a Makefile for local development, a Dockerfile for containerization, and a GitHub Actions pipeline that builds the image, pushes it to Amazon ECR, and deploys it on a self-hosted EC2 runner.

## Project structure

```
RAG-Based-Cortex/
├── app.py                  # FastAPI entry point — mounts static files, includes routers
├── routes.py               # API routes (/upload, /query)
├── requirements.txt        # Python dependencies
├── Dockerfile              # Container image definition
├── .dockerignore           # Files excluded from Docker build context
├── .env.example            # Default environment variable template
├── Makefile                # Local dev, Docker, and AWS helpers
├── core/
│   ├── config.py           # Environment configuration
│   ├── models/vector_store.py  # ChromaDB vector store
│   └── services/           # S3 storage and LLM services
├── webapp/
│   ├── routes.py           # Web route (/)
│   ├── static/             # CSS and assets
│   └── templates/          # Jinja2 templates
└── .github/workflows/
    └── cicd.yaml           # CI/CD pipeline
```



### Route modules


| Module             | Routes              |
| ------------------ | ------------------- |
| `webapp/routes.py` | `/`                 |
| `routes.py`        | `/upload`, `/query` |




## Prerequisites

- Python 3.12+ (local development)
- [Docker](https://docs.docker.com/get-docker/) (container builds and deployment)
- OpenAI API key
- AWS credentials and S3 bucket (for document storage)
- `make` (optional, for convenience targets)



## Quick start (local)

```bash
cp .env.example .env   # optional — make setup creates .env automatically
# Edit .env with your OPENAI_API_KEY, AWS credentials, and bucket name
make setup             # create venv and install dependencies
make dev               # run with auto-reload on http://localhost:8080
```

Or without Make:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

When the app is running:

- Web UI: [http://localhost:8080](http://localhost:8080)
- Swagger docs: [http://localhost:8080/docs](http://localhost:8080/docs)
- ReDoc: [http://localhost:8080/redoc](http://localhost:8080/redoc)



## Environment variables

Copy `.env.example` to `.env` and adjust as needed. `make setup` creates `.env` automatically if it does not exist. The Makefile loads `.env` for local commands; `app.py` reads `HOST` and `PORT` when run directly.


| Variable                | Default          | Purpose                          |
| ----------------------- | ---------------- | -------------------------------- |
| `HOST`                  | `0.0.0.0`        | Uvicorn bind host                |
| `PORT`                  | `8080`           | Uvicorn bind port                |
| `IMAGE_NAME`            | `cortex`         | Local Docker image name          |
| `IMAGE_TAG`             | `latest`         | Docker image tag                 |
| `CONTAINER_NAME`        | `cortex`         | Docker container name            |
| `AWS_REGION`            | `us-east-1`      | AWS region                       |
| `AWS_ECR_LOGIN_URI`     | —                | ECR registry host (no repo name) |
| `ECR_REPOSITORY_NAME`   | `lakra-ecr-repo` | ECR repository name              |
| `AWS_ACCESS_KEY_ID`     | —                | IAM access key (local/CLI only)  |
| `AWS_SECRET_ACCESS_KEY` | —                | IAM secret key (local/CLI only)  |
| `OPENAI_API_KEY`        | —                | OpenAI API key                   |
| `AWS_ACCESS_KEY`        | —                | AWS access key for S3            |
| `AWS_SECRET_KEY`        | —                | AWS secret key for S3            |
| `AWS_BUCKET_NAME`       | —                | S3 bucket for uploaded documents |
| `VECTOR_DB_PATH`        | `cortex_db`      | Local ChromaDB persist directory |




## Dependencies


| Package               | Purpose                                 |
| --------------------- | --------------------------------------- |
| `fastapi`             | Web framework                           |
| `uvicorn[standard]`   | ASGI server                             |
| `jinja2`              | HTML templates                          |
| `python-multipart`    | File uploads                            |
| `langchain`           | RAG pipeline                            |
| `langchain-community` | Document loaders and Chroma integration |
| `langchain-openai`    | OpenAI chat and embeddings              |
| `openai`              | OpenAI API client                       |
| `chromadb`            | Vector store                            |
| `boto3`               | S3 storage                              |
| `pypdf`               | PDF document loading                    |
| `tiktoken`            | Tokenizer for OpenAI models             |


Note: local development targets **Python 3.12** (same as Docker). `make setup` prefers `python3.12` when available.

## Makefile commands

Run `make` or `make help` to list all targets.


| Command               | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `make setup`          | Create `venv/` and install `requirements.txt`                                 |
| `make start`          | Run the app locally (`0.0.0.0:8080`)                                          |
| `make dev`            | Run with uvicorn auto-reload                                                  |
| `make stop`           | Stop any local process on port 8080                                           |
| `make restart`        | Restart the local app                                                         |
| `make test`           | Compile-check `app.py`, `routes.py`, `webapp/`, and `core/`                   |
| `make lint`           | Lint placeholder (matches CI)                                                 |
| `make docker-build`   | Build Docker image as `cortex:latest`                                         |
| `make docker-start`   | Build image if missing, remove old container, run on port 8080 (loads `.env`) |
| `make docker-stop`    | Force-remove the container (running or stopped)                               |
| `make docker-restart` | Stop and start the container (does not rebuild)                               |
| `make docker-logs`    | Tail container logs                                                           |
| `make docker-shell`   | Shell into the running container                                              |
| `make docker-clean`   | Remove container and local image                                              |
| `make ecr-login`      | Authenticate Docker with ECR                                                  |
| `make docker-tag`     | Tag local image for ECR                                                       |
| `make docker-push`    | Build, tag, and push image to ECR                                             |
| `make deploy-local`   | Pull from ECR and deploy (self-hosted runner flow)                            |
| `make clean`          | Remove venv, caches, and local Docker artifacts                               |


Override defaults as needed:

```bash
make dev PORT=5000
make docker-push AWS_ECR_LOGIN_URI=123456789.dkr.ecr.us-east-1.amazonaws.com ECR_REPOSITORY_NAME=lakra-ecr-repo AWS_REGION=us-east-1
```



## Application routes


| Route     | Method | Module             | Description                                     |
| --------- | ------ | ------------------ | ----------------------------------------------- |
| `/`       | GET    | `webapp/routes.py` | Web UI — upload documents and ask questions     |
| `/upload` | POST   | `routes.py`        | Upload a `.txt` or `.pdf` file (multipart form) |
| `/query`  | POST   | `routes.py`        | JSON API — body: `{ "question": "..." }`        |
| `/docs`   | GET    | FastAPI            | Swagger UI                                      |
| `/redoc`  | GET    | FastAPI            | ReDoc API reference                             |


Example API calls:

```bash
curl -X POST http://localhost:8080/upload -F "file=@document.pdf"

curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}'
```



## Docker (local)

```bash
make docker-start   # auto-builds image if missing, passes .env to container
make docker-logs
make docker-stop
make docker-clean
```

The image uses Python 3.12 on `slim-bookworm`, copies `app.py`, `routes.py`, `webapp/`, and `core/`, and starts with:

```bash
uvicorn app:app --host 0.0.0.0 --port 8080
```



### Docker troubleshooting


| Error                           | Cause                          | Fix                                                          |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| `pull access denied for cortex` | Image not built locally        | Run `make docker-build` or `make docker-start` (auto-builds) |
| `container name already in use` | Stopped container still exists | Run `make docker-stop` or `docker rm -f cortex`              |




## CI/CD pipeline

On push to `main` (excluding README-only changes), `.github/workflows/cicd.yaml` runs three jobs:

1. **Continuous Integration** — install dependencies, lint, compile-check all modules
2. **Continuous Delivery** — build Docker image and push to Amazon ECR (`latest` tag)
3. **Continuous Deployment** — on a self-hosted runner: pull image, remove old container (`cortex`), run new container with app secrets on port 8080

Required GitHub secrets:


| Secret                  | Purpose                                |
| ----------------------- | -------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM access key                         |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key                         |
| `AWS_REGION`            | AWS region                             |
| `ECR_REPOSITORY_NAME`   | ECR repository name (`lakra-ecr-repo`) |
| `OPENAI_API_KEY`        | OpenAI API key                         |
| `AWS_ACCESS_KEY`        | AWS access key for S3 (app runtime)    |
| `AWS_SECRET_KEY`        | AWS secret key for S3 (app runtime)    |
| `AWS_BUCKET_NAME`       | S3 bucket name                         |




## AWS setup



### 1. IAM user for deployment

Create an IAM user with:

- `AmazonEC2ContainerRegistryFullAccess` — push/pull images in ECR
- `AmazonS3FullAccess` — upload/retrieve documents in S3
- `AmazonEC2FullAccess` — manage EC2 (if needed for provisioning)



### 2. Amazon ECR repository

Create a repository (e.g. `lakra-ecr-repo`) and note the URI:

```
<account-id>.dkr.ecr.<region>.amazonaws.com/lakra-ecr-repo
```



### 3. S3 bucket

Create an S3 bucket for document storage and set `AWS_BUCKET_NAME` in `.env`.

### 4. EC2 instance (Ubuntu)

```bash
sudo apt-get update -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker
```



### 5. Self-hosted GitHub Actions runner

1. GitHub repo → **Settings** → **Actions** → **Runners** → **New self-hosted runner**
2. Choose Linux and follow the install commands
3. Start the runner as a service so it stays online



### 6. Manual ECR push (optional)

```bash
export AWS_ECR_LOGIN_URI=123456789.dkr.ecr.us-east-1.amazonaws.com
export ECR_REPOSITORY_NAME=lakra-ecr-repo
export AWS_REGION=us-east-1
make docker-push
```



### 7. Manual deploy on EC2 (optional)

```bash
export AWS_ECR_LOGIN_URI=123456789.dkr.ecr.us-east-1.amazonaws.com
export ECR_REPOSITORY_NAME=lakra-ecr-repo
export AWS_REGION=us-east-1
make deploy-local
```

The app will be available at `http://<ec2-public-ip>:8080` (ensure security group allows inbound TCP 8080).