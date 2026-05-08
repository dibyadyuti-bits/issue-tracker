# Issue Tracker Application - Full Stack Project (Microservices)

A full-stack web application for tracking and managing issues, built with **React** (frontend) and **Node.js/Express microservices** (backend).

## Project Overview

This application allows users to create, manage, and track issues with features like:
- User authentication and role-based access (user / admin)
- Team management (create teams, assign users, view team issues)
- User management (inline role changes, team assignment)
- Issue creation, update, and deletion (CRUD operations)
- Issue filtering by status, priority, and category
- Inline status changes via dropdown
- Comments on issues
- Dashboard with role-specific statistics
- Responsive UI

## Architecture

The backend follows a **microservices architecture** with:
- **API Gateway**: Single entry point (port 5050)
- **Auth Service**: User authentication (port 5001)
- **Issue Service**: Issue management (port 5002)
- **Comment Service**: Comment management (port 5003)

Each service has its own PostgreSQL database.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (per service)
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Gateway**: http-proxy-middleware
- **Containerization**: Docker + Docker Compose

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **Styling**: CSS3

## Project Structure

```
issue-tracker/
├── backend/
│   ├── gateway/                # API Gateway (port 5000)
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   │   └── auth.js
│   │   │   └── index.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── services/
│       ├── auth/               # Auth Service (port 5001)
│       │   ├── src/
│       │   │   ├── config/
│       │   │   ├── controllers/
│       │   │   ├── models/
│       │   │   ├── routes/
│       │   │   ├── middleware/
│       │   │   └── index.js
│       │   ├── package.json
│       │   ├── Dockerfile
│       │   └── .env.example
│       │
│       ├── issue/              # Issue Service (port 5002)
│       │   ├── src/
│       │   │   ├── config/
│       │   │   ├── controllers/
│       │   │   ├── models/
│       │   │   ├── routes/
│       │   │   ├── middleware/
│       │   │   ├── utils/
│       │   │   └── index.js
│       │   ├── package.json
│       │   ├── Dockerfile
│       │   └── .env.example
│       │
│       └── comment/            # Comment Service (port 5003)
│           ├── src/
│           │   ├── config/
│           │   ├── controllers/
│           │   ├── models/
│           │   ├── routes/
│           │   ├── middleware/
│           │   └── index.js
│           ├── package.json
│           ├── Dockerfile
│           └── .env.example
│
├── frontend/                   # React Frontend (port 3000)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── views/
│   │   ├── services/
│   │   └── App.js
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml          # Orchestrates all services
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (or Docker)
- npm or yarn
- Docker & Docker Compose (optional, recommended)

### Option 1: Docker Compose (Recommended)

1. Clone the repository
2. Create `.env` files from `.env.example` in each service folder
3. Run all services:
   ```bash
   docker-compose up --build
   ```

4. The API Gateway will be available at `http://localhost:5050`
5. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Option 2: Manual Setup

#### 1. Create PostgreSQL Databases
```sql
CREATE DATABASE auth_db;
CREATE DATABASE issue_db;
CREATE DATABASE comment_db;
```

#### 2. Auth Service
```bash
cd backend/services/auth
cp .env.example .env
npm install
npm run dev
```

#### 3. Issue Service
```bash
cd backend/services/issue
cp .env.example .env
npm install
npm run dev
```

#### 4. Comment Service
```bash
cd backend/services/comment
cp .env.example .env
npm install
npm run dev
```

#### 5. API Gateway
```bash
cd backend/gateway
cp .env.example .env
npm install
npm run dev
```

#### 6. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## API Documentation

All endpoints are served through the API Gateway at `http://localhost:5050/api/v1`.

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users
- `GET /api/v1/users` - Get all users (protected)
- `GET /api/v1/users/:id` - Get single user (protected)
- `PUT /api/v1/users/:id` - Update user (protected, admin can change role and teamId)

