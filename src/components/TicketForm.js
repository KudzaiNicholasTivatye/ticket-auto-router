import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './TicketForm.css';

// ✅ Initialize Supabase client
const supabase = createClient(
  "https://xzlqidvpcbefamrxiffw.supabase.co",   // replace with your Supabase project URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bHFpZHZwY2JlZmFtcnhpZmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTgxMzQsImV4cCI6MjA3MTg3NDEzNH0.lC170sAgHBPF4UiSuCDClCv1u5taNA041xLK5jIsAsA"                          // replace with your anon public key
);

const TicketRouter = () => {
  const [formData, setFormData] = useState({
    subject: '',
    body: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);




  const departmentConfig = {
    'Billing': {
      class: 'result-billing',
      title: 'Billing Department'
    },
    'Tech Support': {
      class: 'result-tech-support',
      title: 'Technical Support'
    },
    'Sales': {
      class: 'result-sales',
      title: 'Sales Department'
    },
    'Shipping': {
      class: 'result-shipping',
      title: 'Shipping & Logistics'
    },
    'Triage': {
      class: 'result-triage',
      title: 'Triage (Manual Review)'
    },
    'Error': {
      class: 'result-error',
      title: 'Processing Error'
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  
    
    if (!formData.subject.trim() || !formData.body.trim()) {
      alert('Please fill in both subject and description fields.');
      return;
    }

    setLoading(true);
    setShowResult(false);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          body: formData.body.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ticketResult = {
        department: data.department,
        confidence: data.confidence
      };

      setResult(ticketResult);
      setShowResult(true);

      // ✅ Save ticket to Supabase
      const { error } = await supabase
        .from("tickets") // make sure you created a "tickets" table in Supabase
        .insert([
          {
            subject: formData.subject.trim(),
            body: formData.body.trim(),
            department: ticketResult.department,
            confidence: ticketResult.confidence
          }
        ]);

      if (error) {
        console.error("Supabase insert error:", error.message);
      }

    } catch (error) {
      console.error('Error:', error);
      setResult({
        department: 'Error',
        confidence: 0
      });
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };
   if (loading) {
    return (
     <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">LOADING</p>
    </div>
    );
  }

  const resetForm = () => {
    setFormData({ subject: '', body: '' });
    setResult(null);
    setShowResult(false);
  };

  return (
    <div className="ticket-router-container">
      <div className="container">
        <div className="header">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <h1>Ticket Auto-Router</h1>
          <p>AI-powered support ticket classification</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label htmlFor="subject">Subject Line</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="form-control"
                placeholder="Brief description of your issue..."
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="body">Detailed Description</label>
              <textarea
                id="body"
                name="body"
                className="form-control"
                placeholder="Please provide more details about your issue so we can route it to the right department..."
                value={formData.body}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                className={`submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : ' Route My Ticket'}
              </button>
              
              {showResult && (
                <button 
                  type="button" 
                  className="reset-btn"
                  onClick={resetForm}
                >
                  New Ticket
                </button>
              )}
            </div>
          </form>

          {showResult && result && (
            <div className={`result-card ${departmentConfig[result.department]?.class || 'result-error'}`}>
              <div className="result-title">
                <span className="result-icon">
                  {departmentConfig[result.department]?.icon || '❌'}
                </span>
                <span className="result-department">
                  {departmentConfig[result.department]?.title || 'Processing Error'}
                </span>
              </div>
              <div className="result-confidence">
                <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
              
              {result.department === 'Triage' && (
                <div className="triage-message">
                  <p>This ticket requires manual review due to ambiguous content.</p>
                </div>
              )}
              
              {result.department === 'Error' && (
                <div className="error-message">
                  <p>Unable to process your request. Please try again or contact support.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketRouter;
