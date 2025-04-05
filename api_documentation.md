# Free Time Optimizer App - API Documentation

## Overview

This document provides detailed information about the Free Time Optimizer App's REST API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
https://your-app-domain.com/api
```

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT).

To authenticate requests, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

You can obtain a JWT token by registering or logging in using the authentication endpoints.

## Response Format

All responses are returned in JSON format. Successful responses typically include:

```json
{
  "_id": "unique_identifier",
  "field1": "value1",
  "field2": "value2",
  ...
}
```

Error responses include:

```json
{
  "message": "Error description"
}
```

## API Endpoints

### Authentication

#### Register a new user

- **URL**: `/users`
- **Method**: `POST`
- **Auth required**: No
- **Request body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "message": "User already exists"
  }
  ```

#### Login user

- **URL**: `/users/login`
- **Method**: `POST`
- **Auth required**: No
- **Request body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```
- **Error Response**: `401 Unauthorized`
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

#### Get user profile

- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "preferences": {
      "defaultActivityDuration": 30,
      "theme": "light"
    }
  }
  ```
- **Error Response**: `401 Unauthorized`
  ```json
  {
    "message": "Not authorized, no token"
  }
  ```

#### Update user profile

- **URL**: `/users/profile`
- **Method**: `PUT`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "name": "John Updated",
    "preferences": {
      "defaultActivityDuration": 45,
      "theme": "dark"
    }
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Updated",
    "email": "john@example.com",
    "preferences": {
      "defaultActivityDuration": 45,
      "theme": "dark"
    }
  }
  ```

### Activities

#### Get all activities

- **URL**: `/activities`
- **Method**: `GET`
- **Auth required**: Yes
- **Query parameters**:
  - `type` (optional): Filter by activity type
  - `priority` (optional): Filter by priority
- **Success Response**: `200 OK`
  ```json
  [
    {
      "_id": "60d21b4667d0d8992e610c86",
      "title": "Morning Yoga",
      "type": "Exercise",
      "duration": 30,
      "preferredTimeOfDay": "Morning",
      "priority": "High",
      "user": "60d21b4667d0d8992e610c85",
      "tenantId": "tenant_60d21b4667d0d8992e610c85"
    },
    {
      "_id": "60d21b4667d0d8992e610c87",
      "title": "Read a Book",
      "type": "Relaxation",
      "duration": 60,
      "preferredTimeOfDay": "Evening",
      "priority": "Medium",
      "user": "60d21b4667d0d8992e610c85",
      "tenantId": "tenant_60d21b4667d0d8992e610c85"
    }
  ]
  ```

#### Create a new activity

- **URL**: `/activities`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "title": "Morning Yoga",
    "type": "Exercise",
    "duration": 30,
    "preferredTimeOfDay": "Morning",
    "priority": "High"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "Morning Yoga",
    "type": "Exercise",
    "duration": 30,
    "preferredTimeOfDay": "Morning",
    "priority": "High",
    "user": "60d21b4667d0d8992e610c85",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```

#### Get activity by ID

- **URL**: `/activities/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` where `id` is the ID of the activity
- **Success Response**: `200 OK`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "Morning Yoga",
    "type": "Exercise",
    "duration": 30,
    "preferredTimeOfDay": "Morning",
    "priority": "High",
    "user": "60d21b4667d0d8992e610c85",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "message": "Activity not found"
  }
  ```

#### Update activity

- **URL**: `/activities/:id`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` where `id` is the ID of the activity
- **Request body**:
  ```json
  {
    "title": "Updated Yoga Session",
    "duration": 45,
    "priority": "Medium"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "Updated Yoga Session",
    "type": "Exercise",
    "duration": 45,
    "preferredTimeOfDay": "Morning",
    "priority": "Medium",
    "user": "60d21b4667d0d8992e610c85",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```

#### Delete activity

- **URL**: `/activities/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` where `id` is the ID of the activity
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Activity removed"
  }
  ```

### Free Time Slots

#### Get all free time slots

- **URL**: `/freetime`
- **Method**: `GET`
- **Auth required**: Yes
- **Query parameters**:
  - `date` (optional): Filter by date (YYYY-MM-DD)
  - `minDuration` (optional): Filter by minimum duration in minutes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "_id": "60d21b4667d0d8992e610c88",
      "start": "2025-04-05T10:00:00.000Z",
      "end": "2025-04-05T11:00:00.000Z",
      "duration": 60,
      "user": "60d21b4667d0d8992e610c85",
      "tenantId": "tenant_60d21b4667d0d8992e610c85"
    },
    {
      "_id": "60d21b4667d0d8992e610c89",
      "start": "2025-04-05T14:00:00.000Z",
      "end": "2025-04-05T15:30:00.000Z",
      "duration": 90,
      "user": "60d21b4667d0d8992e610c85",
      "tenantId": "tenant_60d21b4667d0d8992e610c85"
    }
  ]
  ```

#### Create a new free time slot

- **URL**: `/freetime`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "start": "2025-04-05T10:00:00.000Z",
    "end": "2025-04-05T11:00:00.000Z",
    "duration": 60
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c88",
    "start": "2025-04-05T10:00:00.000Z",
    "end": "2025-04-05T11:00:00.000Z",
    "duration": 60,
    "user": "60d21b4667d0d8992e610c85",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```

### Calendar Integration

#### Get Google Calendar auth URL

- **URL**: `/calendar/auth`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
  ```

