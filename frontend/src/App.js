import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Issue Tracker</h1>
        </header>
        <main>
          <Routes>
            {/* Routes will be added here */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
