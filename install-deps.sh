#!/bin/bash

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/sequelize express cors dotenv bcryptjs jsonwebtoken sequelize sqlite3 socket.io zod typescript ts-node-dev @types/socket.io --save-dev
npm install

# Install frontend dependencies
cd ../frontend
npm install @types/react @types/react-dom @types/react-router-dom react react-dom react-router-dom axios @headlessui/react @heroicons/react socket.io-client zod zustand tailwindcss postcss autoprefixer typescript @vitejs/plugin-react vite --save-dev
npm install

# Return to root directory
cd .. 