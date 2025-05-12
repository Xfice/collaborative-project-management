import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { initializeDatabase } from './db/config';
import { setupAssociations } from './models/associations';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import User from './models/User';
import Project from './models/Project';
import Task from './models/Task';
// @ts-ignore
import { projectRouter } from './routes/projects';
// @ts-ignore
import { taskRouter } from './routes/tasks';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle task updates
  socket.on('taskUpdate', (data) => {
    socket.broadcast.emit('taskUpdated', data);
  });

  // Handle project updates
  socket.on('projectUpdate', (data) => {
    socket.broadcast.emit('projectUpdated', data);
  });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Database connection and server start
async function startServer() {
  try {
    // Set up associations
    setupAssociations();
    
    // Force sync tables in order
    await sequelize.sync({ force: true }); // This will drop and recreate all tables
    
    console.log('Database connected and synced successfully');

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 