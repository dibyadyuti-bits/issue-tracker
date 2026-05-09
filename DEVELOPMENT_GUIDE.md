# Issue Tracker - Development Guidelines

## Coding Standards

### Backend (Node.js/Express Microservices)
- Use ES6+ syntax
- Follow async/await pattern
- Implement proper error handling with try-catch
- Use middleware for cross-cutting concerns (auth, validation, CORS)
- Keep controllers thin, move logic to services/utils
- Use environment variables for all configuration
- Each service owns its own database (database-per-service pattern)
- Inter-service communication via HTTP (not direct DB access)

### Frontend (React)
- Use functional components with hooks
- Implement proper prop validation
- Keep components focused and reusable
- Use Context API for global state
- Implement custom hooks for logic reuse
- Follow React naming conventions
- Use Axios interceptors for API calls and error handling

## Git Workflow

1. Create feature branches: `git checkout -b feature/feature-name`
2. Make atomic commits with clear messages
3. Push changes and create pull request
4. After review, merge to main branch

### Commit Message Format
```
[TYPE] Brief description

Detailed explanation of changes if needed.

- Bullet point 1
- Bullet point 2
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## API Development Workflow

1. Identify which service owns the domain
2. Define endpoint in routes
3. Create controller for business logic
4. Add middleware for auth/validation
5. Add proxy route in Gateway `src/index.js`
6. Document in `backend/docs/API_DOCUMENTATION.md`
7. Write tests for endpoint

## Frontend Development Workflow

1. Create components in `src/components/`
2. Create views in `src/views/`
3. Define types/models if needed
4. Create services for API calls in `src/services/api.js`
5. Use Context API for state
6. Add to routing in `App.js`
7. Add tests for components

## Testing Guidelines

### Backend Testing
- Write tests for all API endpoints per service
- Test error cases and edge cases
- Use supertest for HTTP testing
- Aim for >80% code coverage
- Test inter-service communication mocks

### Frontend Testing
- Test component rendering
- Test user interactions
- Test API service calls
- Test Context API providers
- Use React Testing Library

## Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database backups taken
- [ ] Security review completed
- [ ] Performance tested
- [ ] Error logging configured

## Running Tests

### Backend Tests (per service)

Auth Service:
```bash
cd backend/services/auth
PORT=0 JWT_SECRET=test-secret JWT_EXPIRE=7d NODE_ENV=test npx jest tests/ --forceExit --runInBand
```

Issue Service:
```bash
cd backend/services/issue
PORT=0 JWT_SECRET=test-secret JWT_EXPIRE=7d NODE_ENV=test npx jest tests/ --forceExit --runInBand
```

Comment Service:
```bash
cd backend/services/comment
PORT=0 JWT_SECRET=test-secret JWT_EXPIRE=7d NODE_ENV=test npx jest tests/ --forceExit --runInBand
```

### Frontend Tests

```bash
cd frontend
CI=true npm test -- --watchAll=false
```

### Test Coverage Summary
- **Auth Service**: 36 tests (auth, user, team controllers + middleware)
- **Issue Service**: 13 tests (issue CRUD + filtering)
- **Comment Service**: 6 tests (comment CRUD)
- **Frontend**: 19 tests (all API service methods)
- **Total**: 74 tests

## Performance Optimization

### Backend
- Use database indexes per service
- Implement caching where needed
- Optimize queries
- Use connection pooling (Sequelize default)
- Compress responses

### Frontend
- Code splitting with React.lazy
- Image optimization
- Memoization for expensive components
- Virtual scrolling for large lists
- Service workers for caching

## Security Practices

- Always hash passwords (bcryptjs)
- Use HTTPS/TLS in production
- Implement CORS properly on Gateway
- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting
- Use secure headers
- Regular security audits
- JWT verification at Gateway AND service level for direct access

## Troubleshooting Guide

### Common Issues

1. **Database Connection Fails**
   - Check PostgreSQL container is running
   - Verify `.env` credentials (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
   - For Docker: ensure service names match container names

2. **API Returns 401**
   - Check JWT token in headers (`Authorization: Bearer <token>`)
   - Verify token hasn't expired
   - Check `JWT_SECRET` is identical across Gateway and all services

3. **API Returns 403**
   - Verify user has `role: 'admin'` in database
   - Check `authorize('admin')` middleware on route

4. **CORS Errors**
   - Check `CORS_ORIGIN` in Gateway `.env`
   - Check API URL in frontend `.env` (use port 5050, not 5000)
   - Clear browser cache

5. **Components Not Re-rendering**
   - Check Context API setup (providers wrapping app)
   - Verify state updates are immutable
   - Check dependency arrays in useEffect hooks

6. **"Objects are not valid as React child"**
   - Check that object fields like `issue.assignedTo` are rendered as `issue.assignedTo?.name`
   - Ensure API responses are properly destructured before rendering

7. **Service Unavailable (503)**
   - Ensure target service container is running
   - Check `AUTH_SERVICE_URL`, `ISSUE_SERVICE_URL`, `COMMENT_SERVICE_URL` in Gateway `.env`

## Resources

- Express.js Documentation: https://expressjs.com/
- React Documentation: https://react.dev/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- JWT Documentation: https://jwt.io/
- Docker Documentation: https://docs.docker.com/
- Sequelize Documentation: https://sequelize.org/
