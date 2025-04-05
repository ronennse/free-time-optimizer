# Free Time Optimizer App - Developer Guide

## Project Overview

The Free Time Optimizer App is a full-stack application built with the MERN stack (MongoDB, Express, React, Node.js). It helps users make the most of their free time by intelligently suggesting activities based on their preferences, available time slots, and schedule.

## Architecture

The application follows a multi-tenant architecture with the following components:

### Frontend
- React.js for UI components
- Redux for state management
- React Router for navigation
- Axios for API requests

### Backend
- Node.js with Express for the server
- MongoDB for database storage
- JWT for authentication
- Google Calendar API integration

## Getting Started for Developers

### Prerequisites
- Node.js (v14+)
- MongoDB
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/free-time-optimizer.git
cd free-time-optimizer
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ..
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your MongoDB URI, JWT secret, and Google API credentials.

4. Start the development server:
```bash
npm run dev
```
This will start both the backend server and the React development server.

## Project Structure

```
free-time-optimizer/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── server.js       # Entry point
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── app/        # Redux store configuration
│   │   ├── components/ # Reusable components
│   │   ├── features/   # Redux slices
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Utility functions
│   │   ├── App.js      # Main component
│   │   └── index.js    # Entry point
│   └── package.json
├── docs/               # Documentation
├── tests/              # Test files
└── package.json
```

## Key Components

### Models

#### User Model
Stores user information, authentication details, and preferences.

#### Activity Model
Stores activities that users can do in their free time.

#### FreeTimeSlot Model
Represents available time slots detected from the user's calendar.

#### Schedule Model
Represents scheduled activities in specific time slots.

### Controllers

#### userController
Handles user registration, authentication, and profile management.

#### activityController
Manages CRUD operations for user activities.

#### freeTimeController
Detects and manages free time slots.

#### calendarController
Handles Google Calendar integration and synchronization.

#### scheduleController
Manages scheduling activities in free time slots.

#### suggestionController
Generates activity suggestions based on various factors.

### Frontend Components

#### Authentication Components
Handle user registration, login, and profile management.

#### Activity Management Components
Allow users to add, edit, and delete activities.

#### Calendar Integration Components
Facilitate connecting to Google Calendar and viewing free time slots.

#### Suggestion Components
Display activity suggestions and handle adaptive scheduling.

#### Schedule Components
Show scheduled activities and allow status updates.

## API Documentation

### Authentication Endpoints

#### POST /api/users
Register a new user.

#### POST /api/users/login
Authenticate a user and get a token.

#### GET /api/users/profile
Get the authenticated user's profile.

#### PUT /api/users/profile
Update the authenticated user's profile.

### Activity Endpoints

#### GET /api/activities
Get all activities for the authenticated user.

#### POST /api/activities
Create a new activity.

#### GET /api/activities/:id
Get a specific activity.

#### PUT /api/activities/:id
Update a specific activity.

#### DELETE /api/activities/:id
Delete a specific activity.

### Free Time Endpoints

#### GET /api/freetime
Get all free time slots for the authenticated user.

#### POST /api/freetime
Create a new free time slot.

#### GET /api/freetime/:id
Get a specific free time slot.

#### DELETE /api/freetime/:id
Delete a specific free time slot.

### Calendar Endpoints

#### GET /api/calendar/auth
Get Google Calendar authentication URL.

#### GET /api/calendar/oauth/callback
Handle OAuth callback from Google.

#### POST /api/calendar/disconnect
Disconnect Google Calendar.

#### GET /api/calendar/freetime
Detect free time slots from Google Calendar.

### Schedule Endpoints

#### GET /api/schedules
Get all schedules for the authenticated user.

#### POST /api/schedules
Create a new schedule.

#### GET /api/schedules/:id
Get a specific schedule.

#### PUT /api/schedules/:id
Update a specific schedule.

#### DELETE /api/schedules/:id
Delete a specific schedule.

### Suggestion Endpoints

#### POST /api/suggestions
Generate suggestions for a free time slot.

#### POST /api/suggestions/duration
Generate suggestions based on duration.

#### POST /api/suggestions/adapt
Adapt an activity to fit a shorter time slot.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

### Test Structure

- Frontend tests use React Testing Library and Jest
- Backend tests use Supertest and MongoDB Memory Server

## Deployment

See the [deployment documentation](deployment.md) for detailed instructions on deploying the application.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
