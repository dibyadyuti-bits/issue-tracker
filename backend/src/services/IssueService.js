# Backend Services Layer

## Overview
The services layer contains business logic separated from controllers.

## IssueService Example

```javascript
class IssueService {
  async createIssue(issueData) {
    // Validate input
    // Create issue
    // Return created issue
  }

  async getIssueById(id) {
    // Find issue
    // Populate references
    // Return issue
  }

  async updateIssue(id, updateData) {
    // Validate update
    // Update issue
    // Trigger notifications if needed
    // Return updated issue
  }

  async deleteIssue(id) {
    // Delete issue
    // Clean up references
  }

  async searchIssues(filters) {
    // Build query from filters
    // Apply pagination
    // Return results
  }
}

module.exports = new IssueService();
```

## AuthService Example

```javascript
class AuthService {
  async register(userData) {
    // Validate email uniqueness
    // Hash password
    // Create user
    // Generate token
    // Return user and token
  }

  async login(email, password) {
    // Find user
    // Verify password
    // Generate token
    // Return user and token
  }

  async verifyToken(token) {
    // Verify JWT token
    // Return decoded token
  }
}

module.exports = new AuthService();
```
