import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { issueService, commentService } from '../services/api';
import '../styles/issues.css';

const IssuesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { issues, setIssues, removeIssue } = useIssues();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

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
  }, [isAuthenticated, navigate, setIssues]);

  const fetchComments = async (issueId) => {
    try {
      const res = await commentService.getComments(issueId);
      setComments(res.data.data || []);
    } catch (err) {
      setComments([]);
    }
  };

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    fetchComments(issue.id);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedIssue) return;
    try {
      await commentService.addComment(selectedIssue.id, commentText);
      setCommentText('');
      fetchComments(selectedIssue.id);
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await issueService.updateIssue(id, { status: newStatus });
      const updated = issues.map((i) => (i.id === id ? { ...i, status: newStatus } : i));
      setIssues(updated);
      if (selectedIssue?.id === id) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await issueService.deleteIssue(id);
      removeIssue(id);
      if (selectedIssue?.id === id) setSelectedIssue(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete issue', err);
    }
  };

  const categories = [...new Set(issues.map((i) => i.category).filter(Boolean))];

  const filtered = issues.filter((issue) => {
    const matchesSearch =
      !search ||
      issue.title?.toLowerCase().includes(search.toLowerCase()) ||
      issue.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || issue.status === statusFilter;
    const matchesPriority = !priorityFilter || issue.priority === priorityFilter;
    const matchesCategory = !categoryFilter || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'critical': return 'priority-critical';
      default: return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div className="header-left">
          <h1>Issues</h1>
          <span className="issue-count">{filtered.length} found</span>
        </div>
        <div className="header-right">
          <button className="btn-dashboard btn-primary" onClick={() => navigate('/issues/new')}>
            + New Issue
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-selects">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {(search || statusFilter || priorityFilter || categoryFilter) && (
            <button
              className="btn-clear"
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading issues...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No issues match your filters.</p>
          <button className="btn-dashboard btn-primary" onClick={() => navigate('/issues/new')}>
            Create New Issue
          </button>
        </div>
      ) : (
        <div className="issues-table-wrapper">
          <table className="issues-table full-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Created</th>
                <th>Due Date</th>
                <th>Assigned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue) => (
                <tr key={issue.id}>
                  <td className="issue-title-cell">
                    <button className="title-btn" onClick={() => handleSelectIssue(issue)}>
                      {issue.title}
                    </button>
                    <div className="issue-tags">
                      {issue.tags?.map?.((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="status-dropdown-cell">
                      <select
                        className={`status-select ${getStatusClass(issue.status)}`}
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityClass(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td>{issue.category || '-'}</td>
                  <td>{formatDate(issue.createdAt)}</td>
                  <td>{formatDate(issue.dueDate)}</td>
                  <td>{issue.assignedTo?.name || issue.assignedToId || 'Unassigned'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon view" onClick={() => handleSelectIssue(issue)} title="View">
                        👁
                      </button>
                      {isAdmin && (
                        <button
                          className="btn-icon delete"
                          onClick={() => setDeleteConfirm(issue.id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-content issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedIssue.title}</h2>
              <button className="modal-close" onClick={() => setSelectedIssue(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="issue-badges-row">
                <select
                  className={`badge status-select-lg ${getStatusClass(selectedIssue.status)}`}
                  value={selectedIssue.status}
                  onChange={(e) => handleStatusChange(selectedIssue.id, e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <span className={`badge ${getPriorityClass(selectedIssue.priority)}`}>
                  {selectedIssue.priority}
                </span>
                <span className="badge category-badge">{selectedIssue.category || 'general'}</span>
              </div>

              <div className="detail-meta-grid">
                <div>
                  <label>Created By</label>
                  <p>{selectedIssue.createdBy?.name || selectedIssue.createdById || '-'}</p>
                </div>
                <div>
                  <label>Assigned To</label>
                  <p>{selectedIssue.assignedTo?.name || selectedIssue.assignedToId || 'Unassigned'}</p>
                </div>
                <div>
                  <label>Created</label>
                  <p>{formatDate(selectedIssue.createdAt)}</p>
                </div>
                <div>
                  <label>Due Date</label>
                  <p>{formatDate(selectedIssue.dueDate)}</p>
                </div>
              </div>

              <div className="detail-description">
                <label>Description</label>
                <p>{selectedIssue.description}</p>
              </div>

              {selectedIssue.tags?.length > 0 && (
                <div className="detail-tags">
                  <label>Tags</label>
                  <div className="tag-list">
                    {selectedIssue.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="comments-section">
                <h4>Comments ({comments.length})</h4>
                {comments.length === 0 ? (
                  <p className="no-comments">No comments yet.</p>
                ) : (
                  <div className="comments-list">
                    {comments.map((c, idx) => (
                      <div key={idx} className="comment-card">
                        <div className="comment-header">
                          <span className="comment-author">{c.user?.name || 'User'}</span>
                          <span className="comment-time">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <form className="comment-form" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">Post</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Issue?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
