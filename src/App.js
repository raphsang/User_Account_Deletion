import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import DeletionRequestForm from './components/DeletionRequestForm';
import StatusCheck from './components/StatusCheck';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <h1>Account Deletion Portal</h1>
          <nav className="main-nav">
            <ul>
              <li><Link to="/">Request Deletion</Link></li>
              <li><Link to="/check-status">Check Request Status</Link></li>
            </ul>
          </nav>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DeletionRequestForm />} />
            <Route path="/check-status" element={<StatusCheck />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>Privacy Policy | Terms of Service | Contact Us</p>
          <p>&copy; {new Date().getFullYear()} Your App Name. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;