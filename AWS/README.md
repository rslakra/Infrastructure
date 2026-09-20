# AWS

FastAPI projects for Amazon Web Services — Docker images, ECR, and GitHub Actions CI/CD on a self-hosted EC2 runner. Each subdirectory is a standalone repository with its own Makefile, Dockerfile, and pipeline.

## Projects


| Project                                 | Description                                                               | README                                 |
| --------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| [CICD-Demo](./CICD-Demo/)               | Minimal marks calculator — learn the CI/CD flow with no external APIs     | [README](./CICD-Demo/README.md)        |
| [RAG-Based-Cortex](./RAG-Based-Cortex/) | RAG knowledge base — document upload to S3, ChromaDB indexing, OpenAI Q&A | [README](./RAG-Based-Cortex/README.md) |


Start with **CICD-Demo**, then move to **RAG-Based-Cortex** when you need OpenAI and S3 integration.

## Directory layout

```
AWS/
├── README.md
├── CICD-Demo/
└── RAG-Based-Cortex/
```

For setup, Makefile commands, environment variables, Docker, and AWS deployment, see the README inside each project.