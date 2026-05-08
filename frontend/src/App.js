import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import Layout from './components/Layout';
import LoginPage from './views/LoginPage';
import DashboardPage from './views/DashboardPage';
import IssuesPage from './views/IssuesPage';
import NewIssuePage from './views/NewIssuePage';
import UserManagementPage from './views/UserManagementPage';
import TeamManagementPage from './views/TeamManagementPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <IssueProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/issues/new" element={<NewIssuePage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/teams" element={<TeamManagementPage />} />
            </Routes>
          </Layout>
        </Router>
      </IssueProvider>
    </AuthProvider>
  );
}

export default App;
