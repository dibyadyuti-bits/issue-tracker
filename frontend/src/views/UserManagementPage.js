import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, teamService } from '../services/api';
import '../styles/admin.css';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

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
        const [usersRes, teamsRes] = await Promise.all([
          userService.getAllUsers(),
          teamService.getAllTeams()
        ]);
        setUsers(usersRes.data.data || []);
        setTeams(teamsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await userService.updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Failed to update role', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleTeamChange = async (userId, teamId) => {
    setUpdating(userId);
    try {
      await userService.updateUser(userId, { teamId: teamId || null });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, teamId: teamId || null } : u)));
    } catch (err) {
      console.error('Failed to update team', err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      !search ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>User Management</h1>
          <span className="admin-count">{filtered.length} users</span>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading users...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className={updating === user.id ? 'updating' : ''}>
                  <td className="cell-name">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className={`inline-select role-${user.role}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updating === user.id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="inline-select"
                      value={user.teamId || ''}
                      onChange={(e) => handleTeamChange(user.id, e.target.value)}
                      disabled={updating === user.id}
                    >
                      <option value="">Unassigned</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
