# Issue Tracker Application - Full Stack Project

A comprehensive full-stack web application for tracking and managing issues, built with React (frontend) and Node.js/Express (backend).

## Project Overview

This application allows users to create, manage, and track issues with features like:
- User authentication and role-based access
- Issue creation, update, and deletion (CRUD operations)
- Issue filtering by status, priority, and category
- Comments on issues
- Dashboard with issue statistics
- Responsive UI

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs

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
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── controllers/    # Business logic handlers
│   │   ├── models/         # Database schemas (User, Issue)
│   │   ├── routes/         # API endpoint definitions
│   │   ├── middleware/     # Authentication and error handling
│   │   ├── validators/     # Input validation logic
│   │   ├── services/       # Service layer
│   │   ├── utils/          # Helper functions
│   │   └── index.js        # Server entry point
│   ├── tests/              # Test files
│   ├── docs/               # API documentation
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # Context API providers
│   │   ├── controllers/    # UI logic handlers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── models/         # Data type definitions
│   │   ├── services/       # API service calls
│   │   ├── styles/         # CSS stylesheets
│   │   ├── utils/          # Utility functions
│   │   ├── views/          # Page components
│   │   ├── App.js          # Main component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── README.md (this file)
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=issue_tracker
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will open at `http://localhost:3000`

## API Documentation

See [Backend API Documentation](./backend/docs/API_DOCUMENTATION.md)

### Key Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/issues` - Get all issues
- `POST /api/v1/issues` - Create new issue
- `PUT /api/v1/issues/:id` - Update issue
- `DELETE /api/v1/issues/:id` - Delete issue
- `POST /api/v1/issues/:id/comments` - Add comment

## Database Schema

### User Model
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Issue Model
```
{
  title: String,
  description: String,
  status: String (open/in-progress/resolved/closed),
  priority: String (low/medium/high/critical),
  assignedTo: UUID (User reference),
  createdBy: UUID (User reference),
  category: String,
  tags: Array,
  comments: Array,
  attachments: Array,
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Features

### Core Features
- ✅ User Authentication (Login/Register)
- ✅ JWT Token-based Authorization
- ✅ Create/Read/Update/Delete Issues
- ✅ Filter Issues by Status, Priority, Category
- ✅ Add Comments to Issues
- ✅ Dashboard with Statistics
- ✅ Responsive UI Design

### Additional Features (Optional)
- Issue Attachments
- Issue Tags
- Issue Assignment
- User Roles and Permissions
- Advanced Search

## Development Guide

### Adding a New API Endpoint

1. Create controller in `backend/src/controllers/`
2. Create routes in `backend/src/routes/`
3. Add middleware if needed
4. Update main server file with new routes

### Adding a New Component

1. Create component in `frontend/src/components/`
2. Create corresponding style file
3. Import in parent component
4. Connect to Context API if needed

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## AI Tools Usage

This project was developed with assistance from AI tools including:
- GitHub Copilot
- Claude AI
- Cursor IDE

See [AI_USAGE_LOG.md](./AI_USAGE_LOG.md) for detailed information.

## Deployment

### Backend Deployment
- Can be deployed to Heroku, AWS, DigitalOcean, etc.
- Set environment variables on hosting platform
- Ensure PostgreSQL connection is configured

### Frontend Deployment
- Build for production: `npm run build`
- Deploy to Vercel, Netlify, GitHub Pages, etc.

## Contributing

This is an individual assignment project. Please follow the guidelines in the course syllabus.

## Troubleshooting

### PostgreSQL Connection Issues
- Ensure PostgreSQL is running locally
- Check connection credentials in `.env` file
- Verify the database `issue_tracker` exists
- Check firewall and port access (default 5432)

### API Connection Issues
- Ensure backend is running on correct port
- Check `REACT_APP_API_URL` in frontend `.env`
- Clear browser cache and cookies

### Authentication Issues
- Ensure JWT_SECRET is set in backend `.env`
- Check token expiration time
- Verify token is being sent in request headers

## License

MIT License

## Support

For issues or questions, refer to:
- Backend README: [./backend/README.md](./backend/README.md)
- Frontend README: [./frontend/README.md](./frontend/README.md)
- API Documentation: [./backend/docs/API_DOCUMENTATION.md](./backend/docs/API_DOCUMENTATION.md)
