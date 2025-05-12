# Collaborative Project Management Tool

A real-time collaborative project management application built with Node.js, Express, React, and TypeScript.

## Features

- User authentication and authorization
- Project creation and management
- Task management with real-time updates
- Team collaboration features
- Real-time notifications
- Responsive design

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- WebSocket for real-time communication
- SQLite with Sequelize ORM
- JWT authentication

### Frontend
- React.js
- TypeScript
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Socket.io-client for real-time features

## Project Structure

```
.
├── frontend/           # React frontend application
├── backend/           # Node.js backend application
└── package.json      # Root package.json for project management
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```

   This will start both the frontend and backend servers concurrently.

   - Frontend will be available at: http://localhost:5173
   - Backend will be available at: http://localhost:3000

## Development

- Frontend development server: `npm run dev:frontend`
- Backend development server: `npm run dev:backend`
- Run all tests: `npm test`

## API Documentation

API documentation will be available at `/api-docs` when the server is running.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Submit a pull request

## License

ISC 
