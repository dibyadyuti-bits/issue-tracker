// Issue model/type definition
export class Issue {
  constructor(title, description, priority = 'medium', status = 'open') {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.createdAt = new Date();
  }
}

export const IssueStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

export const IssuePriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};
