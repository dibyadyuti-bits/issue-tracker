# Database Schema Documentation - PostgreSQL (Microservices)

## Overview
This application uses a **database-per-service** pattern with PostgreSQL and Sequelize ORM. Each microservice owns its own database to ensure independence and data isolation.

| Service | Database | Tables |
|---------|----------|--------|
| Auth Service | `auth_db` | `users`, `teams` |
| Issue Service | `issue_db` | `issues` |
| Comment Service | `comment_db` | `comments` |

Cross-service references are maintained via UUID fields (not foreign keys) to keep services decoupled.

---

## Auth Service (`auth_db`)

### 1. Users Table

**Table Name**: `users`

**Columns**:
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

**Indexes**:
- `users_email_unique` (UNIQUE)
- `users_created_at_idx` (for sorting)

**Associations**:
- `User.belongsTo(Team)` via `team_id`
- `Team.hasMany(User)` via `team_id`

**Example Record**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Arjun Sharma",
  "email": "arjun@tracker.com",
  "password": "$2a$10$...",
  "role": "admin",
  "team_id": "660e8400-e29b-41d4-a716-446655440002",
  "created_at": "2024-05-02T10:30:00Z",
  "updated_at": "2024-05-02T10:30:00Z"
}
```

---

### 2. Teams Table

**Table Name**: `teams`

**Columns**:
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `teams_name_idx` (for lookups)

**Associations**:
- `Team.hasMany(User)` via `team_id` on `users` table
- `User.belongsTo(Team)` via `team_id`

**Example Record**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "name": "Platform Engineering",
  "description": "Core infrastructure and platform team",
  "created_at": "2024-05-02T10:30:00Z",
  "updated_at": "2024-05-02T10:30:00Z"
}
```

---

## Issue Service (`issue_db`)

### 3. Issues Table

**Table Name**: `issues`

**Columns**:
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

**Cross-Service References**:
- `created_by_id` -> references a user in `auth_db.users`
- `assigned_to_id` -> references a user in `auth_db.users`

**Indexes**:
- `issues_created_by_id_idx` (for foreign key queries)
- `issues_assigned_to_id_idx` (for foreign key queries)
- `issues_status_idx` (for filtering)
- `issues_priority_idx` (for filtering)
- `issues_created_at_idx` (for sorting)
- `(status, priority)` (compound index)

**Example Record**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Fix login bug",
  "description": "Users unable to login with correct credentials",
  "status": "in-progress",
  "priority": "high",
  "category": "bug",
  "tags": ["authentication", "urgent"],
  "due_date": "2024-05-15T00:00:00Z",
  "created_by_id": "550e8400-e29b-41d4-a716-446655440000",
  "assigned_to_id": "550e8400-e29b-41d4-a716-446655440001",
  "created_at": "2024-05-02T10:30:00Z",
  "updated_at": "2024-05-02T11:00:00Z"
}
```

---

## Comment Service (`comment_db`)

### 4. Comments Table

**Table Name**: `comments`

**Columns**:
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

**Cross-Service References**:
- `issue_id` -> references an issue in `issue_db.issues`
- `user_id` -> references a user in `auth_db.users`

**Indexes**:
- `comments_issue_id_idx` (for filtering by issue)
- `comments_user_id_idx` (for filtering by user)
- `comments_created_at_idx` (for sorting)

**Example Record**:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "text": "Working on a fix now. ETA: EOD.",
  "issue_id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "created_at": "2024-05-02T12:00:00Z",
  "updated_at": "2024-05-02T12:00:00Z"
}
```

---

## Relationships (Logical)

```
auth_db.users (1) ────┬─── (many) issue_db.issues (created_by_id)
       │              └─── (many) issue_db.issues (assigned_to_id)
       │
       ├── (many) comment_db.comments (user_id)
       │
       └── (many) auth_db.teams (team_id)

issue_db.issues (1) ──── (many) comment_db.comments (issue_id)
```

---

