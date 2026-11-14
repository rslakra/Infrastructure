# Node.js MongoDB Demo App

A full-stack Node.js web application with MongoDB database, containerized with Docker. This application demonstrates a RESTful API for task management with complete CRUD operations.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB integration for data persistence
- ✅ Docker & Docker Compose setup
- ✅ Beautiful web interface
- ✅ Health check endpoints
- ✅ Structured logging with Pino
- ✅ Environment-based configuration
- ✅ Production-ready Dockerfile
- ✅ Justfile for easy command execution

## Tech Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** MongoDB 7.0
- **Logging:** Pino
- **Containerization:** Docker & Docker Compose
- **Task Runner:** Just

## Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Just](https://github.com/casey/just) (optional, for convenient commands)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd k8s-demo-app
   ```

2. **Start the application:**
   ```bash
   # Using Just
   just up-detached
   
   # Or using Docker Compose directly
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Web Interface: http://localhost:3000
   - API Health Check: http://localhost:3000/health
   - API Version: http://localhost:3000/json/version

4. **View logs:**
   ```bash
   just logs          # All services
   just logs-app      # Node.js app only
   just logs-db       # MongoDB only
   ```

5. **Stop the application:**
   ```bash
   just down
   
   # Or with Docker Compose
   docker-compose down
   ```

## API Endpoints

### Health & Info

- `GET /health` - Health check endpoint
- `GET /json/version` - API version information
- `GET /` - Web interface with API documentation

### Task Management

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/tasks` | Get all tasks | - |
| GET | `/api/tasks/:id` | Get task by ID | - |
| POST | `/api/tasks` | Create new task | `{"title": "string", "description": "string", "status": "string"}` |
| PUT | `/api/tasks/:id` | Update task | `{"title": "string", "description": "string", "status": "string"}` |
| DELETE | `/api/tasks/:id` | Delete task | - |

## API Usage Examples

### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Docker",
    "description": "Master Docker and containerization",
    "status": "in-progress"
  }'
```

### Get All Tasks
```bash
curl http://localhost:3000/api/tasks
```

### Update a Task
```bash
curl -X PUT http://localhost:3000/api/tasks/{TASK_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete a Task
```bash
curl -X DELETE http://localhost:3000/api/tasks/{TASK_ID}
```

## Just Commands

Run `just` or `just --list` to see all available commands:

### Docker Compose Commands
- `just up` - Build and start all services
- `just up-detached` - Start services in background
- `just down` - Stop all services
- `just logs` - View logs from all services
- `just status` - Show status of services

### MongoDB Commands
- `just mongo-shell` - Connect to MongoDB shell
- `just mongo-app-db` - Connect to application database
- `just mongo-backup` - Backup database
- `just mongo-stats` - Show MongoDB statistics

### API Testing Commands
- `just api-version` - Get API version
- `just api-health` - Health check
- `just api-get-tasks` - Get all tasks
- `just api-create-task` - Create a sample task
- `just api-update-task {ID}` - Update a task
- `just api-delete-task {ID}` - Delete a task

### Development Commands
- `just install` - Install dependencies locally
- `just dev` - Run in development mode
- `just start` - Run in production mode

## Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# MongoDB Configuration
MONGO_URL=mongodb://admin:password123@localhost:27017
DB_NAME=nodeapp
```

## Database Configuration

The application uses MongoDB with the following default credentials:
- **Username:** admin
- **Password:** password123
- **Database:** nodeapp
- **Collection:** tasks

**⚠️ Important:** Change these credentials in production!

## Project Structure

```
k8s-demo-app/
├── app/
│   └── server.js          # Main application file
├── deployment.yaml        # Kubernetes deployment config
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker image definition
├── Justfile              # Just command definitions
├── package.json          # Node.js dependencies
├── .env.example          # Example environment variables
├── .gitignore           # Git ignore rules
└── Readme.md            # This file
```

## Development

### Local Development (without Docker)

1. **Install MongoDB locally** or use a cloud instance

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables:**
   ```bash
   export MONGO_URL=mongodb://admin:password123@localhost:27017
   export DB_NAME=nodeapp
   export PORT=3000
   ```

4. **Run the application:**
   ```bash
   npm run dev    # Development mode with nodemon
   npm start      # Production mode
   ```

### Building Docker Image

```bash
# Using Just
just build-container

# Or using Docker directly
docker build -t k8s-demo-app:latest .
```

## Troubleshooting

### MongoDB Connection Issues

If the app can't connect to MongoDB:
1. Ensure MongoDB container is running: `docker ps`
2. Check MongoDB logs: `just logs-db`
3. Verify network connectivity: `docker network ls`

### Port Already in Use

If port 3000 or 27017 is already in use:
1. Stop existing services using those ports
2. Or modify the ports in `docker-compose.yml`

### Container Health Check Failing

1. Check application logs: `just logs-app`
2. Verify MongoDB is healthy: `just mongo-stats`
3. Test health endpoint: `curl http://localhost:3000/health`

## Kubernetes Deployment

The project includes a `deployment.yaml` file for Kubernetes deployment. To deploy:

```bash
kubectl apply -f deployment.yaml
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Author

**Rohtash Lakra**

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/)

---

Made with ❤️ using Node.js, MongoDB, and Docker