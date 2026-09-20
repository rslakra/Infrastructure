# CICD-Demo — FastAPI Marks Calculator

A small FastAPI web app that calculates average marks across Maths, Science, and History. It includes a Makefile for local development, a Dockerfile for containerization, and a GitHub Actions pipeline that builds the image, pushes it to Amazon ECR, and deploys it on a self-hosted EC2 runner.

## Project structure

```
CICD-Demo/
├── app.py                  # FastAPI entry point — mounts static files, includes routers
├── routes.py               # API routes (/welcome, /success, /fail, /api/calculate)
├── requirements.txt        # Python dependencies
├── Dockerfile              # Container image definition
├── .dockerignore           # Files excluded from Docker build context
├── .env.example            # Default environment variable template
├── Makefile                # Local dev, Docker, and AWS helpers
├── webapp/
│   ├── routes.py           # Web routes (/, /calculate)
│   ├── static/style.css    # Styles
│   └── templates/          # HTML templates (index, form, result)
└── .github/workflows/
    └── cicd.yaml           # CI/CD pipeline
```

### Route modules

| Module | Routes |
|--------|--------|
| `webapp/routes.py` | `/`, `/calculate` (GET form + POST result) |
| `routes.py` | `/welcome`, `/success/{score}`, `/fail/{score}`, `/api/calculate` |

`app.py` mounts `webapp/static` at `/static` and registers both routers.

## Prerequisites

