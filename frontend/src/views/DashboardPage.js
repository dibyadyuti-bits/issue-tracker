import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { issueService, userService } from '../services/api';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { issues, setIssues } = useIssues();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await issueService.getAllIssues();
        setIssues(res.data.data || []);

        if (isAdmin) {
          const usersRes = await userService.getAllUsers();
          setUsers(usersRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, setIssues, isAdmin]);

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    inProgress: issues.filter((i) => i.status === 'in-progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    closed: issues.filter((i) => i.status === 'closed').length,
    critical: issues.filter((i) => i.priority === 'critical').length,
    high: issues.filter((i) => i.priority === 'high').length,
  };

  const myIssues = issues.filter(
    (i) => i.createdById === user?.id || i.assignedToId === user?.id || i.createdBy === user?.id || i.assignedTo === user?.id
  );
  const myStats = {
    total: myIssues.length,
    open: myIssues.filter((i) => i.status === 'open').length,
    inProgress: myIssues.filter((i) => i.status === 'in-progress').length,
    resolved: myIssues.filter((i) => i.status === 'resolved').length,
  };

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const myRecentIssues = [...myIssues]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const urgentIssues = [...issues]
    .filter((i) => (i.priority === 'critical' || i.priority === 'high') && i.status !== 'resolved' && i.status !== 'closed')
    .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
    .slice(0, 5);

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

  const adminStats = {
    totalUsers: users.length,
    adminCount: users.filter((u) => u.role === 'admin').length,
    userCount: users.filter((u) => u.role === 'user').length,
    unassigned: issues.filter((i) => !i.assignedToId && !i.assignedTo).length,
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>
            Welcome back, <span className="user-name">{user?.name || 'User'}</span>
          </h1>
          <div className="welcome-meta">
            <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
              {isAdmin ? 'Administrator' : 'Team Member'}
            </span>
          </div>
        </div>
        <div className="quick-actions">
          {isAdmin ? (
            <>
              <button className="btn-dashboard btn-primary" onClick={() => navigate('/issues')}>
                Manage Issues
              </button>
              <button className="btn-dashboard btn-secondary" onClick={() => navigate('/issues')}>
                View Users
              </button>
            </>
          ) : (
            <>
              <button className="btn-dashboard btn-primary" onClick={() => navigate('/issues')}>
                My Issues
              </button>
              <button className="btn-dashboard btn-secondary" onClick={() => navigate('/issues')}>
                Report Issue
              </button>
            </>
          )}
        </div>
      </div>

      <div className="stats-section">
        {isAdmin ? (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Issues</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: '100%', background: '#667eea' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Open</div>
              <div className="stat-value">{stats.open}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: stats.total ? `${(stats.open / stats.total) * 100}%` : '0%', background: '#f59e0b' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: stats.total ? `${(stats.inProgress / stats.total) * 100}%` : '0%', background: '#3b82f6' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resolved</div>
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: stats.total ? `${(stats.resolved / stats.total) * 100}%` : '0%', background: '#10b981' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Team Members</div>
              <div className="stat-value">{adminStats.totalUsers}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: '100%', background: '#764ba2' }} />
              </div>
            </div>
            <div className="stat-card critical-card">
              <div className="stat-label">Critical / High</div>
              <div className="stat-value">{stats.critical + stats.high}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: stats.total ? `${((stats.critical + stats.high) / stats.total) * 100}%` : '0%', background: '#ef4444' }} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-label">Team Total</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: '100%', background: '#667eea' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">My Issues</div>
              <div className="stat-value">{myStats.total}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: stats.total ? `${(myStats.total / stats.total) * 100}%` : '0%', background: '#764ba2' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">My Open</div>
              <div className="stat-value">{myStats.open}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: myStats.total ? `${(myStats.open / myStats.total) * 100}%` : '0%', background: '#f59e0b' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{myStats.inProgress}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: myStats.total ? `${(myStats.inProgress / myStats.total) * 100}%` : '0%', background: '#3b82f6' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resolved</div>
              <div className="stat-value">{myStats.resolved}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: myStats.total ? `${(myStats.resolved / myStats.total) * 100}%` : '0%', background: '#10b981' }} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-content">
        {/* Main content area */}
        <div className="main-cards">
          {isAdmin && (
            <div className="content-card">
              <div className="card-header">
                <h2>Team Overview</h2>
              </div>
              <div className="team-grid">
                <div className="team-stat">
                  <div className="team-stat-value">{adminStats.totalUsers}</div>
                  <div className="team-stat-label">Total Members</div>
                </div>
                <div className="team-stat">
                  <div className="team-stat-value">{adminStats.adminCount}</div>
                  <div className="team-stat-label">Admins</div>
                </div>
                <div className="team-stat">
                  <div className="team-stat-value">{adminStats.userCount}</div>
                  <div className="team-stat-label">Users</div>
                </div>
                <div className="team-stat">
                  <div className="team-stat-value">{adminStats.unassigned}</div>
                  <div className="team-stat-label">Unassigned</div>
                </div>
              </div>
            </div>
          )}

          {isAdmin && urgentIssues.length > 0 && (
            <div className="content-card urgent-card">
              <div className="card-header">
                <h2>Urgent Issues</h2>
                <span className="urgent-badge">{urgentIssues.length} of {stats.critical + stats.high} requiring attention</span>
              </div>
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {urgentIssues.map((issue) => (
                    <tr key={issue.id} onClick={() => navigate('/issues')} className="clickable-row">
                      <td className="issue-title">{issue.title}</td>
                      <td>
                        <span className={`badge ${getPriorityClass(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td>{issue.assignedTo?.name || issue.assignedToId || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <h2>{isAdmin ? 'Recent Issues' : 'My Recent Issues'}</h2>
              <button className="view-all-btn" onClick={() => navigate('/issues')}>
                View All ({isAdmin ? issues.length : myIssues.length})
              </button>
            </div>

            {loading ? (
              <div className="loading-state">Loading issues...</div>
            ) : (isAdmin ? recentIssues : myRecentIssues).length === 0 ? (
              <div className="empty-state">
                <p>{isAdmin ? 'No issues found.' : 'You have no issues yet.'}</p>
                {!isAdmin && (
                  <button className="btn-dashboard btn-primary" onClick={() => navigate('/issues')}>
                    Create Your First Issue
                  </button>
                )}
              </div>
            ) : (
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Category</th>
                    {isAdmin && <th>Assigned</th>}
                  </tr>
                </thead>
                <tbody>
                  {(isAdmin ? recentIssues : myRecentIssues).map((issue) => (
                    <tr key={issue.id} onClick={() => navigate('/issues')} className="clickable-row">
                      <td className="issue-title">{issue.title}</td>
                      <td>
                        <span className={`badge ${getStatusClass(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityClass(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>{issue.category || '-'}</td>
                      {isAdmin && <td>{issue.assignedTo?.name || issue.assignedToId || 'Unassigned'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-cards">
          <div className="content-card">
            <h3>Quick Actions</h3>
            <div className="action-list">
              {isAdmin ? (
                <>
                  <button className="action-item" onClick={() => navigate('/issues')}>
                    <span className="action-dot" style={{ background: '#667eea' }} />
                    Review Open Issues
                  </button>
                  <button className="action-item" onClick={() => navigate('/issues')}>
                    <span className="action-dot" style={{ background: '#ef4444' }} />
                    Assign Critical Items
                  </button>
                  <button className="action-item" onClick={() => navigate('/issues')}>
                    <span className="action-dot" style={{ background: '#10b981' }} />
                    Generate Report
                  </button>
                </>
              ) : (
                <>
                  <button className="action-item" onClick={() => navigate('/issues')}>
                    <span className="action-dot" style={{ background: '#667eea' }} />
                    View My Issues
                  </button>
                  <button className="action-item" onClick={() => navigate('/issues')}>
                    <span className="action-dot" style={{ background: '#10b981' }} />
                    Create New Issue
                  </button>
                  <button className="action-item" onClick={() => navigate('/issues')}>
                    <span className="action-dot" style={{ background: '#f59e0b' }} />
                    Track Progress
                  </button>
                </>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="content-card">
              <h3>Priority Breakdown</h3>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span className="breakdown-label">Critical</span>
                  <span className="breakdown-value critical">{stats.critical}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">High</span>
                  <span className="breakdown-value high">{stats.high}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Medium</span>
                  <span className="breakdown-value medium">
                    {issues.filter((i) => i.priority === 'medium').length}
                  </span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Low</span>
                  <span className="breakdown-value low">
                    {issues.filter((i) => i.priority === 'low').length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isAdmin && myIssues.length > 0 && (
            <div className="content-card">
              <h3>My Progress</h3>
              <div className="progress-ring-container">
                <svg className="progress-ring" viewBox="0 0 120 120">
                  <circle className="progress-ring-bg" cx="60" cy="60" r="50" />
                  <circle
                    className="progress-ring-fill"
                    cx="60"
                    cy="60"
                    r="50"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - (myStats.resolved / (myStats.total || 1)))}`}
                  />
                </svg>
                <div className="progress-text">
                  <div className="progress-percent">
                    {Math.round((myStats.resolved / (myStats.total || 1)) * 100)}%
                  </div>
                  <div className="progress-label">Resolved</div>
                </div>
              </div>
            </div>
          )}

          <div className="content-card">
            <h3>System Status</h3>
            <div className="status-list">
              <div className="status-item">
                <span className="status-indicator online" />
                API Gateway
              </div>
              <div className="status-item">
                <span className="status-indicator online" />
                Auth Service
              </div>
              <div className="status-item">
                <span className="status-indicator online" />
                Issue Service
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
