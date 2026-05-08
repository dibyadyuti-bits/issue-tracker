# Issue Tracker Backend API

## Overview
This is the backend API for the Issue Tracker application built with **Node.js, Express, and a microservices architecture**. All endpoints are served through the **API Gateway** at `http://localhost:5050/api/v1`.

## Architecture

```
Frontend (Port 3000)
    │
    ▼ HTTPS/REST
API Gateway (Port 5050)
    ├── JWT Verification
    ├── CORS Handling
    └── Route Proxying
    │
    ├──► Auth Service (Port 5001)  → auth_db
    ├──► Issue Service (Port 5002) → issue_db
    └──► Comment Service (Port 5003) → comment_db
```

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (or Docker)
- npm or yarn

### Installation (Docker - Recommended)

```bash
docker-compose up --build
```

### Installation (Manual)

1. Start each service independently:
```bash
# Auth Service
cd backend/services/auth && npm install && npm run dev

# Issue Service
cd backend/services/issue && npm install && npm run dev

# Comment Service
cd backend/services/comment && npm install && npm run dev

# API Gateway
cd backend/gateway && npm install && npm run dev
```

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Admin-only endpoints additionally require the user to have `role: 'admin'`.

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register a new user |
| POST | `/api/v1/auth/login` | No | Login user and receive JWT |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "teamId": null
    }
  },
  "message": "Login successful"
}
```

---

### Users

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/v1/users` | Yes | No | Get all users |
| GET | `/api/v1/users/:id` | Yes | No | Get single user |
| PUT | `/api/v1/users/:id` | Yes | Yes | Update user (role, teamId) |

**Update User Request:**
```json
{
  "role": "admin",
  "teamId": "660e8400-e29b-41d4-a716-446655440002"
}
```

---

### Teams

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/v1/teams` | Yes | No | Get all teams with member count |
| GET | `/api/v1/teams/:id` | Yes | No | Get single team with members |
| POST | `/api/v1/teams` | Yes | Yes | Create new team |
| PUT | `/api/v1/teams/:id` | Yes | Yes | Update team name/description |
| DELETE | `/api/v1/teams/:id` | Yes | Yes | Delete team |
| PUT | `/api/v1/teams/:id/assign` | Yes | Yes | Assign user to team |
| PUT | `/api/v1/teams/:id/remove` | Yes | Yes | Remove user from team |

**Create Team Request:**
```json
{
  "name": "Platform Engineering",
  "description": "Core infrastructure team"
}
```

**Assign/Remove Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Get Teams Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "name": "Platform Engineering",
      "description": "Core infrastructure team",
      "memberCount": 3,
      "users": [
        { "id": "...", "name": "Alice", "email": "alice@example.com", "role": "user" }
      ]
    }
  ],
  "message": "Teams fetched successfully"
}
```

---