#### Disconnect Google Calendar

- **URL**: `/calendar/disconnect`
- **Method**: `POST`
- **Auth required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Calendar disconnected successfully"
  }
  ```

#### Detect free time from calendar

- **URL**: `/calendar/freetime`
- **Method**: `GET`
- **Auth required**: Yes
- **Query parameters**:
  - `startDate` (optional): Start date for detection (YYYY-MM-DD)
  - `endDate` (optional): End date for detection (YYYY-MM-DD)
  - `minDuration` (optional): Minimum duration in minutes
- **Success Response**: `200 OK`
  ```json
  {
    "freeTimeSlots": [
      {
        "start": "2025-04-05T10:00:00.000Z",
        "end": "2025-04-05T11:00:00.000Z",
        "duration": 60
      },
      {
        "start": "2025-04-05T14:00:00.000Z",
        "end": "2025-04-05T15:30:00.000Z",
        "duration": 90
      }
    ]
  }
  ```

### Schedules

#### Get all schedules

- **URL**: `/schedules`
- **Method**: `GET`
- **Auth required**: Yes
- **Query parameters**:
  - `status` (optional): Filter by status (scheduled, completed, missed, adapted)
  - `date` (optional): Filter by date (YYYY-MM-DD)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "_id": "60d21b4667d0d8992e610c90",
      "activity": {
        "_id": "60d21b4667d0d8992e610c86",
        "title": "Morning Yoga",
        "type": "Exercise",
        "duration": 30
      },
      "freeTimeSlot": "60d21b4667d0d8992e610c88",
      "start": "2025-04-05T10:00:00.000Z",
      "end": "2025-04-05T10:30:00.000Z",
      "status": "scheduled",
      "user": "60d21b4667d0d8992e610c85",
      "tenantId": "tenant_60d21b4667d0d8992e610c85"
    }
  ]
  ```

#### Create a new schedule

- **URL**: `/schedules`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "activity": "60d21b4667d0d8992e610c86",
    "freeTimeSlot": "60d21b4667d0d8992e610c88",
    "start": "2025-04-05T10:00:00.000Z",
    "end": "2025-04-05T10:30:00.000Z",
    "status": "scheduled"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c90",
    "activity": "60d21b4667d0d8992e610c86",
    "freeTimeSlot": "60d21b4667d0d8992e610c88",
    "start": "2025-04-05T10:00:00.000Z",
    "end": "2025-04-05T10:30:00.000Z",
    "status": "scheduled",
    "user": "60d21b4667d0d8992e610c85",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```

#### Update schedule status

- **URL**: `/schedules/:id`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` where `id` is the ID of the schedule
- **Request body**:
  ```json
  {
    "status": "completed"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "_id": "60d21b4667d0d8992e610c90",
    "activity": "60d21b4667d0d8992e610c86",
    "freeTimeSlot": "60d21b4667d0d8992e610c88",
    "start": "2025-04-05T10:00:00.000Z",
    "end": "2025-04-05T10:30:00.000Z",
    "status": "completed",
    "user": "60d21b4667d0d8992e610c85",
    "tenantId": "tenant_60d21b4667d0d8992e610c85"
  }
  ```

### Suggestions

#### Generate suggestions for a free time slot

- **URL**: `/suggestions`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "freeTimeSlotId": "60d21b4667d0d8992e610c88",
    "timeOfDay": "Morning"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  [
    {
      "activity": {
        "_id": "60d21b4667d0d8992e610c86",
        "title": "Morning Yoga",
        "type": "Exercise",
        "duration": 30,
        "preferredTimeOfDay": "Morning",
        "priority": "High"
      },
      "score": 95,
      "reason": "High priority activity that matches your preferred time of day"
    },
    {
      "activity": {
        "_id": "60d21b4667d0d8992e610c87",
        "title": "Read a Book",
        "type": "Relaxation",
        "duration": 60,
        "preferredTimeOfDay": "Evening",
        "priority": "Medium"
      },
      "score": 75,
      "reason": "Fits within available time but not your preferred time of day"
    }
  ]
  ```

#### Generate suggestions by duration

- **URL**: `/suggestions/duration`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "duration": 30,
    "timeOfDay": "Morning"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  [
    {
      "activity": {
        "_id": "60d21b4667d0d8992e610c86",
        "title": "Morning Yoga",
        "type": "Exercise",
        "duration": 30,
        "preferredTimeOfDay": "Morning",
        "priority": "High"
      },
      "score": 95,
      "reason": "Perfect duration match and preferred time of day"
    }
  ]
  ```

#### Adapt activity to fit shorter time slot

- **URL**: `/suggestions/adapt`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "activityId": "60d21b4667d0d8992e610c87",
    "availableDuration": 30
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "adapted": {
      "title": "Quick Reading Session",
      "duration": 30,
      "originalDuration": 60,
      "adaptationReason": "Shortened to fit available time"
    }
  }
  ```

## Error Codes

- `400 Bad Request`: Invalid request parameters or data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Valid authentication but insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

API requests are limited to 100 requests per minute per user. If you exceed this limit, you'll receive a `429 Too Many Requests` response.

## Versioning

The current API version is v1. All endpoints are prefixed with `/api`.

Future API versions will be accessible via `/api/v2`, etc.

## Support

For API support, please contact api-support@your-app-domain.com.
