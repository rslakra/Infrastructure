# Ubuntu Python Development Environment with FastAPI

This project provides a Docker-based Ubuntu 24.04 LTS environment with Python 3.12 and a sample FastAPI application.

## Prerequisites

- Docker installed on your system
- [Just](https://github.com/casey/just) command runner installed

## Docker Image Details

The Dockerfile creates an Ubuntu 24.04 LTS image with:
- Python 3.12 (native Ubuntu 24.04 package)
- FastAPI web framework
- Uvicorn ASGI server
- Sample REST API with CRUD endpoints

### Configuration

The Justfile uses the following default configuration variables:
- `IMAGE_NAME`: `ubuntu-python`
- `IMAGE_TAG`: `latest`
- `CONTAINER_NAME`: `ubuntu-python-container`

You can modify these variables in the Justfile to customize the image and container names.

## Quick Start

### Build the Image
```bash
just build-image
```

### Run the Container (Starts FastAPI App)
```bash
just run-container
```
The FastAPI app will automatically start and be available at `http://localhost:8000`

### Test the FastAPI App
```bash
just test-app
```

### Access Interactive API Documentation
Open your browser and visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Access the Shell
```bash
just bash-container
```

### View Container Logs
```bash
just logs-container
```

### Stop the Container
```bash
just stop-container
```

### Check Container Status
```bash
just check-status
```

### Check Python Version
```bash
just check-python
```

### Restart (Stop, Build, Run)
```bash
just restart-container
```

### Clean Up Docker Image
```bash
just clean-image
```

### Full Cleanup (Stop Container + Remove Image)
```bash
just clean-all
```

## Available Docker Commands

| Command | Description |
|---------|-------------|
| `just build-image` | Build the ubuntu-python Docker image |
| `just run-container` | Run the container with FastAPI app (port 8000) |
| `just bash-container` | Open an interactive bash shell in the running container |
| `just logs-container` | View and follow container logs |
| `just stop-container` | Stop and remove the container |
| `just restart-container` | Complete restart workflow (stop → build → run) |
| `just check-status` | Check the current status of the container |
| `just check-python` | Check Python and pip versions in the container |
| `just test-app` | Test the FastAPI app endpoints |
| `just clean-image` | Remove the Docker image |
| `just clean-all` | Full cleanup (stop container and remove image) |

## Usage Example

```bash
# Build the image
just build-image

# Start the container (FastAPI app starts automatically)
just run-container

# Test the API
just test-app

# Or use curl to test specific endpoints
curl http://localhost:8000/
curl http://localhost:8000/health

# Exit the container shell
exit

# View logs
just logs-container

# Access the shell if needed
just bash-container

# Stop the container when done
just stop-container
```

## FastAPI Sample App

The included FastAPI application (`app.py`) provides the following endpoints:

### Available Endpoints

- `GET /` - Root endpoint with welcome message
- `GET /health` - Health check endpoint

### Interactive API Documentation

FastAPI automatically generates interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
.
├── Dockerfile              # Docker image definition
├── Justfile                # Task runner commands
├── README.md               # This file
├── requirements.txt        # Python dependencies
└── app.py                  # FastAPI sample application
```

## Notes

- The container runs the FastAPI app on port 8000 (mapped to host port 8000)
- Configuration variables (image name, tag, container name) can be customized in the Justfile
- All Docker commands use these variables for consistency and easy maintenance
- Python 3.12 is set as the default `python` and `python3` command
- Ubuntu 24.04 LTS provides native Python 3.12 support (no PPA needed)

