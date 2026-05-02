# Issue Tracker Frontend

## Overview
This is the frontend application for the Issue Tracker built with React.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a \`.env\` file based on \`.env.example\`
4. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

The application will open at \`http://localhost:3000\`

## Building for Production

\`\`\`bash
npm run build
\`\`\`

## Project Structure

\`\`\`
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/         # Reusable React components
│   ├── context/            # React Context for state management
│   ├── controllers/        # Logic controllers
│   ├── hooks/              # Custom React hooks
│   ├── models/             # Data models and types
│   ├── services/           # API service calls
│   ├── styles/             # CSS stylesheets
│   ├── utils/              # Utility functions
│   ├── views/              # Page components
│   ├── App.js              # Main App component
│   ├── App.css             # App styles
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── package.json
├── .env.example
└── README.md
\`\`\`

## Features

- User Authentication (Login/Register)
- Create, Read, Update, Delete Issues
- Search and Filter Issues
- Add Comments to Issues
- Responsive Design

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm build\` - Builds the app for production
- \`npm test\` - Runs tests

## Technology Stack

- React 18
- React Router v6
- Axios
- CSS3
- Context API for state management

## Environment Variables

See \`.env.example\` for configuration.
