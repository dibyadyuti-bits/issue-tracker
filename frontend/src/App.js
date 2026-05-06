import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import IssuesPage from './views/IssuesPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <IssueProvider>
        <Router>
          <div className="App">
            <nav className="navbar">
              <div className="nav-brand">
                <Link to="/">Issue Tracker</Link>
              </div>
              <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/issues">Issues</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </nav>
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/issues" element={<IssuesPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </IssueProvider>
    </AuthProvider>
  );
}

export default App;
