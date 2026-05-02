# Issue Tracker Backend API

## Overview
This is the backend API for the Issue Tracker application built with Node.js and Express.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

4. Create a \`.env\` file based on \`.env.example\`
5. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Authentication
- **POST** \`/api/v1/auth/register\` - Register a new user
- **POST** \`/api/v1/auth/login\` - Login user

### Issues
- **GET** \`/api/v1/issues\` - Get all issues
- **GET** \`/api/v1/issues/:id\` - Get single issue
- **POST** \`/api/v1/issues\` - Create new issue (Protected)
- **PUT** \`/api/v1/issues/:id\` - Update issue (Protected)
- **DELETE** \`/api/v1/issues/:id\` - Delete issue (Protected)
- **POST** \`/api/v1/issues/:id/comments\` - Add comment to issue (Protected)

## Project Structure

\`\`\`
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── validators/     # Input validation
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   └── index.js        # Entry point
├── tests/              # Test files
├── docs/               # API documentation
├── .env.example        # Environment variables template
├── package.json        # Dependencies
└── README.md
\`\`\`

## Environment Variables

See \`.env.example\` for all required environment variables.

## Testing

Run tests with:
\`\`\`bash
npm test
\`\`\`

## Database Schema

### User Model
- name (String)
- email (String, unique)
- password (String, hashed)
- role (String: 'user' or 'admin')
- createdAt (Date)
- updatedAt (Date)

### Issue Model
- title (String)
- description (String)
- status (String: 'open', 'in-progress', 'resolved', 'closed')
- priority (String: 'low', 'medium', 'high', 'critical')
- assignedTo (UUID, ref: User)
- createdBy (UUID, ref: User)
- category (String)
- tags (Array)
- comments (Array of comments)
- attachments (Array of attachments)
- dueDate (Date)
- createdAt (Date)
- updatedAt (Date)

## Response Format

All API responses follow this format:

\`\`\`json
{
  "success": boolean,
  "data": object | array,
  "message": "string"
}
\`\`\`

## Error Handling

Errors are returned with appropriate HTTP status codes and error messages.
