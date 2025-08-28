// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TicketForm from "./components/TicketForm";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: "10px", background: "#eee" }}>
          <Link to="/" style={{ marginRight: "10px" }}>Submit Ticket</Link>
          <Link to="/dashboard">Dashboard</Link>
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
