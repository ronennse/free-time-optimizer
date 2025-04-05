# Free Time Optimizer App - Architecture Overview

## Introduction

This document provides a high-level overview of the Free Time Optimizer App's architecture, design patterns, and technical decisions. It serves as a reference for understanding the system's structure and the rationale behind key architectural choices.

## System Architecture

The Free Time Optimizer App follows a modern, multi-tier architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Presentation   │────▶│    Business     │────▶│     Data        │
│     Layer       │     │     Layer       │     │     Layer       │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Presentation Layer (Frontend)
- React.js single-page application
- Redux for state management
- React Router for navigation
- Responsive design for cross-device compatibility

### Business Layer (Backend)
- Node.js with Express.js
- RESTful API architecture
- JWT-based authentication
- Google Calendar API integration
- Activity suggestion algorithm

### Data Layer
- MongoDB database
- Mongoose ODM
- Multi-tenant data isolation

## Multi-Tenant Architecture

The application implements a multi-tenant architecture where each user's data is logically isolated:

```
┌─────────────────────────────────────────┐
│              Application                │
└─────────────────────────────────────────┘
           ┌───────┬───────┬───────┐
           │       │       │       │
           ▼       ▼       ▼       ▼
    ┌─────────┐┌─────────┐┌─────────┐┌─────────┐
    │ Tenant  ││ Tenant  ││ Tenant  ││ Tenant  │
    │    A    ││    B    ││    C    ││    D    │
    └─────────┘└─────────┘└─────────┘└─────────┘
```

- Each tenant (user) has a unique identifier
- All data models include a tenantId field
- Middleware ensures users can only access their own data
- Database queries are automatically filtered by tenant

## Key Design Patterns

### MVC Pattern
The backend follows the Model-View-Controller pattern:
- Models: MongoDB schemas (User, Activity, FreeTimeSlot, Schedule)
- Views: React components
- Controllers: Express route handlers

### Repository Pattern
Data access is abstracted through model-specific controllers that handle CRUD operations.

### Redux Pattern
Frontend state management follows the Redux pattern:
- Actions define what can happen
- Reducers specify how state changes in response to actions
- Store holds the application state

### Middleware Pattern
Express middleware is used for:
- Authentication and authorization
- Request validation
- Error handling
- Tenant isolation

## Activity Suggestion Engine

The suggestion engine is a core component that implements several algorithms:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                 Suggestion Engine                   │
│                                                     │
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐┌───────────────┐┌───────────────┐
│  Time-based   ││  Priority-    ││  Adaptive     │
│  Matching     ││  based        ││  Scheduling   │
│               ││  Scoring      ││               │
└───────────────┘└───────────────┘└───────────────┘
```

### Time-based Matching
- Matches activities to available time slots
- Considers time of day preferences
- Filters activities that fit within duration constraints

### Priority-based Scoring
- Assigns scores to activities based on multiple factors:
  - User-defined priority
  - Time of day match
  - Activity frequency (favoring less frequent activities)
  - Category balance

### Adaptive Scheduling
- Modifies activities to fit shorter time slots
- Preserves the core intent of the activity
- Provides clear explanation of adaptations

## Calendar Integration

The calendar integration module connects with Google Calendar:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Application    │────▶│  OAuth 2.0      │────▶│  Google         │
│                 │     │  Flow           │     │  Calendar API   │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- OAuth 2.0 authentication flow
- Token storage and refresh
- Calendar event retrieval
- Free time detection algorithm
- Event creation for scheduled activities

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                 Security Layers                     │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐┌───────────────┐┌───────────────┐
│  Authentication││  Authorization ││  Data         │
│  (JWT)         ││  (Middleware) ││  Isolation    │
└───────────────┘└───────────────┘└───────────────┘
```

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token expiration and refresh

### Authorization
- Role-based access control
- Tenant-based data access
- Route protection middleware

### Data Isolation
- Multi-tenant architecture
- Query filtering by tenant ID
- Validation of ownership

## Scalability Considerations

The application is designed with scalability in mind:

- Stateless backend for horizontal scaling
- Database indexing for query performance
- Caching opportunities for frequently accessed data
- Containerization support for deployment flexibility

## Technical Debt and Future Improvements

Areas identified for future improvement:

1. Implement caching layer for suggestion engine
2. Add real-time notifications using WebSockets
3. Enhance analytics for activity patterns
4. Implement offline support with service workers
5. Add machine learning for better activity recommendations

## Conclusion

The Free Time Optimizer App architecture balances modern design patterns with practical implementation choices. The multi-tenant approach ensures data isolation while the suggestion engine provides the core intelligence that makes the application valuable to users.
