require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const pino = require('pino');

const app = express();
app.use(express.json());

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: () => `,"time":"${new Date().toISOString()}"`
});

// MongoDB Configuration
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'NodeApp';
const COLLECTION_NAME = 'tasks';

let db;
let tasksCollection;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        logger.info(`Connected to MongoDB at ${MONGO_URL}`);

        db = client.db(DB_NAME);
        tasksCollection = db.collection(COLLECTION_NAME);

        // Create index for better performance
        await tasksCollection.createIndex({ createdAt: -1 });
        logger.info(`Connected to database: ${DB_NAME}`);
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'disconnected'
    });
});

// Get API version
app.get('/json/version', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'Node.js MongoDB Demo App',
        author: 'Rohtash Lakra'
    });
});

// Home page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Node.js MongoDB Demo App</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #333;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                h1 {
                    color: #667eea;
                    text-align: center;
                }
                .endpoints {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .endpoint {
                    margin: 10px 0;
                    padding: 10px;
                    background: white;
                    border-left: 4px solid #667eea;
                    font-family: monospace;
                }
                .method {
                    color: #28a745;
                    font-weight: bold;
                }
                .method.post { color: #ffc107; }
                .method.put { color: #17a2b8; }
                .method.delete { color: #dc3545; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Node.js MongoDB Demo App</h1>
                <p>Welcome to the Node.js and MongoDB demo application!</p>
                
                <div class="endpoints">
                    <h2>📡 Available API Endpoints:</h2>
                    <div class="endpoint">
                        <span class="method">GET</span> /health - Health check
                    </div>
                    <div class="endpoint">
                        <span class="method">GET</span> /json/version - API version info
                    </div>
                    <div class="endpoint">
                        <span class="method">GET</span> /api/tasks - Get all tasks
                    </div>
                    <div class="endpoint">
                        <span class="method">GET</span> /api/tasks/:id - Get task by ID
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span> /api/tasks - Create a new task
                    </div>
                    <div class="endpoint">
                        <span class="method put">PUT</span> /api/tasks/:id - Update a task
                    </div>
                    <div class="endpoint">
                        <span class="method delete">DELETE</span> /api/tasks/:id - Delete a task
                    </div>
                </div>
                
                <div style="margin-top: 20px; text-align: center; color: #666;">
                    <p>Database: <strong>${DB_NAME}</strong> | Collection: <strong>${COLLECTION_NAME}</strong></p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// CRUD Operations for Tasks

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await tasksCollection.find({}).sort({ createdAt: -1 }).toArray();
        logger.info(`Retrieved ${tasks.length} tasks`);
        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        logger.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks',
            message: error.message
        });
    }
});

// GET single task by ID
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID format'
            });
        }

        const task = await tasksCollection.findOne({ _id: new ObjectId(id) });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        logger.info(`Retrieved task: ${id}`);
        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        logger.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task',
            message: error.message
        });
    }
});

// CREATE new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const newTask = {
            title,
            description: description || '',
            status: status || 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await tasksCollection.insertOne(newTask);
        const createdTask = await tasksCollection.findOne({ _id: result.insertedId });

        logger.info(`Created new task: ${result.insertedId}`);
        res.status(201).json({
            success: true,
            data: createdTask
        });
    } catch (error) {
        logger.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            message: error.message
        });
    }
});

// UPDATE task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID format'
            });
        }

        const updateData = {
            updatedAt: new Date()
        };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;

        const result = await tasksCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        logger.info(`Updated task: ${id}`);
        res.json({
            success: true,
            data: result.value
        });
    } catch (error) {
        logger.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
            message: error.message
        });
    }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID format'
            });
        }

        const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        logger.info(`Deleted task: ${id}`);
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
            message: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectToMongoDB();

    app.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
        logger.info(`Visit http://localhost:${PORT} to see the app`);
    });
}

startServer();
