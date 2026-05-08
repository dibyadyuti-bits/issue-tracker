# Architecture Overview

## System Architecture (Microservices)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer (Frontend)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   React Application (SPA)                                │  │
│  │  ├── Views (Pages)                                       │  │
│  │  ├── Components (Reusable + Layout)                      │  │
│  │  ├── Context API (State Management)                      │  │
│  │  └── Services (API Communication)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                         HTTPS/REST
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Express.js Gateway (Port 5050)                          │  │
│  ├── JWT Verification                                       │  │
│  ├── Route Proxying to Services                           │  │
│  └── Central Error Handling                               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
              HTTP/REST   HTTP/REST  HTTP/REST
                    │         │         │
┌───────────────────┐ ┌───────┴───────┐ ┌───────────────────────┐
│  Auth Service     │ │ Issue Service │ │   Comment Service     │
│  (Port 5001)      │ │ (Port 5002)   │ │   (Port 5003)         │
│  ───────────────  │ │ ───────────── │ │   ─────────────────   │
│  • Register/Login │ │ • CRUD Issues │ │   • Add Comments      │
│  • User Mgmt      │ │ • Filtering   │ │   • List Comments     │
│  • Team Mgmt      │ │ • Assignment  │ │   • Delete Comments   │
│  • JWT Issuance   │ │ • Status CRUD │ │                       │
└────────┬──────────┘ └───────┬───────┘ └───────────┬───────────┘
         │                    │                     │
    Database              Database              Database
         │                    │                     │
┌────────▼──────────┐ ┌───────▼───────┐ ┌───────────▼───────────┐
│  PostgreSQL       │ │  PostgreSQL   │ │   PostgreSQL          │
│  auth_db          │ │  issue_db     │ │   comment_db          │
│  • users          │ │  • issues     │ │   • comments          │
│  • teams          │ │               │ │                       │
└───────────────────┘ └───────────────┘ └───────────────────────┘
```

## Microservices Design

### API Gateway
- **Purpose**: Single entry point for all client requests
- **Responsibilities**:
  - JWT token verification for protected routes
  - Request routing to appropriate microservice
  - CORS handling
  - Centralized error responses
- **Port**: 5050 (host), 5000 (container)

### Auth Service
- **Purpose**: User authentication, profile, and team management
- **Database**: `auth_db` (users + teams tables)
- **Responsibilities**:
  - User registration and login
  - Password hashing with bcrypt
  - JWT token generation
  - User profile retrieval and updates (role, team)
  - Team CRUD and member assignment
- **Port**: 5001
- **Routes**:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /users`, `GET /users/:id`, `PUT /users/:id`
  - `GET /teams`, `GET /teams/:id`, `POST /teams`, `PUT /teams/:id`, `DELETE /teams/:id`
  - `PUT /teams/:id/assign`, `PUT /teams/:id/remove`

### Issue Service
- **Purpose**: Issue tracking and management
- **Database**: `issue_db` (issues table)
- **Responsibilities**:
  - Create, read, update, delete issues
  - Filter issues by status, priority, category
  - Issue assignment (via `assignedToId`)
- **Port**: 5002
- **Inter-service**: Calls Auth Service to populate `createdBy` and `assignedTo` user data
- **Routes**:
  - `GET /issues`, `GET /issues/:id`, `POST /issues`, `PUT /issues/:id`, `DELETE /issues/:id`

### Comment Service
- **Purpose**: Comments on issues
- **Database**: `comment_db` (comments table)
- **Responsibilities**:
  - Add comments to issues
  - Retrieve comments by issue
  - Delete comments
- **Port**: 5003
- **Routes**:
  - `GET /comments/issue/:issueId`, `POST /comments/issue/:issueId`, `DELETE /comments/:id`

## Component Hierarchy

