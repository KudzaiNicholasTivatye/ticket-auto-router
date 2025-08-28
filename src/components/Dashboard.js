import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Dashboard.css';

// Supabase setup
const supabaseUrl = "https://xzlqidvpcbefamrxiffw.supabase.co" ; // replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bHFpZHZwY2JlZmFtcnhpZmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTgxMzQsImV4cCI6MjA3MTg3NDEzNH0.lC170sAgHBPF4UiSuCDClCv1u5taNA041xLK5jIsAsA"  ; // replace with your anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const departmentConfig = {
    'All': { icon: '📊', color: '#6366f1', count: 0 },
    'Billing': { icon: '💳', color: '#059669', count: 0 },
    'Tech Support': { icon: '🔧', color: '#1d4ed8', count: 0 },
    'Sales': { icon: '💼', color: '#d97706', count: 0 },
    'Shipping': { icon: '📦', color: '#7c3aed', count: 0 },
    'Triage': { icon: '🔄', color: '#ea580c', count: 0 }
  };

  const statusConfig = {
    'Open': { color: '#ef4444', bg: '#fef2f2' },
    'In Progress': { color: '#f59e0b', bg: '#fffbeb' },
    'Resolved': { color: '#10b981', bg: '#f0fdf4' }
  };

  const priorityConfig = {
    'Low': { color: '#6b7280', bg: '#f9fafb' },
    'Medium': { color: '#f59e0b', bg: '#fffbeb' },
    'High': { color: '#ef4444', bg: '#fef2f2' }
  };

  // Fetch tickets from Supabase
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*');

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data || []);
      }
      setLoading(false);
    };

    fetchTickets();
  }, []);

  // Calculate department counts
  const departmentCounts = useMemo(() => {
    const counts = { ...departmentConfig };
    counts['All'].count = tickets.length;

    tickets.forEach(ticket => {
      if (counts[ticket.department]) {
        counts[ticket.department].count++;
      }
    });

    return counts;
  }, [tickets]);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(ticket => ticket.department === selectedDepartment);
    }

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        (ticket.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.body || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.submittedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.submittedAt);
          bValue = new Date(b.submittedAt);
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'desc') return bValue > aValue ? 1 : -1;
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [tickets, selectedDepartment, searchTerm, sortBy, sortOrder]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleReassignTicket = (ticketId, newDepartment) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, department: newDepartment, status: 'Open' }
        : ticket
    ));
    setShowModal(false);
  };

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: newStatus }
        : ticket
    ));
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : '';

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#10b981';
    if (confidence >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🎯 Ticket Management Dashboard</h1>
          <p>Monitor and manage support tickets across all departments</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-number">{tickets.length}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{tickets.filter(t => t.status === 'Open').length}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{tickets.filter(t => t.department === 'Triage').length}</div>
            <div className="stat-label">Needs Triage</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="filters-section">
            <h3>Departments</h3>
            <div className="department-filters">
              {Object.entries(departmentCounts).map(([dept, config]) => (
                <button
                  key={dept}
                  className={`department-btn ${selectedDepartment === dept ? 'active' : ''}`}
                  onClick={() => setSelectedDepartment(dept)}
                  style={{ '--dept-color': config.color }}
                >
                  <span className="dept-icon">{config.icon}</span>
                  <span className="dept-name">{dept}</span>
                  <span className="dept-count">{config.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="search-section">
            <h3>Search & Sort</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="sort-controls">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="confidence">Sort by Confidence</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
              <button
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {sortOrder === 'desc' ? '⬇️' : '⬆️'}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          <div className="tickets-header">
            <h2>
              {selectedDepartment === 'All' ? 'All Tickets' : `${selectedDepartment} Tickets`}
              <span className="ticket-count">({filteredTickets.length})</span>
            </h2>
          </div>

          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`ticket-card ${ticket.department === 'Triage' ? 'triage-card' : ''}`}
                onClick={() => handleTicketClick(ticket)}
              >
                <div className="ticket-header">
                  <div className="ticket-id">#{ticket.id}</div>
                  <div className="ticket-badges">
                    <span
                      className="status-badge"
                      style={{
                        color: statusConfig[ticket.status]?.color || '#000',
                        backgroundColor: statusConfig[ticket.status]?.bg || '#fff'
                      }}
                    >
                      {ticket.status}
                    </span>
                    <span
                      className="priority-badge"
                      style={{
                        color: priorityConfig[ticket.priority]?.color || '#000',
                        backgroundColor: priorityConfig[ticket.priority]?.bg || '#fff'
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div className="ticket-subject">
                  <h3>{ticket.subject}</h3>
                </div>

                <div className="ticket-body">
                  <p>{(ticket.body || '').substring(0, 120)}...</p>
                </div>

                <div className="ticket-meta">
                  <div className="department-info">
                    <span
                      className="dept-badge"
                      style={{ color: departmentConfig[ticket.department]?.color || '#6b7280' }}
                    >
                      {departmentConfig[ticket.department]?.icon || '❓'} {ticket.department || 'Unknown'}
                    </span>
                  </div>

                  <div className="confidence-info">
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${(ticket.confidence || 0) * 100}%`,
                          backgroundColor: getConfidenceColor(ticket.confidence || 0)
                        }}
                      />
                    </div>
                    <span className="confidence-text">
                      {Math.round((ticket.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="submitter-info">
                    <span>👤 {ticket.submittedBy || 'Unknown'}</span>
                  </div>
                  <div className="date-info">
                    <span>📅 {formatDate(ticket.submittedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="no-tickets">
              <div className="no-tickets-icon">🎫</div>
              <h3>No tickets found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for ticket details */}
      {showModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ticket Details - #{selectedTicket.id}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="ticket-details">
                <div className="detail-row">
                  <label>Subject:</label>
                  <span>{selectedTicket.subject}</span>
                </div>

                <div className="detail-row">
                  <label>Description:</label>
                  <div className="description-text">{selectedTicket.body}</div>
                </div>

                <div className="detail-row">
                  <label>Current Department:</label>
                  <span
                    className="current-dept"
                    style={{ color: departmentConfig[selectedTicket.department]?.color || '#6b7280' }}
                  >
                    {departmentConfig[selectedTicket.department]?.icon || '❓'} {selectedTicket.department || 'Unknown'}
                  </span>
                </div>

                <div className="detail-row">
                  <label>Confidence:</label>
                  <span style={{ color: getConfidenceColor(selectedTicket.confidence || 0) }}>
                    {Math.round((selectedTicket.confidence || 0) * 100)}%
                  </span>
                </div>

                <div className="detail-row">
                  <label>Status:</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="detail-row">
                  <label>Submitted by:</label>
                  <span>{selectedTicket.submittedBy || 'Unknown'}</span>
                </div>

                <div className="detail-row">
                  <label>Submitted at:</label>
                  <span>{formatDate(selectedTicket.submittedAt)}</span>
                </div>
              </div>

              {selectedTicket.department === 'Triage' && (
                <div className="reassign-section">
                  <h3>🔄 Reassign Ticket</h3>
                  <p>This ticket needs manual review. Choose the correct department:</p>
                  <div className="reassign-buttons">
                    {Object.entries(departmentConfig)
                      .filter(([dept]) => dept !== 'All' && dept !== 'Triage')
                      .map(([dept, config]) => (
                        <button
                          key={dept}
                          className="reassign-btn"
                          style={{ backgroundColor: config.color }}
                          onClick={() => handleReassignTicket(selectedTicket.id, dept)}
                        >
                          {config.icon} Assign to {dept}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
