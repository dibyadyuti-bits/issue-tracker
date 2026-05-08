# Complete Issue Tracker Project Structure - Visual Guide

## Complete File Tree

```
issue-tracker/
│
├── README.md                              # Main project overview
├── ARCHITECTURE.md                        # System design & data flow
├── DATABASE_SCHEMA.md                     # PostgreSQL tables (per-service)
├── DEVELOPMENT_GUIDE.md                   # Coding standards & best practices
├── AI_USAGE_LOG.md                        # AI tools usage & reflection report
├── IMPLEMENTATION_CHECKLIST.md            # Development & deployment checklist
├── docker-compose.yml                     # Docker orchestration
├── .gitignore                             # Git ignore configuration
│
│
├── BACKEND (/backend/)
│   │
│   ├── gateway/                           # API Gateway (Port 5050)
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   │   └── auth.js               # Gateway JWT verification
│   │   │   └── index.js                  # Proxy routes to services
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── services/
│       │
│       ├── auth/                          # Auth Service (Port 5001)
│       │   ├── src/
│       │   │   ├── config/
│       │   │   │   └── database.js       # auth_db PostgreSQL connection
│       │   │   ├── models/
│       │   │   │   ├── User.js           # User schema + password hashing
│       │   │   │   └── Team.js           # Team schema
│       │   │   ├── controllers/
│       │   │   │   ├── authController.js # Login & Register handlers
│       │   │   │   ├── userController.js # User management handlers
│       │   │   │   └── teamController.js # Team CRUD + assign/remove
│       │   │   ├── routes/
│       │   │   │   ├── authRoutes.js     # Authentication endpoints
│       │   │   │   ├── userRoutes.js     # User endpoints
│       │   │   │   └── teamRoutes.js     # Team endpoints
│       │   │   ├── middleware/
│       │   │   │   └── auth.js           # protect + authorize('admin')
│       │   │   └── index.js              # Service entry point
│       │   ├── package.json
│       │   ├── Dockerfile
│       │   └── .env.example
│       │
│       ├── issue/                         # Issue Service (Port 5002)
│       │   ├── src/
│       │   │   ├── config/
│       │   │   │   └── database.js       # issue_db PostgreSQL connection
│       │   │   ├── models/
│       │   │   │   └── Issue.js          # Issue schema
│       │   │   ├── controllers/
│       │   │   │   └── issueController.js # Issue CRUD operations
│       │   │   ├── routes/
│       │   │   │   └── issueRoutes.js    # Issue endpoints
│       │   │   ├── middleware/
│       │   │   │   └── auth.js           # JWT verification
│       │   │   ├── utils/
│       │   │   │   └── fetchUser.js      # Inter-service HTTP helper
│       │   │   └── index.js              # Service entry point
│       │   ├── package.json
│       │   ├── Dockerfile
│       │   └── .env.example
│       │
│       └── comment/                       # Comment Service (Port 5003)
│           ├── src/
│           │   ├── config/
│           │   │   └── database.js       # comment_db PostgreSQL connection
│           │   ├── models/
│           │   │   └── Comment.js        # Comment schema
│           │   ├── controllers/
│           │   │   └── commentController.js # Comment CRUD operations
│           │   ├── routes/
│           │   │   └── commentRoutes.js  # Comment endpoints
│           │   ├── middleware/
│           │   │   └── auth.js           # JWT verification
│           │   └── index.js              # Service entry point
│           ├── package.json
│           ├── Dockerfile
│           └── .env.example
│
│
├── FRONTEND (/frontend/)
│   │
│   ├── package.json                       # React dependencies & scripts
│   ├── .env.example                       # Environment variables template
│   ├── .gitignore                         # Frontend specific ignore rules
│   ├── README.md                          # Frontend setup guide
│   │
│   ├── public/
│   │   └── index.html                     # HTML entry point
│   │
│   └── src/
│       │
│       ├── index.js                       # React entry point
│       ├── App.js                         # Main App component with routing
│       ├── App.css                        # App styling
│       ├── index.css                      # Global styles
│       │
│       ├── components/
│       │   ├── Layout.js                  # Shared header + footer
│       │   ├── IssueList.js               # Issue list display
│       │   ├── IssueForm.js               # Issue creation/edit form
│       │   ├── IssueDetail.js             # Issue detail view
│       │   └── AuthForm.js                # Login/Register form
│       │
│       ├── views/
│       │   ├── LoginPage.js               # Login page
│       │   ├── DashboardPage.js           # Role-based dashboard
│       │   ├── IssuesPage.js              # Issues management + filters
│       │   ├── NewIssuePage.js            # Dedicated create issue page
│       │   ├── UserManagementPage.js        # Admin user management
│       │   └── TeamManagementPage.js      # Admin team management
│       │
│       ├── context/
│       │   ├── AuthContext.js             # Auth state management
│       │   └── IssueContext.js            # Issue state management
│       │
│       ├── services/
│       │   └── api.js                     # API communication layer
│       │
│       ├── styles/
│       │   ├── layout.css                 # Header, footer, nav styles
│       │   ├── dashboard.css              # Dashboard statistics styles
│       │   ├── issues.css                 # Issues page styles
│       │   ├── admin.css                  # Admin pages styles
│       │   └── global.css                 # Global styling
│       │
│       └── utils/
│           └── helpers.js                 # Utility functions

```

