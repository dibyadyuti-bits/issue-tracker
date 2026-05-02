# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer (Frontend)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   React Application (SPA)                                  │  │
│  │  ├── Views (Pages)                                         │  │
│  │  ├── Components (Reusable)                                 │  │
│  │  ├── Context API (State Management)                        │  │
│  │  └── Services (API Communication)                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                         HTTPS/REST
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway / Server Layer                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                         │  │
│  │  ├── Routes & Controllers                                  │  │
│  │  ├── Middleware (Auth, Validation, Error)                  │  │
│  │  ├── Business Logic                                        │  │
│  │  └── Database Layer                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                     Database Protocol
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Data Layer (Database)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                                │  │
│  │  ├── Users Table                                           │  │
│  │  ├── Issues Table                                          │  │
│  │  └── Indexes & Foreign Keys                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Frontend Component Tree
```
App
├── AuthContext Provider
├── IssueContext Provider
├── Navigation
├── Routes
│   ├── HomePage
│   ├── LoginPage
│   ├── IssuesPage
│   │   ├── Dashboard
│   │   ├── IssueList
│   │   └── IssueForm
│   └── IssueDetailPage
│       └── IssueDetail
└── Footer
```

## Data Flow

### Issue Creation Flow
1. User fills IssueForm component
2. Form submitted → onSubmit handler
3. Data sent via issueService.createIssue()
4. API call hits POST /api/v1/issues
5. Controller receives and validates data
6. Issue saved to PostgreSQL via Sequelize
7. Response sent back to frontend
8. IssueContext updated with new issue
9. Component re-renders with new data

### Authentication Flow
1. User enters credentials in AuthForm
2. Form submitted to authService.login()
3. API call hits POST /api/v1/auth/login
4. Controller verifies credentials
5. JWT token generated and returned
6. Token stored in localStorage
7. AuthContext updated with user data
8. User redirected to dashboard

## MVC Pattern Implementation

### Backend MVC
- **Model**: Sequelize models (User, Issue)
- **View**: JSON API responses
- **Controller**: Business logic handlers (authController, issueController)

### Frontend MVC
- **Model**: State (Context API, local component state)
- **View**: React components
- **Controller**: Hooks, services, event handlers

## Security Implementation

- JWT authentication for API protection
- Password hashing with bcryptjs
- Input validation on frontend and backend
- CORS configuration for cross-origin requests
- Environment variables for sensitive data

## Database Schema Relationships

```
User (1) ──── (many) Issue
  │id              ├─ createdBy (User.id)
  │               └─ assignedTo (User.id)
  │
  └──── (many) Comments
         └─ user (User.id)
```

## Error Handling

- Backend: Express error middleware catches and formats errors
- Frontend: API interceptors handle error responses
- User feedback through error components and alerts