## SQL Queries

### Find all open issues
```sql
SELECT * FROM issues WHERE status = 'open' ORDER BY created_at DESC;
```

### Find issues assigned to a user
```sql
SELECT * FROM issues WHERE assigned_to_id = $1 ORDER BY created_at DESC;
```

### Find high priority issues
```sql
SELECT * FROM issues WHERE priority IN ('high', 'critical') ORDER BY created_at DESC;
```

### Count issues by status
```sql
SELECT status, COUNT(*) as count FROM issues GROUP BY status;
```

### Find comments for an issue
```sql
SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at DESC;
```

### Find users on a team
```sql
SELECT * FROM users WHERE team_id = $1;
```

### Find team with member count
```sql
SELECT t.*, COUNT(u.id) as member_count
FROM teams t
LEFT JOIN users u ON u.team_id = t.id
WHERE t.id = $1
GROUP BY t.id;
```

---

## Data Validation Rules

### Users Table Validation
- Email must be unique and valid format
- Password must be at least 6 characters (hashed before storage)
- Role must be either 'user' or 'admin'
- Name is required and max 100 characters
- `team_id` can be null (unassigned)

### Teams Table Validation
- Name is required and max 100 characters
- Description is optional

### Issues Table Validation
- Title is required and max 200 characters
- Description is required
- Status must be one of: open, in-progress, resolved, closed
- Priority must be one of: low, medium, high, critical
- Due date must be in future if provided
- `created_by_id` must reference valid user
- `assigned_to_id` can be null (unassigned)

### Comments Table Validation
- Text is required
- `issue_id` must reference valid issue
- `user_id` must reference valid user

---

## Backup and Recovery

### Backup All Databases
```bash
# Auth DB
docker exec postgres-auth pg_dump -U postgres auth_db > auth_db_backup.sql

# Issue DB
docker exec postgres-issue pg_dump -U postgres issue_db > issue_db_backup.sql

# Comment DB
docker exec postgres-comment pg_dump -U postgres comment_db > comment_db_backup.sql
```

### Restore All Databases
```bash
# Auth DB
docker exec -i postgres-auth psql -U postgres -d auth_db < auth_db_backup.sql

# Issue DB
docker exec -i postgres-issue psql -U postgres -d issue_db < issue_db_backup.sql

# Comment DB
docker exec -i postgres-comment psql -U postgres -d comment_db < comment_db_backup.sql
```

---

## Database Setup

### Create Databases (Manual Setup)
```sql
CREATE DATABASE auth_db;
CREATE DATABASE issue_db;
CREATE DATABASE comment_db;
```

### Initialize Tables (via Sequelize)
In development, Sequelize `sync({ alter: true })` automatically creates and updates tables.

---

## Performance Considerations

1. **Indexing**: All frequently queried columns are indexed
2. **Cross-service queries**: Issue Service calls Auth Service via HTTP to enrich `createdBy` and `assignedTo` data
3. **Pagination**: Use LIMIT and OFFSET for large result sets
4. **Connection Pooling**: Sequelize manages connection pool automatically per service
5. **Query Optimization**: Use indexes for WHERE and JOIN clauses
6. **JSON Storage**: Tags stored as JSON for flexibility

---

## Enum Types

### Status Enum
- `open` - Issue is newly created
- `in-progress` - Someone is working on it
- `resolved` - Issue has been fixed
- `closed` - Issue is closed (duplicate/not-an-issue)

### Priority Enum
- `low` - Can be addressed later
- `medium` - Normal priority
- `high` - Should be addressed soon
- `critical` - Urgent, affects users

### Role Enum (Users)
- `user` - Regular user
- `admin` - Administrator with elevated permissions

---

## Future Enhancements

1. **Attachments Table**: For file uploads linked to issues
2. **Audit Logs**: Track all changes across services
3. **Activity Table**: Record user actions
4. **Notifications Table**: For user notifications
5. **Redis Pub/Sub**: Cross-service event propagation
