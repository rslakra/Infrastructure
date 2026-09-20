ROOT := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
VENV := $(ROOT)venv
PIP := $(VENV)/bin/pip
PYTHON3 ?= $(shell command -v python3.12 >/dev/null 2>&1 && echo python3.12 || echo python3)
PYTHON := $(VENV)/bin/python
UVICORN := $(VENV)/bin/uvicorn

ifneq (,$(wildcard .env))
include .env
export
endif

PORT ?= 8080
HOST ?= 0.0.0.0
IMAGE_NAME ?= cortex
IMAGE_TAG ?= latest
CONTAINER_NAME ?= cortex

AWS_REGION ?= us-east-1
AWS_ECR_LOGIN_URI ?=
ECR_REPOSITORY_NAME ?= lakra-ecr-repo

.DEFAULT_GOAL := help

.PHONY: help setup start dev stop restart test lint \
        docker-build docker-start docker-stop docker-restart docker-logs docker-shell docker-clean \
        ecr-login docker-tag docker-push deploy-local clean

help: ## Show available commands
	@echo "RAG-Based-Cortex — FastAPI Knowledge Management"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@grep -hE '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

setup: ## Create venv/ and install requirements.txt
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@echo "Using $(PYTHON3) ($$($(PYTHON3) --version))"
	$(PYTHON3) -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

$(UVICORN): requirements.txt
	$(MAKE) setup

start: stop $(UVICORN) ## Run the FastAPI app on HOST:PORT (default 0.0.0.0:8080)
	cd $(ROOT) && $(UVICORN) app:app --host $(HOST) --port $(PORT)

dev: stop $(UVICORN) ## Run with uvicorn auto-reload
	cd $(ROOT) && $(UVICORN) app:app --host $(HOST) --port $(PORT) --reload

stop: ## Stop any process listening on PORT
	@pids=$$(lsof -t -iTCP:$(PORT) -sTCP:LISTEN 2>/dev/null); \
	if [ -n "$$pids" ]; then \
		echo "Stopping process(es) on port $(PORT): $$pids"; \
		kill $$pids 2>/dev/null || true; \
		sleep 1; \
		pids=$$(lsof -t -iTCP:$(PORT) -sTCP:LISTEN 2>/dev/null); \
		[ -n "$$pids" ] && kill -9 $$pids 2>/dev/null || true; \
	else \
		echo "No process listening on port $(PORT)"; \
	fi

restart: stop start ## Restart the local FastAPI app

test: ## Compile-check Python sources
	cd $(ROOT) && $(PYTHON) -m compileall app.py routes.py webapp core

lint: ## Lint placeholder (matches CI workflow)
	@echo "Linting repository"

docker-build: ## Build Docker image locally
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) $(ROOT)

docker-start: docker-stop ## Run container mapping PORT (default 8080)
	@docker image inspect $(IMAGE_NAME):$(IMAGE_TAG) >/dev/null 2>&1 || $(MAKE) docker-build
	docker run -d -p $(PORT):8080 --name $(CONTAINER_NAME) \
		$(if $(wildcard .env),--env-file .env,) \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "App running at http://localhost:$(PORT)"

docker-stop: ## Stop and remove the container if it exists
	@docker rm -f $(CONTAINER_NAME) 2>/dev/null || echo "No container named $(CONTAINER_NAME)"

docker-restart: docker-stop docker-start ## Rebuild is not included; restarts existing image

docker-logs: ## Tail container logs
	docker logs -f $(CONTAINER_NAME)

docker-shell: ## Open a shell inside the running container
	docker exec -it $(CONTAINER_NAME) /bin/bash

docker-clean: docker-stop ## Remove container and local image
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || true

ecr-login: ## Log in to Amazon ECR (requires AWS CLI and credentials)
	@test -n "$(AWS_ECR_LOGIN_URI)" || (echo "Set AWS_ECR_LOGIN_URI (e.g. 123456789.dkr.ecr.us-east-1.amazonaws.com)" && exit 1)
	aws ecr get-login-password --region $(AWS_REGION) | \
		docker login --username AWS --password-stdin $(AWS_ECR_LOGIN_URI)

docker-tag: ## Tag local image for ECR
	@test -n "$(AWS_ECR_LOGIN_URI)" || (echo "Set AWS_ECR_LOGIN_URI" && exit 1)
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(AWS_ECR_LOGIN_URI)/$(ECR_REPOSITORY_NAME):$(IMAGE_TAG)

docker-push: docker-build ecr-login docker-tag ## Build, tag, and push image to ECR
	docker push $(AWS_ECR_LOGIN_URI)/$(ECR_REPOSITORY_NAME):$(IMAGE_TAG)
	@echo "Pushed $(AWS_ECR_LOGIN_URI)/$(ECR_REPOSITORY_NAME):$(IMAGE_TAG)"

deploy-local: ## Pull latest ECR image and run on this host (self-hosted runner flow)
	@test -n "$(AWS_ECR_LOGIN_URI)" || (echo "Set AWS_ECR_LOGIN_URI" && exit 1)
	$(MAKE) ecr-login
	docker pull $(AWS_ECR_LOGIN_URI)/$(ECR_REPOSITORY_NAME):$(IMAGE_TAG)
	$(MAKE) docker-stop CONTAINER_NAME=$(CONTAINER_NAME)
	docker run -d -p $(PORT):8080 --name $(CONTAINER_NAME) \
		$(if $(wildcard .env),--env-file .env,) \
		$(AWS_ECR_LOGIN_URI)/$(ECR_REPOSITORY_NAME):$(IMAGE_TAG)
	@echo "Deployed $(AWS_ECR_LOGIN_URI)/$(ECR_REPOSITORY_NAME):$(IMAGE_TAG) on port $(PORT)"
	docker system prune -f

clean: stop docker-stop ## Remove venv/, caches, and local Docker artifacts
	rm -rf $(VENV)
	find $(ROOT) -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find $(ROOT) -type f -name '*.py[co]' -delete 2>/dev/null || true
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || true