### Teams
- `GET /api/v1/teams` - Get all teams with members (protected)
- `GET /api/v1/teams/:id` - Get single team with members (protected)
- `POST /api/v1/teams` - Create new team (protected, admin only)
- `PUT /api/v1/teams/:id` - Update team (protected, admin only)
- `DELETE /api/v1/teams/:id` - Delete team (protected, admin only)
- `PUT /api/v1/teams/:id/assign` - Assign user to team (protected, admin only)
- `PUT /api/v1/teams/:id/remove` - Remove user from team (protected, admin only)

### Issues
- `GET /api/v1/issues` - Get all issues
- `GET /api/v1/issues/:id` - Get single issue
- `POST /api/v1/issues` - Create new issue (protected)
- `PUT /api/v1/issues/:id` - Update issue (protected)
- `DELETE /api/v1/issues/:id` - Delete issue (protected)

### Comments
- `GET /api/v1/comments/issue/:issueId` - Get comments for an issue
- `POST /api/v1/comments/issue/:issueId` - Add comment (protected)
- `DELETE /api/v1/comments/:id` - Delete comment (protected)

## Database Schema

### Auth Service (auth_db)

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  team_id UUID NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Issue Service (issue_db)

#### issues
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  category VARCHAR(100) DEFAULT 'general',
  tags JSON DEFAULT '[]',
  due_date TIMESTAMP NULL,
  created_by_id UUID NOT NULL,
  assigned_to_id UUID NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Comment Service (comment_db)

#### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  issue_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/` | LoginPage | Public |
| `/dashboard` | DashboardPage | Authenticated |
| `/issues` | IssuesPage | Authenticated |
| `/issues/new` | NewIssuePage | Authenticated |
| `/admin/users` | UserManagementPage | Admin only |
| `/admin/teams` | TeamManagementPage | Admin only |

## Features

### Core Features
- User Authentication (Login/Register)
- JWT Token-based Authorization
- Create/Read/Update/Delete Issues
- Filter Issues by Status, Priority, Category
- Inline Status Changes via Dropdown
- Add Comments to Issues
- Dashboard with Statistics
- Responsive UI Design
- Shared Header/Footer Layout

### Admin Features
- Team Management (create, delete, assign/remove members)
- User Management (inline role changes, team assignment)
- Team-level Issue Overview (stats + issue list per team)
- Role-based Dashboard (admin sees global stats, user sees personal stats)

### Microservices Features
- Independent service deployment
- Database per service
- API Gateway for unified access
- Inter-service communication (HTTP)
- Docker containerization

## Development Guide

### Adding a New API Endpoint

1. Identify which service owns the domain
2. Create controller in `backend/services/<service>/src/controllers/`
3. Create routes in `backend/services/<service>/src/routes/`
4. Add route to Gateway proxy config in `backend/gateway/src/index.js`
5. Test endpoint through Gateway

### Adding a New Microservice

1. Create folder in `backend/services/<new-service>/`
2. Add `package.json`, `Dockerfile`, `.env.example`
3. Implement standard structure: `config/`, `models/`, `controllers/`, `routes/`, `middleware/`
4. Add database connection in `config/database.js`
5. Add proxy route in Gateway `src/index.js`
6. Add service to `docker-compose.yml`

## Testing

### Backend Tests
Each service has its own test suite:
```bash
cd backend/services/auth && npm test
cd backend/services/issue && npm test
cd backend/services/comment && npm test
```

### Frontend Tests
```bash
cd frontend && npm test
```

## AI Tools Usage

This project was developed with assistance from AI tools including:
- GitHub Copilot
- Claude AI
- Cursor IDE

See [AI_USAGE_LOG.md](./AI_USAGE_LOG.md) for detailed information.

## Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Individual Services
Each service can be deployed independently to platforms like Heroku, AWS, or DigitalOcean.

## Troubleshooting

### PostgreSQL Connection Issues
- Ensure PostgreSQL is running locally
- Check connection credentials in each service `.env` file
- Verify the databases exist

### Service Unavailable (503)
- Ensure the target service is running
- Check `AUTH_SERVICE_URL`, `ISSUE_SERVICE_URL`, `COMMENT_SERVICE_URL` in Gateway `.env`

### Authentication Issues
- Ensure `JWT_SECRET` is identical across all services and the Gateway
- Check token expiration time

## License

MIT License
