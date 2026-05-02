# Backend Setup Guide

This guide helps you run the Issue Tracker backend on a fresh system after cloning from Git.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker Desktop (recommended)
- OR PostgreSQL 15 installed locally

## Quick Start (Docker Compose - Recommended)

This is the easiest way. It starts all services with their own databases automatically.

```bash
# 1. Clone the repository
git clone <repository-url>
cd issue-tracker

# 2. Start all services
docker-compose up --build

# 3. Wait for health checks to pass (all databases show "healthy")
# 4. The API Gateway is ready at http://localhost:5050
```

### Verify Everything is Running

```bash
# Check all containers are up
docker-compose ps

# Test the gateway
curl http://localhost:5050/health

# Register a test user
curl -X POST http://localhost:5050/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Stop Everything

```bash
docker-compose down
```

To remove data volumes as well:
```bash
docker-compose down -v
```

---

## Manual Start (Without Docker)

Use this if you prefer running Node.js services directly on your machine.

### 1. Create PostgreSQL Databases

```bash
# Connect to PostgreSQL (adjust username if needed)
psql -U postgres

# Create databases
CREATE DATABASE auth_db;
CREATE DATABASE issue_db;
CREATE DATABASE comment_db;

# Exit
\q
```

### 2. Auth Service (Port 5001)

```bash
cd backend/services/auth

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env and set DB_PASSWORD to your PostgreSQL password

# Start the service
npm run dev
```

In a new terminal, verify:
```bash
curl http://localhost:5001/health
```

### 3. Issue Service (Port 5002)

```bash
cd backend/services/issue

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env and set DB_PASSWORD and AUTH_SERVICE_URL

# Start the service
npm run dev
```

Verify:
```bash
curl http://localhost:5002/health
```

### 4. Comment Service (Port 5003)

```bash
cd backend/services/comment

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env and set DB_PASSWORD

# Start the service
npm run dev
```

Verify:
```bash
curl http://localhost:5003/health
```

### 5. API Gateway (Port 5050)

```bash
cd backend/gateway

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Important: Set JWT_SECRET to match the same value used in all services

# Start the gateway
npm run dev
```

Verify:
```bash
curl http://localhost:5050/health
```

---

## Environment Variables Reference

### Auth Service (.env)
```
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=<your_password>
DB_DIALECT=postgres
JWT_SECRET=<same_secret_for_all_services>
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Issue Service (.env)
```
PORT=5002
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=issue_db
DB_USER=postgres
DB_PASSWORD=<your_password>
DB_DIALECT=postgres
JWT_SECRET=<same_secret_for_all_services>
AUTH_SERVICE_URL=http://localhost:5001
CORS_ORIGIN=http://localhost:3000
```

### Comment Service (.env)
```
PORT=5003
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=comment_db
DB_USER=postgres
DB_PASSWORD=<your_password>
DB_DIALECT=postgres
JWT_SECRET=<same_secret_for_all_services>
AUTH_SERVICE_URL=http://localhost:5001
CORS_ORIGIN=http://localhost:3000
```

### Gateway (.env)
```
PORT=5050
NODE_ENV=development
JWT_SECRET=<same_secret_for_all_services>
AUTH_SERVICE_URL=http://localhost:5001
ISSUE_SERVICE_URL=http://localhost:5002
COMMENT_SERVICE_URL=http://localhost:5003
CORS_ORIGIN=http://localhost:3000
API_PREFIX=/api/v1
```

---

## API Endpoints

All endpoints are accessed through the Gateway.

### Authentication (no token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Create new account |
| POST | /api/v1/auth/login | Login and get token |

### Users (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/users | List all users |
| GET | /api/v1/users/:id | Get user by ID |
| PUT | /api/v1/users/:id | Update user |

### Issues (GET is public, others require token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/issues | List all issues |
| GET | /api/v1/issues/:id | Get single issue |
| POST | /api/v1/issues | Create issue |
| PUT | /api/v1/issues/:id | Update issue |
| DELETE | /api/v1/issues/:id | Delete issue |

### Comments (GET is public, others require token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/comments/issue/:issueId | Get comments |
| POST | /api/v1/comments/issue/:issueId | Add comment |
| DELETE | /api/v1/comments/:id | Delete comment |

---

## Testing with curl

### Register
```bash
curl -X POST http://localhost:5050/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create Issue (replace <token>)
```bash
curl -X POST http://localhost:5050/api/v1/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Login Bug","description":"Users cannot login","priority":"high","status":"open"}'
```

### Get Issues
```bash
curl http://localhost:5050/api/v1/issues
```

### Add Comment
```bash
curl -X POST http://localhost:5050/api/v1/comments/issue/<issue-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"text":"Looking into this now"}'
```

---

## Troubleshooting

### Port 5000 is already in use
macOS AirPlay Receiver uses port 5000. The gateway is configured to use port 5050 instead.

### "Service unavailable" error
One of the backend services is not running. Check with:
```bash
docker-compose ps
```
or for manual setup, ensure all 4 terminals are active.

### "Not authorized" error
Your JWT token is missing, expired, or invalid. Login again to get a fresh token.

### Database connection refused
- If using Docker: wait a few more seconds for the database containers to finish starting
- If manual: verify PostgreSQL is running and the database names are correct

### Sequelize sync errors
If models fail to sync, try removing the database and letting Sequelize recreate it:
```bash
# Connect to PostgreSQL and drop/recreate
drop database auth_db;
create database auth_db;
```

---

## Architecture

```
Frontend (localhost:3000)
    |
    v
API Gateway (localhost:5050)
    |
    +---> Auth Service (localhost:5001) --> auth_db
    +---> Issue Service (localhost:5002) --> issue_db
    +---> Comment Service (localhost:5003) --> comment_db
```
