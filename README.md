# Collaborative Project Management Tool

A real-time collaborative project management application built with Node.js/Express backend and React frontend, using TypeScript throughout.

## Features

- User authentication and authorization
- Project CRUD operations
- Task management within projects
- Real-time updates via WebSocket
- Team collaboration features
- Responsive design

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Sequelize ORM with SQLite
- WebSocket (Socket.IO)
- JWT Authentication

### Frontend
- React with Vite
- TypeScript
- Tailwind CSS
- Socket.IO Client

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Development Setup

1. Clone the repository:
```bash
git clone [your-repository-url]
cd collaborative-project-management
```

2. Install dependencies:

For Windows (PowerShell):
```powershell
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

For Unix-based systems:
```bash
# Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

3. Environment Setup:

Create `.env` files in both backend and frontend directories:

Backend (.env):
```
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Frontend (.env):
```
VITE_API_URL=http://localhost:3000
```

4. Start Development Servers:

In separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Deployment

### Backend Deployment (Example using Heroku)

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Add environment variables:
```bash
heroku config:set JWT_SECRET=your-production-secret
heroku config:set NODE_ENV=production
```

5. Deploy:
```bash
git push heroku main
```

### Frontend Deployment (Example using Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd frontend
vercel
```

4. For production deployment:
```bash
vercel --prod
```

Remember to update the environment variables in your deployment platform to point to your production backend URL.

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 