---

## File Statistics

### Gateway Files
| Category | Count | Location |
|----------|-------|----------|
| Middleware | 1 | `src/middleware/` |
| Config/Entry | 1 | `src/index.js` |
| Config Files | 3 | Root (package.json, Dockerfile, .env.example) |
| **Total Gateway** | **5** | |

### Auth Service Files
| Category | Count | Location |
|----------|-------|----------|
| Controllers | 3 | `src/controllers/` |
| Models | 2 | `src/models/` |
| Routes | 3 | `src/routes/` |
| Middleware | 1 | `src/middleware/` |
| Config | 2 | `src/config/`, `src/index.js` |
| Config Files | 3 | Root |
| **Total Auth** | **14** | |

### Issue Service Files
| Category | Count | Location |
|----------|-------|----------|
| Controllers | 1 | `src/controllers/` |
| Models | 1 | `src/models/` |
| Routes | 1 | `src/routes/` |
| Middleware | 1 | `src/middleware/` |
| Utils | 1 | `src/utils/` |
| Config | 2 | `src/config/`, `src/index.js` |
| Config Files | 3 | Root |
| **Total Issue** | **10** | |

### Comment Service Files
| Category | Count | Location |
|----------|-------|----------|
| Controllers | 1 | `src/controllers/` |
| Models | 1 | `src/models/` |
| Routes | 1 | `src/routes/` |
| Middleware | 1 | `src/middleware/` |
| Config | 2 | `src/config/`, `src/index.js` |
| Config Files | 3 | Root |
| **Total Comment** | **9** | |

### Frontend Files
| Category | Count | Location |
|----------|-------|----------|
| Components | 5 | `src/components/` |
| Views | 6 | `src/views/` |
| Context | 2 | `src/context/` |
| Services | 1 | `src/services/` |
| Styles | 5 | `src/styles/` + root |
| Utils | 1 | `src/utils/` |
| Entry Points | 3 | `src/` |
| Public | 1 | `public/` |
| Config Files | 3 | Root |
| **Total Frontend** | **27** | |

### Documentation Files
| Document | Purpose |
|----------|---------|
| README.md | Main project overview |
| ARCHITECTURE.md | System architecture |
| DATABASE_SCHEMA.md | Database design (per-service) |
| DEVELOPMENT_GUIDE.md | Best practices |
| AI_USAGE_LOG.md | AI tools reflection |
| IMPLEMENTATION_CHECKLIST.md | Development checklist |
| backend/docs/API_DOCUMENTATION.md | API reference |

---

## Data & Component Relationships

