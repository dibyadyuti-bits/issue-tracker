import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../context/IssueContext';
import { issueService } from '../services/api';
import '../styles/issues.css';

const NewIssuePage = () => {
  const navigate = useNavigate();
  const { addIssue } = useIssues();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [values, setValues] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    category: 'general',
    tags: '',
    dueDate: '',
    assignedToId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...values,
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      };
      const res = await issueService.createIssue(payload);
      addIssue(res.data.data);
      navigate('/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="issues-page new-issue-page">
      <div className="issues-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/issues')}>
            ← Back
          </button>
          <h1>Create New Issue</h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="issue-form-card">
        <div className="form-section">
          <h3>Issue Details</h3>

          <div className="form-group">
            <label htmlFor="title">Title <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="Enter issue title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the issue in detail"
              required
            />
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={values.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={values.status} onChange={handleChange}>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={values.category}
                onChange={handleChange}
                placeholder="e.g. UI/UX, Backend"
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input type="date" id="dueDate" name="dueDate" value={values.dueDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={values.tags}
                onChange={handleChange}
                placeholder="comma, separated, tags"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Assignment</h3>
          <div className="form-group">
            <label htmlFor="assignedToId">Assign To (User ID)</label>
            <input
              type="text"
              id="assignedToId"
              name="assignedToId"
              value={values.assignedToId}
              onChange={handleChange}
              placeholder="Leave blank to keep unassigned"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/issues')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Issue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewIssuePage;
