# Deployment Configuration for Free Time Optimizer App

This document outlines the deployment process for the Free Time Optimizer application.

## Prerequisites
- Node.js (v14+)
- MongoDB database
- Google OAuth credentials for Calendar API integration

## Environment Variables
The following environment variables need to be set in the production environment:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=<your_jwt_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_REDIRECT_URI=<your_redirect_uri>
```

## Build Process
1. Install dependencies: `npm install`
2. Build frontend: `cd frontend && npm run build`
3. Start server: `npm start`

## Deployment Options
- Heroku
- AWS Elastic Beanstalk
- Vercel (frontend) + MongoDB Atlas (database)
- Docker containers with Kubernetes orchestration
