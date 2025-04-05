# Free Time Optimizer App - Deployment Guide

## Overview
This guide provides instructions for deploying the Free Time Optimizer App on your local system or to a cloud provider of your choice.

## Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- Git

## Option 1: Local Deployment

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/free-time-optimizer.git
cd free-time-optimizer
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/freetimeoptimizer
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
```

### Step 3: Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 4: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Linux/macOS
sudo service mongod start
# or
sudo systemctl start mongod

# On Windows
# MongoDB should be running as a service
```

### Step 5: Run the Application
```bash
# Run backend and frontend concurrently in development mode
npm run dev

# Or run backend and frontend separately
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Option 2: Docker Deployment

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/free-time-optimizer.git
cd free-time-optimizer
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongo:27017/freetimeoptimizer
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
```

### Step 3: Build and Run with Docker Compose
```bash
docker-compose up -d
```

The application will be available at http://localhost:5000

## Option 3: Heroku Deployment

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/free-time-optimizer.git
cd free-time-optimizer
```

### Step 2: Create a Heroku App
```bash
# Install Heroku CLI if not already installed
npm install -g heroku

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create free-time-optimizer-app

# Add MongoDB add-on
heroku addons:create mongodb:sandbox
```

### Step 3: Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret_key
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set GOOGLE_REDIRECT_URI=https://your-app-name.herokuapp.com/api/calendar/oauth/callback
```

### Step 4: Deploy to Heroku
```bash
git push heroku main
```

The application will be available at https://free-time-optimizer-app.herokuapp.com

## Google Calendar API Setup

To enable Google Calendar integration:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Set the authorized redirect URI to match your GOOGLE_REDIRECT_URI environment variable
6. Copy the Client ID and Client Secret to your environment variables

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running and accessible
- Check that your MONGO_URI is correct
- For Docker deployment, ensure the MongoDB container is running

### Google Calendar Integration Issues
- Verify your Google Cloud Console credentials
- Ensure redirect URIs match exactly
- Check that your application has the necessary API permissions

### Deployment Issues
- Check application logs: `heroku logs --tail` for Heroku
- Verify all environment variables are set correctly
- Ensure Node.js version compatibility (v14+)

## Support
For additional support, please contact support@freetimeoptimizer.com