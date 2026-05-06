import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import LoginPage from './views/LoginPage';
import IssuesPage from './views/IssuesPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <IssueProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/issues" element={<IssuesPage />} />
            </Routes>
          </div>
        </Router>
      </IssueProvider>
    </AuthProvider>
  );
}

export default App;