### Frontend Component Tree
```
App
├── AuthContext Provider
├── IssueContext Provider
├── BrowserRouter
│   └── Layout
│       ├── AppHeader (sticky nav: Dashboard, Issues, Users, Teams, Logout)
│       ├── Routes
│       │   ├── LoginPage (public)
│       │   ├── DashboardPage (role-based stats)
│       │   ├── IssuesPage (table + filters + status dropdown + modal)
│       │   ├── NewIssuePage (create form)
│       │   ├── UserManagementPage (admin only)
│       │   └── TeamManagementPage (admin only)
│       └── AppFooter
```

## Data Flow

### Issue Creation Flow (Microservices)
1. User fills IssueForm component
2. Form submitted -> `issueService.createIssue()`
3. Request hits API Gateway (`POST /api/v1/issues`)
4. Gateway verifies JWT
5. Request proxied to Issue Service
6. Issue Service creates issue in `issue_db`
7. Response flows back through Gateway -> Frontend
8. IssueContext updated, component re-renders

### Authentication Flow (Microservices)
1. User enters credentials in AuthForm
2. `authService.login()` sends request to Gateway
3. Gateway proxies to Auth Service
4. Auth Service verifies credentials, generates JWT
5. Token returned to frontend
6. Token stored in localStorage
7. All subsequent requests include `Authorization: Bearer <token>`
8. Gateway validates token before forwarding to services

### Comment Flow (Microservices)
1. User views IssueDetail, writes comment
2. `commentService.addComment(issueId, text)`
3. Gateway validates JWT, proxies to Comment Service
4. Comment Service stores in `comment_db`
5. Comment Service returns created comment
6. Frontend appends comment to list

### Team Assignment Flow
1. Admin opens TeamManagementPage
2. Selects a team card -> detail panel loads
3. Chooses user from "Assign a user..." dropdown
4. `teamService.assignUser(teamId, userId)` sends PUT to Gateway
5. Gateway proxies to Auth Service `/teams/:id/assign`
6. Auth Service updates user's `teamId` in `auth_db`
7. Frontend updates both `teams` and `users` state locally

## Database Per Service

Each microservice owns its own PostgreSQL database:

| Service | Database | Tables |
|---------|----------|--------|
| Auth Service | `auth_db` | `users`, `teams` |
| Issue Service | `issue_db` | `issues` |
| Comment Service | `comment_db` | `comments` |

### Cross-service References
Services reference each other via UUID fields rather than foreign keys:
- `Issue.createdById` -> references a user in `auth_db`
- `Issue.assignedToId` -> references a user in `auth_db`
- `User.teamId` -> references a team in `auth_db`
- `Comment.issueId` -> references an issue in `issue_db`
- `Comment.userId` -> references a user in `auth_db`

## Communication Patterns

### Synchronous (HTTP)
- Gateway -> Auth Service (register/login/users/teams)
- Gateway -> Issue Service (issue CRUD)
- Gateway -> Comment Service (comment CRUD)
- Issue Service -> Auth Service (fetch user details for response enrichment)

### Asynchronous (Future Enhancement)
- Redis pub/sub for cross-service events (e.g., issue assigned -> notify user)

## Security Implementation

- JWT authentication at API Gateway layer
- Each service independently validates JWT for direct access
- Password hashing with bcryptjs in Auth Service
- Role-based authorization (`protect` + `authorize('admin')`)
- CORS configured on Gateway
- Environment variables for all secrets
- Database isolation per service

## Error Handling

- Gateway: Catches proxy errors and returns 503 for unavailable services
- Services: Express error middleware formats and returns JSON errors
- Frontend: Axios interceptors handle HTTP error responses

## Deployment

### Docker Compose
All services can be started together:
```bash
docker-compose up --build
```

### Independent Deployment
Each service can be deployed independently:
```bash
# Auth Service
cd backend/services/auth && npm install && npm run dev

# Issue Service
cd backend/services/issue && npm install && npm run dev

# Comment Service
cd backend/services/comment && npm install && npm run dev

# Gateway
cd backend/gateway && npm install && npm run dev
```
