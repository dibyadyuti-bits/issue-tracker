import React from 'react';

const IssueList = ({ issues, onSelectIssue }) => {
  return (
    <div className="issue-list">
      <h2>Issues</h2>
      {issues.length === 0 ? (
        <p>No issues found</p>
      ) : (
        <ul>
          {issues.map(issue => (
            <li key={issue.id} onClick={() => onSelectIssue(issue)}>
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>
              <div className="issue-meta">
                <span className="status">{issue.status}</span>
                <span className="priority">{issue.priority}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssueList;
