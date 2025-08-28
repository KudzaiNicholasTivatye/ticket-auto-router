// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TicketForm from "./components/TicketForm";
import Dashboard from "./components/Dashboard";
import "./App.css"; // add styles here

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="navbar-logo">Ticket Auto-Router</div>
          <div className="navbar-links">
            <Link to="/">Submit Ticket</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<TicketForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

