# Database Schema Documentation - PostgreSQL

## Overview
This application uses PostgreSQL as the primary database with Sequelize ORM for data management.

---

## Tables

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `users_email_unique` (UNIQUE)
- `users_created_at_idx` (for sorting)

**Example Record**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "role": "user",
  "created_at": "2024-05-02T10:30:00Z",
  "updated_at": "2024-05-02T10:30:00Z"
}
```

---

### 2. Issues Table

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
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

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

## Relationships

```
users (1) ──── (many) issues
  │
  ├─ id ─────────────┬──→ issues.created_by_id
  │                   └──→ issues.assigned_to_id
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

### Find issues with pagination
```sql
SELECT * FROM issues 
ORDER BY created_at DESC 
LIMIT $1 OFFSET $2;
```

### Get issue with user information
```sql
SELECT 
  i.*,
  u_created.name as created_by_name,
  u_created.email as created_by_email,
  u_assigned.name as assigned_to_name,
  u_assigned.email as assigned_to_email
FROM issues i
LEFT JOIN users u_created ON i.created_by_id = u_created.id
LEFT JOIN users u_assigned ON i.assigned_to_id = u_assigned.id
WHERE i.id = $1;
```

---

## Data Validation Rules

### Users Table Validation
- Email must be unique and valid format
- Password must be at least 6 characters (hashed before storage)
- Role must be either 'user' or 'admin'
- Name is required and max 100 characters

### Issues Table Validation
- Title is required and max 200 characters
- Description is required
- Status must be one of: open, in-progress, resolved, closed
- Priority must be one of: low, medium, high, critical
- Due date must be in future if provided
- created_by_id must reference valid user
- assigned_to_id can be null (unassigned)

---

## Backup and Recovery

### Backup PostgreSQL Database
```bash
pg_dump -U postgres -h localhost issue_tracker > backup.sql
```

### Restore PostgreSQL Database
```bash
psql -U postgres -h localhost -d issue_tracker < backup.sql
```

### Docker Backup
```bash
docker exec postgres-container pg_dump -U postgres issue_tracker > backup.sql
```

---

## Database Setup

### Create Database
```sql
CREATE DATABASE issue_tracker;
```

### Create User (Optional)
```sql
CREATE USER issue_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE issue_tracker TO issue_user;
```

### Initialize Tables (via Sequelize)
```bash
npx sequelize db:migrate
```

---

## Performance Considerations

1. **Indexing**: All frequently queried columns are indexed
2. **Foreign Keys**: Cascade/Set Null options for data integrity
3. **Pagination**: Use LIMIT and OFFSET for large result sets
4. **Connection Pooling**: Sequelize manages connection pool automatically
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

1. **Comments Table**: Separate table for issue comments
2. **Attachments Table**: For file uploads
3. **Audit Logs**: Track all changes
4. **Activity Table**: Record user actions
5. **Notifications Table**: For user notifications
