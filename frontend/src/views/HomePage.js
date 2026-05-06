import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Welcome to Issue Tracker</h1>
      <p>A microservices-based issue tracking system built with React, Node.js, Express, and PostgreSQL.</p>
      <div className="home-actions">
        <Link to="/issues" className="btn btn-primary">View Issues</Link>
        <Link to="/login" className="btn btn-secondary">Login / Register</Link>
      </div>
    </div>
  );
};

export default HomePage;