### Backend API Structure
```
Authentication (Auth Service)
├── POST /api/v1/auth/register
└── POST /api/v1/auth/login

Users (Auth Service)
├── GET /api/v1/users
├── GET /api/v1/users/:id
└── PUT /api/v1/users/:id

Teams (Auth Service)
├── GET /api/v1/teams
├── GET /api/v1/teams/:id
├── POST /api/v1/teams
├── PUT /api/v1/teams/:id
├── DELETE /api/v1/teams/:id
├── PUT /api/v1/teams/:id/assign
└── PUT /api/v1/teams/:id/remove

Issues (Issue Service)
├── GET /api/v1/issues
├── GET /api/v1/issues/:id
├── POST /api/v1/issues
├── PUT /api/v1/issues/:id
└── DELETE /api/v1/issues/:id

Comments (Comment Service)
├── GET /api/v1/comments/issue/:issueId
├── POST /api/v1/comments/issue/:issueId
└── DELETE /api/v1/comments/:id
```

### Frontend Component Hierarchy
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

---

## Quick Navigation Guide

### If You Want To...

**Learn About the Project**
- Start with: `README.md`
- Then read: `ARCHITECTURE.md`

**Set Up with Docker**
- Copy: All `.env.example` files to `.env`
- Run: `docker-compose up --build`
- Gateway: `http://localhost:5050`

**Set Up Frontend**
- Copy: `frontend/.env.example` to `.env`
- Run: `cd frontend && npm install && npm start`

**Understand API Endpoints**
- Read: `backend/docs/API_DOCUMENTATION.md`
- Test: Use Postman with Gateway at `http://localhost:5050/api/v1`

**Understand Database**
- Read: `DATABASE_SCHEMA.md`
- View: Models in each service's `src/models/` folder

**Find Code To Implement**
- Controllers: `backend/services/*/src/controllers/`
- Components: `frontend/src/components/`
- Services: `frontend/src/services/api.js`

**Understand Best Practices**
- Read: `DEVELOPMENT_GUIDE.md`
- See examples in: Controllers and Components

**Follow Implementation**
- Use: `IMPLEMENTATION_CHECKLIST.md`

---

## Key Features Summary

### Implemented
- User Authentication (Register/Login) with JWT
- Role-based Authorization (user / admin)
- Issue CRUD with inline status dropdowns
- Issue filtering by status, priority, category
- Comments on issues
- Team Management (create, assign, remove, delete)
- User Management (inline role changes, team assignment)
- Role-based Dashboard (admin = global stats, user = personal stats)
- Responsive UI with shared Layout (header + footer)
- Dedicated New Issue page
- Microservices with API Gateway
- Database per service
- Docker Compose orchestration

---

## File Dependencies

```
Frontend/Components
    |
    ▼
services/api.js
    |
    ▼
Context (AuthContext, IssueContext)
    |
    ▼
API Gateway (Port 5050)
    |
    ├──► Auth Service (Port 5001)
    ├──► Issue Service (Port 5002)
    └──► Comment Service (Port 5003)
         |
         ▼
    Models/Schemas
         |
         ▼
    Database (PostgreSQL per service)
```

---

## Security Features Included

- Password hashing with bcryptjs
- JWT token authentication at Gateway + services
- Authorization middleware (`protect` + `authorize('admin')`)
- Input validation
- CORS configuration
- Environment variables for all secrets
- Token expiration
- Database isolation per service

---

## Important Notes

1. **Environment Variables**: Never commit `.env` files - always use `.env.example`
2. **Databases**: Three PostgreSQL instances (auth_db, issue_db, comment_db)
3. **API URL**: Frontend calls Gateway at `http://localhost:5050/api/v1`
4. **JWT Secret**: Must be identical across Gateway and all services
5. **Development**: Use `docker-compose up --build` to start all services
6. **Production**: Build frontend with `npm run build`

---

## Next Steps

1. Copy all `.env.example` files to `.env` and fill values
2. Run `docker-compose up --build`
3. Start frontend: `cd frontend && npm install && npm start`
4. Log in with seeded credentials:
   - Admin: `arjun@tracker.com` / `password123`
   - User: `vikram@tracker.com` / `password123`
5. Test all features
6. Update documentation as needed

---

**Happy Coding!**

This microservices architecture is ready for scalable full-stack development.
