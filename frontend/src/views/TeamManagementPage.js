import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { teamService, userService, issueService } from '../services/api';
import '../styles/admin.css';

const TeamManagementPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { issues, setIssues } = useIssues();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamIssues, setTeamIssues] = useState([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [teamsRes, usersRes, issuesRes] = await Promise.all([
          teamService.getAllTeams(),
          userService.getAllUsers(),
          issueService.getAllIssues()
        ]);
        setTeams(teamsRes.data.data || []);
        setUsers(usersRes.data.data || []);
        setIssues(issuesRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch teams', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, navigate, setIssues]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setActionLoading(true);
    try {
      const res = await teamService.createTeam(formData);
      setTeams((prev) => [...prev, { ...res.data.data, members: [] }]);
      setShowForm(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to create team', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team? Members will be unassigned.')) return;
    setActionLoading(true);
    try {
      await teamService.deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      setUsers((prev) => prev.map((u) => (u.teamId === id ? { ...u, teamId: null } : u)));
      if (selectedTeam?.id === id) setSelectedTeam(null);
    } catch (err) {
      console.error('Failed to delete team', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (teamId) => {
    if (!assignUserId) return;
    setActionLoading(true);
    try {
      await teamService.assignUser(teamId, assignUserId);
      setUsers((prev) => prev.map((u) => (u.id === assignUserId ? { ...u, teamId } : u)));
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? { ...t, members: [...(t.members || []), users.find((u) => u.id === assignUserId)] }
            : t
        )
      );
      setAssignUserId('');
    } catch (err) {
      console.error('Failed to assign user', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (teamId, userId) => {
    setActionLoading(true);
    try {
      await teamService.removeUser(teamId, userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, teamId: null } : u)));
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, members: (t.members || []).filter((m) => m.id !== userId) } : t
        )
      );
    } catch (err) {
      console.error('Failed to remove user', err);
    } finally {
      setActionLoading(false);
    }
  };

  const selectTeam = (team) => {
    setSelectedTeam(team);
    const memberIds = new Set((team.members || []).map((m) => m.id));
    const related = issues.filter(
      (i) => memberIds.has(i.createdById) || memberIds.has(i.assignedToId)
    );
    setTeamIssues(related);
  };

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

  const unassignedUsers = users.filter((u) => !u.teamId);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>Team Management</h1>
          <span className="admin-count">{teams.length} teams</span>
        </div>
        <button className="btn-dashboard btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Team'}
        </button>
      </div>

      {showForm && (
        <form className="team-form-card" onSubmit={handleCreate}>
          <div className="form-row two-col">
            <div className="form-group">
              <label>Team Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Engineering, Design, etc."
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading-state">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <p>No teams yet. Create your first team above.</p>
        </div>
      ) : (
        <div className="teams-layout">
          <div className="teams-list">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`team-card ${selectedTeam?.id === team.id ? 'active' : ''}`}
                onClick={() => selectTeam(team)}
              >
                <div className="team-card-header">
                  <h3>{team.name}</h3>
                  <span className="team-count">{(team.members || []).length} members</span>
                </div>
                {team.description && <p className="team-desc">{team.description}</p>}
                <div className="team-card-footer">
                  <button
                    className="btn-icon delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(team.id); }}
                    title="Delete team"
                    disabled={actionLoading}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedTeam && (
            <div className="team-detail-panel">
              <h2>{selectedTeam.name}</h2>
              {selectedTeam.description && <p className="panel-desc">{selectedTeam.description}</p>}

              <div className="panel-section">
                <h4>Members</h4>
                {(selectedTeam.members || []).length === 0 ? (
                  <p className="no-data">No members yet.</p>
                ) : (
                  <ul className="member-list">
                    {(selectedTeam.members || []).map((m) => (
                      <li key={m.id} className="member-item">
                        <span className="member-name">{m.name}</span>
                        <span className={`role-badge role-${m.role}`}>{m.role}</span>
                        <button
                          className="btn-text-remove"
                          onClick={() => handleRemove(selectedTeam.id, m.id)}
                          disabled={actionLoading}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {unassignedUsers.length > 0 && (
                  <div className="assign-row">
                    <select
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                    >
                      <option value="">Assign a user...</option>
                      {unassignedUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                    <button
                      className="btn-primary"
                      onClick={() => handleAssign(selectedTeam.id)}
                      disabled={!assignUserId || actionLoading}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div className="panel-section">
                <h4>Team Issues ({teamIssues.length})</h4>
                {teamIssues.length === 0 ? (
                  <p className="no-data">No issues from this team yet.</p>
                ) : (
                  <>
                    <div className="mini-stats">
                      <div className="mini-stat">
                        <span className="mini-value">
                          {teamIssues.filter((i) => i.status === 'open').length}
                        </span>
                        <span className="mini-label">Open</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-value">
                          {teamIssues.filter((i) => i.status === 'in-progress').length}
                        </span>
                        <span className="mini-label">In Progress</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-value">
                          {teamIssues.filter((i) => i.status === 'resolved').length}
                        </span>
                        <span className="mini-label">Resolved</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-value">
                          {teamIssues.filter((i) => i.priority === 'critical' || i.priority === 'high').length}
                        </span>
                        <span className="mini-label">Critical/High</span>
                      </div>
                    </div>
                    <table className="admin-table compact">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamIssues.slice(0, 8).map((issue) => (
                          <tr key={issue.id}>
                            <td className="cell-title">{issue.title}</td>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {teamIssues.length > 8 && (
                      <p className="more-note">+ {teamIssues.length - 8} more issues</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;
