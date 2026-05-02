import React from 'react';

const IssueDetail = ({ issue, onClose }) => {
  if (!issue) {
    return <div>Select an issue to view details</div>;
  }

  return (
    <div className="issue-detail">
      <div className="detail-header">
        <h2>{issue.title}</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <label>Description</label>
          <p>{issue.description}</p>
        </div>

        <div className="detail-section">
          <label>Status</label>
          <span className="badge">{issue.status}</span>
        </div>

        <div className="detail-section">
          <label>Priority</label>
          <span className="badge">{issue.priority}</span>
        </div>

        <div className="detail-section">
          <label>Created By</label>
          <p>{issue.createdBy?.name}</p>
        </div>

        <div className="detail-section">
          <label>Assigned To</label>
          <p>{issue.assignedTo?.name || 'Unassigned'}</p>
        </div>

        {issue.dueDate && (
          <div className="detail-section">
            <label>Due Date</label>
            <p>{new Date(issue.dueDate).toLocaleDateString()}</p>
          </div>
        )}

        {issue.comments && issue.comments.length > 0 && (
          <div className="detail-section">
            <label>Comments</label>
            <div className="comments">
              {issue.comments.map((comment, idx) => (
                <div key={idx} className="comment">
                  <strong>{comment.user?.name}:</strong>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetail;
