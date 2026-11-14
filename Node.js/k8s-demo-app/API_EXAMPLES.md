# API Testing Examples

This document provides detailed examples for testing all API endpoints.

## Prerequisites

Make sure the application is running:
```bash
just up-detached
# or
docker-compose up -d
```

## Health & Information Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected"
}
```

### Get API Version
```bash
curl http://localhost:3000/json/version
```

Response:
```json
{
  "version": "1.0.0",
  "name": "Node.js MongoDB Demo App",
  "author": "Rohtash Lakra"
}
```

## Task Management API

### 1. Create Tasks

#### Create Task - Basic
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Docker",
    "description": "Master Docker and containerization",
    "status": "pending"
  }'
```

#### Create Task - In Progress
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Node.js API",
    "description": "Create RESTful API with Express and MongoDB",
    "status": "in-progress"
  }'
```

#### Create Task - Completed
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Setup MongoDB",
    "description": "Install and configure MongoDB container",
    "status": "completed"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Learn Docker",
    "description": "Master Docker and containerization",
    "status": "pending",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

Response:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Learn Docker",
      "description": "Master Docker and containerization",
      "status": "pending",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### 3. Get Single Task by ID

Replace `{TASK_ID}` with the actual MongoDB ObjectId:

```bash
curl http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k1
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Learn Docker",
    "description": "Master Docker and containerization",
    "status": "pending",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. Update Task

#### Update Status Only
```bash
curl -X PUT http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

#### Update Multiple Fields
```bash
curl -X PUT http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Docker & Kubernetes",
    "description": "Master containerization and orchestration",
    "status": "in-progress"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Learn Docker & Kubernetes",
    "description": "Master containerization and orchestration",
    "status": "in-progress",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```

### 5. Delete Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k1
```

Response:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Error Responses

### Invalid Task ID Format
```bash
curl http://localhost:3000/api/tasks/invalid-id
```

Response (400):
```json
{
  "success": false,
  "error": "Invalid task ID format"
}
```

### Task Not Found
```bash
curl http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j999
```

Response (404):
```json
{
  "success": false,
  "error": "Task not found"
}
```

### Missing Required Field
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "description": "No title provided"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Title is required"
}
```

### Invalid Route
```bash
curl http://localhost:3000/api/invalid
```

Response (404):
```json
{
  "success": false,
  "error": "Route not found"
}
```

## Using Just Commands

For convenience, you can use the predefined Just commands:

```bash
# Get API version
just api-version

# Health check
just api-health

# Get all tasks
just api-get-tasks

# Create a sample task
just api-create-task

# Update a task (replace TASK_ID)
just api-update-task 65a1b2c3d4e5f6g7h8i9j0k1

# Delete a task (replace TASK_ID)
just api-delete-task 65a1b2c3d4e5f6g7h8i9j0k1
```

## Testing Workflow Example

Here's a complete workflow to test all functionality:

```bash
# 1. Start the application
just up-detached

# 2. Wait a few seconds for services to be ready
sleep 5

# 3. Check health
curl http://localhost:3000/health

# 4. Create some tasks
TASK1=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Task 1","description":"First task","status":"pending"}' \
  | jq -r '.data._id')

TASK2=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Task 2","description":"Second task","status":"in-progress"}' \
  | jq -r '.data._id')

# 5. Get all tasks
curl http://localhost:3000/api/tasks

# 6. Get single task
curl http://localhost:3000/api/tasks/$TASK1

# 7. Update task
curl -X PUT http://localhost:3000/api/tasks/$TASK1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# 8. Delete task
curl -X DELETE http://localhost:3000/api/tasks/$TASK2

# 9. Verify deletion
curl http://localhost:3000/api/tasks
```

## Using HTTPie (Alternative)

If you have HTTPie installed:

```bash
# Get all tasks
http GET localhost:3000/api/tasks

# Create task
http POST localhost:3000/api/tasks \
  title="Learn HTTPie" \
  description="Master HTTPie for API testing" \
  status="pending"

# Update task
http PUT localhost:3000/api/tasks/TASK_ID \
  status="completed"

# Delete task
http DELETE localhost:3000/api/tasks/TASK_ID
```

## Using Postman

Import these endpoints into Postman:

1. **Base URL:** `http://localhost:3000`
2. **Endpoints:**
   - GET `/health`
   - GET `/json/version`
   - GET `/api/tasks`
   - GET `/api/tasks/:id`
   - POST `/api/tasks` (Body: JSON)
   - PUT `/api/tasks/:id` (Body: JSON)
   - DELETE `/api/tasks/:id`

## Notes

- All successful responses include `"success": true`
- Error responses include `"success": false` and an `"error"` message
- Task IDs are MongoDB ObjectIds (24 character hex strings)
- Timestamps are in ISO 8601 format
- The API returns proper HTTP status codes (200, 201, 400, 404, 500)
