import React, { useEffect, useState } from 'react';
import IssueList from '../components/IssueList';
import IssueForm from '../components/IssueForm';
import { issueService } from '../services/api';
import { useIssues } from '../context/IssueContext';

const IssuesPage = () => {
  const { issues, setIssues, selectedIssue, setSelectedIssue } = useIssues();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await issueService.getAllIssues();
        setIssues(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch issues', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [setIssues]);

  return (
    <div className="issues-page">
      <div className="issues-header">
        <h1>Issues</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'New Issue'}
        </button>
      </div>

      {showForm && <IssueForm onClose={() => setShowForm(false)} />}

      {loading ? (
        <p>Loading issues...</p>
      ) : (
        <IssueList issues={issues} onSelectIssue={setSelectedIssue} />
      )}

      {selectedIssue && (
        <div className="issue-detail-panel">
          <h2>{selectedIssue.title}</h2>
          <p>{selectedIssue.description}</p>
          <div className="issue-meta">
            <span>Status: {selectedIssue.status}</span>
            <span>Priority: {selectedIssue.priority}</span>
            <span>Category: {selectedIssue.category}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