### Issues

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/issues` | No | Get all issues (enriched with user data) |
| GET | `/api/v1/issues/:id` | No | Get single issue with user data |
| POST | `/api/v1/issues` | Yes | Create new issue |
| PUT | `/api/v1/issues/:id` | Yes | Update issue (title, status, priority, assignedToId, etc.) |
| DELETE | `/api/v1/issues/:id` | Yes | Delete issue |

**Create Issue Request:**
```json
{
  "title": "Fix login bug",
  "description": "Users unable to login with correct credentials",
  "priority": "high",
  "category": "bug",
  "tags": ["authentication", "urgent"],
  "dueDate": "2024-05-15",
  "assignedToId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Update Issue Request:**
```json
{
  "status": "resolved",
  "assignedToId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Issue Response (with enriched user data):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Fix login bug",
    "description": "Users unable to login...",
    "status": "in-progress",
    "priority": "high",
    "category": "bug",
    "tags": ["authentication", "urgent"],
    "dueDate": "2024-05-15T00:00:00.000Z",
    "createdById": "550e8400-e29b-41d4-a716-446655440000",
    "assignedToId": "550e8400-e29b-41d4-a716-446655440001",
    "createdBy": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Arjun Sharma",
      "email": "arjun@tracker.com"
    },
    "assignedTo": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Priya Patel",
      "email": "priya@tracker.com"
    },
    "createdAt": "2024-05-02T10:30:00Z",
    "updatedAt": "2024-05-02T11:00:00Z"
  }
}
```

---

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/comments/issue/:issueId` | No | Get all comments for an issue |
| POST | `/api/v1/comments/issue/:issueId` | Yes | Add comment to an issue |
| DELETE | `/api/v1/comments/:id` | Yes | Delete a comment |

**Add Comment Request:**
```json
{
  "text": "Working on a fix now. ETA: EOD."
}
```

**Comments Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "text": "Working on a fix now. ETA: EOD.",
      "issueId": "660e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2024-05-02T12:00:00Z",
      "updatedAt": "2024-05-02T12:00:00Z"
    }
  ],
  "message": "Comments fetched successfully"
}
```

---

## Project Structure

```
backend/
├── gateway/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js          # Gateway JWT verification
│   │   └── index.js             # Gateway entry point + proxy routes
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
└── services/
    ├── auth/
    │   ├── src/
    │   │   ├── config/
    │   │   │   └── database.js  # PostgreSQL connection
    │   │   ├── models/
    │   │   │   ├── User.js      # User schema + bcrypt hooks
    │   │   │   └── Team.js      # Team schema
    │   │   ├── controllers/
    │   │   │   ├── authController.js   # Register/Login
    │   │   │   ├── userController.js     # User CRUD
    │   │   │   └── teamController.js     # Team CRUD + assign/remove
    │   │   ├── routes/
    │   │   │   ├── authRoutes.js
    │   │   │   ├── userRoutes.js
    │   │   │   └── teamRoutes.js
    │   │   ├── middleware/
    │   │   │   └── auth.js      # protect + authorize('admin')
    │   │   └── index.js         # Service entry point
    │   ├── package.json
    │   ├── Dockerfile
    │   └── .env.example
    │
    ├── issue/
    │   ├── src/
    │   │   ├── config/
    │   │   │   └── database.js
    │   │   ├── models/
    │   │   │   └── Issue.js     # Issue schema
    │   │   ├── controllers/
    │   │   │   └── issueController.js
    │   │   ├── routes/
    │   │   │   └── issueRoutes.js
    │   │   ├── middleware/
    │   │   │   └── auth.js
    │   │   ├── utils/
    │   │   │   └── fetchUser.js # Inter-service HTTP helper
    │   │   └── index.js
    │   ├── package.json
    │   ├── Dockerfile
    │   └── .env.example
    │
    └── comment/
        ├── src/
        │   ├── config/
        │   │   └── database.js
        │   ├── models/
        │   │   └── Comment.js   # Comment schema
        │   ├── controllers/
        │   │   └── commentController.js
        │   ├── routes/
        │   │   └── commentRoutes.js
        │   ├── middleware/
        │   │   └── auth.js
        │   └── index.js
        ├── package.json
        ├── Dockerfile
        └── .env.example
```

---

## Environment Variables

### Gateway `.env`
```
PORT=5000
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://auth-service:5001
ISSUE_SERVICE_URL=http://issue-service:5002
COMMENT_SERVICE_URL=http://comment-service:5003
CORS_ORIGIN=http://localhost:3000
```

### Auth Service `.env`
```
PORT=5001
DB_HOST=postgres-auth
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

### Issue Service `.env`
```
PORT=5002
DB_HOST=postgres-issue
DB_PORT=5432
DB_NAME=issue_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://auth-service:5001
```

### Comment Service `.env`
```
PORT=5003
DB_HOST=postgres-comment
DB_PORT=5432
DB_NAME=comment_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

---

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": "string"
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (admin required) |
| 404 | Not Found |
| 503 | Service Unavailable (downstream service down) |

---

## Testing

Run tests for each service:
```bash
cd backend/services/auth && npm test
cd backend/services/issue && npm test
cd backend/services/comment && npm test
```

## Database Schema

### User Model
- name (String)
- email (String, unique)
- password (String, hashed)
- role (String: 'user' or 'admin')
- teamId (UUID, nullable)
- createdAt (Date)
- updatedAt (Date)

### Team Model
- name (String)
- description (Text, nullable)
- createdAt (Date)
- updatedAt (Date)

### Issue Model
- title (String)
- description (Text)
- status (String: 'open', 'in-progress', 'resolved', 'closed')
- priority (String: 'low', 'medium', 'high', 'critical')
- category (String)
- tags (JSON Array)
- dueDate (Date, nullable)
- createdById (UUID)
- assignedToId (UUID, nullable)
- createdAt (Date)
- updatedAt (Date)

### Comment Model
- text (Text)
- issueId (UUID)
- userId (UUID)
- createdAt (Date)
- updatedAt (Date)