- Python 3.12+ (local development)
- [Docker](https://docs.docker.com/get-docker/) (container builds and deployment)
- `make` (optional, for convenience targets)

## Quick start (local)

```bash
cp .env.example .env   # optional — make setup creates .env automatically
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

Using conda instead of venv:

```bash
conda create -n cicd-demo python=3.12 -y
conda activate cicd-demo
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

When the app is running:

- Web UI: http://localhost:8080
- Swagger docs: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## Environment variables

Copy `.env.example` to `.env` and adjust as needed. `make setup` creates `.env` automatically if it does not exist. The Makefile loads `.env` for local commands; `app.py` reads `HOST` and `PORT` when run directly with `python app.py`.

| Variable | Default | Purpose |
|----------|---------|---------|
| `HOST` | `0.0.0.0` | Uvicorn bind host |
| `PORT` | `8080` | Uvicorn bind port |
| `IMAGE_NAME` | `cicd-demo` | Local Docker image name |
| `IMAGE_TAG` | `latest` | Docker image tag |
| `CONTAINER_NAME` | `cicd-demo` | Docker container name |
| `AWS_REGION` | `us-east-1` | AWS region |
| `AWS_ECR_LOGIN_URI` | — | ECR registry host (no repo name) |
| `ECR_REPOSITORY_NAME` | `lakra-ecr-repo` | ECR repository name |
| `AWS_ACCESS_KEY_ID` | — | IAM access key (local/CLI only) |
| `AWS_SECRET_ACCESS_KEY` | — | IAM secret key (local/CLI only) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn[standard]` | ASGI server |
| `jinja2` | HTML templates |
| `python-multipart` | HTML form submissions |

## Makefile commands

Run `make` or `make help` to list all targets.

| Command | Description |
|---------|-------------|
| `make setup` | Create `venv/` and install `requirements.txt` |
| `make start` | Run the app locally (`0.0.0.0:8080`) |
| `make dev` | Run with uvicorn auto-reload |
| `make stop` | Stop any local process on port 8080 |
| `make restart` | Restart the local app |
| `make test` | Compile-check `app.py`, `routes.py`, and `webapp/` |
| `make lint` | Lint placeholder (matches CI) |
| `make docker-build` | Build Docker image as `cicd-demo:latest` |
| `make docker-start` | Build image if missing, remove old container, run on port 8080 |
| `make docker-stop` | Force-remove the container (running or stopped) |
| `make docker-restart` | Stop and start the container (does not rebuild) |
| `make docker-logs` | Tail container logs |
| `make docker-shell` | Shell into the running container |
| `make docker-clean` | Remove container and local image |
| `make ecr-login` | Authenticate Docker with ECR |
| `make docker-tag` | Tag local image for ECR |
| `make docker-push` | Build, tag, and push image to ECR |
| `make deploy-local` | Pull from ECR and deploy (self-hosted runner flow) |
| `make clean` | Remove venv, caches, and local Docker artifacts |

Override defaults as needed:

```bash
make dev PORT=5000
make docker-build IMAGE_NAME=my-app IMAGE_TAG=v1
make docker-push AWS_ECR_LOGIN_URI=123456789.dkr.ecr.us-east-1.amazonaws.com ECR_REPOSITORY_NAME=lakra-ecr-repo AWS_REGION=us-east-1
```

## Application routes

| Route | Method | Module | Description |
|-------|--------|--------|-------------|
| `/` | GET | `webapp/routes.py` | Home page |
| `/calculate` | GET | `webapp/routes.py` | Score entry form |
| `/calculate` | POST | `webapp/routes.py` | Compute average and show pass/fail (≥ 50) |
| `/welcome` | GET | `routes.py` | Plain-text welcome message |
| `/success/<score>` | GET | `routes.py` | Pass message with score |
| `/fail/<score>` | GET | `routes.py` | Fail message with score |
| `/api/calculate` | POST | `routes.py` | JSON API — body: `{ "maths", "science", "history" }` |
| `/docs` | GET | FastAPI | Swagger UI |
| `/redoc` | GET | FastAPI | ReDoc API reference |

Example API call:

```bash
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"maths": 80, "science": 70, "history": 60}'
```

## Docker (local)

```bash
make docker-start   # auto-builds image if missing, then runs container
# open http://localhost:8080
make docker-logs
make docker-stop
make docker-clean   # remove container + image
```

You can also build explicitly first:

```bash
make docker-build
make docker-start
```

The image uses Python 3.12 on `slim-bookworm`, copies `app.py`, `routes.py`, and `webapp/`, and starts with:

```bash
uvicorn app:app --host 0.0.0.0 --port 8080
```

The container always listens on port `8080` internally. `PORT` in `.env` controls the host port mapping (`make docker-start` maps `$PORT:8080`).

`.dockerignore` keeps local artifacts (`venv/`, `__pycache__/`, `.git/`, etc.) out of the build context.

### Docker troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `pull access denied for cicd-demo` | Image not built locally | Run `make docker-build` or `make docker-start` (auto-builds) |
| `container name already in use` | Stopped container still exists | Run `make docker-stop` or `docker rm -f cicd-demo` |

## CI/CD pipeline

On push to `main` (excluding README-only changes), `.github/workflows/cicd.yaml` runs three jobs:

1. **Continuous Integration** — install dependencies, lint, compile-check `app.py`, `routes.py`, and `webapp/`
2. **Continuous Delivery** — build Docker image and push to Amazon ECR (`latest` tag)
3. **Continuous Deployment** — on a self-hosted runner: pull image, remove old container (`cicd-demo`), run new container on port 8080, prune unused Docker resources

Required GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `ECR_REPOSITORY_NAME` (set to `lakra-ecr-repo` or your repo name).

## AWS setup

### 1. IAM user for deployment

Create an IAM user with:

- `AmazonEC2ContainerRegistryFullAccess` — push/pull images in ECR
- `AmazonEC2FullAccess` — manage EC2 (if needed for provisioning)

### 2. Amazon ECR repository

Create a repository (e.g. `lakra-ecr-repo`) and note the URI:

```
<account-id>.dkr.ecr.<region>.amazonaws.com/lakra-ecr-repo
```

### 3. EC2 instance (Ubuntu)

Launch an Ubuntu EC2 instance and install Docker:

```bash
sudo apt-get update -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker
```

### 4. Self-hosted GitHub Actions runner

On the EC2 instance:

1. GitHub repo → **Settings** → **Actions** → **Runners** → **New self-hosted runner**
2. Choose Linux and follow the install commands
3. Start the runner as a service so it stays online

### 5. GitHub repository secrets

| Secret | Example | Purpose |
|--------|---------|---------|
| `AWS_ACCESS_KEY_ID` | — | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | — | IAM secret key |
| `AWS_REGION` | `us-east-1` | AWS region |
| `ECR_REPOSITORY_NAME` | `lakra-ecr-repo` | ECR repository name |

### 6. Manual ECR push (optional)

If you want to push outside GitHub Actions:

```bash
export AWS_ECR_LOGIN_URI=123456789.dkr.ecr.us-east-1.amazonaws.com
export ECR_REPOSITORY_NAME=lakra-ecr-repo
export AWS_REGION=us-east-1
make docker-push
```

### 7. Manual deploy on EC2 (optional)

On the self-hosted runner host:

```bash
export AWS_ECR_LOGIN_URI=123456789.dkr.ecr.us-east-1.amazonaws.com
export ECR_REPOSITORY_NAME=lakra-ecr-repo
export AWS_REGION=us-east-1
make deploy-local
```

The app will be available at `http://<ec2-public-ip>:8080` (ensure security group allows inbound TCP 8080).
