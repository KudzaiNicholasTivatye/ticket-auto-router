// App.js
import React from "react";
import  { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from "./components/Signup";
import { supabase } from "./supabaseClient";
import TicketForm from "./components/TicketForm";
import Dashboard from "./components/Dashboard";

import "./App.css"; // add styles here

function App() {
   const [session, setSession] = useState(null);

   

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <Signup />;
  }
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

