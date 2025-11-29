import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Sample Data
const sampleData = {
  donations: [
    { id: 1, donor: 'Akshaya Patra Foundation', amount: 500000, type: 'Bank Transfer', date: '2024-09-20' },
    { id: 2, donor: 'Ministry of Home Affairs', amount: 2500000, type: 'Government Grant', date: '2024-09-18' },
    { id: 3, donor: 'Smile Foundation', amount: 750000, type: 'Online', date: '2024-09-15' },
    { id: 4, donor: 'National Disaster Response Fund', amount: 1000000, type: 'Government Grant', date: '2024-09-12' },
    { id: 5, donor: 'CRY - Child Rights and You', amount: 300000, type: 'Bank Transfer', date: '2024-09-10' },
    { id: 6, donor: 'Helpage India', amount: 450000, type: 'Online', date: '2024-09-08' }
  ],
  allocations: [
    { id: 1, region: 'Kerala', purpose: 'Flood Relief', amount: 800000, date: '2024-09-19' },
    { id: 2, region: 'Uttarakhand', purpose: 'Medical Aid', amount: 600000, date: '2024-09-17' },
    { id: 3, region: 'Assam', purpose: 'Emergency Shelter', amount: 450000, date: '2024-09-14' },
    { id: 4, region: 'Bihar', purpose: 'Food Distribution', amount: 350000, date: '2024-09-12' },
    { id: 5, region: 'Odisha', purpose: 'Medical Aid', amount: 500000, date: '2024-09-10' },
    { id: 6, region: 'West Bengal', purpose: 'Rehabilitation', amount: 700000, date: '2024-09-08' }
  ]
};

// Login Page Component
const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Relief Funds</h1>
        <p>Select your access level to continue</p>
        <div className="login-buttons">
          <button 
            className="btn btn-public" 
            onClick={() => onLogin('public')}
          >
            Login as Public
          </button>
          <button 
            className="btn btn-admin" 
            onClick={() => onLogin('admin')}
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// Public Dashboard Component
const PublicDashboard = ({ onLogout, toggleTheme, isDarkMode }) => {
  const totalFunds = sampleData.donations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalAllocated = sampleData.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);

  // Prepare pie chart data
  const pieData = [
    { name: 'Flood Relief', value: sampleData.allocations.filter(a => a.purpose === 'Flood Relief').reduce((sum, a) => sum + a.amount, 0), color: '#8884d8' },
    { name: 'Medical Aid', value: sampleData.allocations.filter(a => a.purpose === 'Medical Aid').reduce((sum, a) => sum + a.amount, 0), color: '#82ca9d' },
    { name: 'Emergency Shelter', value: sampleData.allocations.filter(a => a.purpose === 'Emergency Shelter').reduce((sum, a) => sum + a.amount, 0), color: '#ffc658' },
    { name: 'Food Distribution', value: sampleData.allocations.filter(a => a.purpose === 'Food Distribution').reduce((sum, a) => sum + a.amount, 0), color: '#ff7c7c' },
    { name: 'Rehabilitation', value: sampleData.allocations.filter(a => a.purpose === 'Rehabilitation').reduce((sum, a) => sum + a.amount, 0), color: '#8dd1e1' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Relief Fund Public Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Total Funds Card */}
        <div className="card summary-card">
          <h2>💰 Fund Summary</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Collected</span>
              <span className="stat-value">₹{totalFunds.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Allocated</span>
              <span className="stat-value">₹{totalAllocated.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining</span>
              <span className="stat-value">₹{(totalFunds - totalAllocated).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card chart-card">
          <h2>📊 Fund Allocation by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Donations Table */}
        <div className="card table-card">
          <h2>💝 Recent Donations</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.donations.map((donation, index) => (
                <tr key={donation.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td>{donation.donor}</td>
                  <td>{donation.type}</td>
                  <td>₹{donation.amount.toLocaleString()}</td>
                  <td>{donation.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Allocations Table */}
        <div className="card table-card">
          <h2>🎯 Recent Allocations</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.allocations.map((allocation, index) => (
                <tr key={allocation.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td>{allocation.region}</td>
                  <td>{allocation.purpose}</td>
                  <td>₹{allocation.amount.toLocaleString()}</td>
                  <td>{allocation.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ onLogout, toggleTheme, isDarkMode }) => {
  const [donationForm, setDonationForm] = useState({
    donor: '',
    amount: '',
    type: 'Bank Transfer',
    date: ''
  });

  const [allocationForm, setAllocationForm] = useState({
    region: '',
    purpose: 'Flood Relief',
    amount: '',
    date: ''
  });

  const handleDonationSubmit = () => {
    alert('Donation added successfully! (Prototype - no actual data change)');
    setDonationForm({ donor: '', amount: '', type: 'Bank Transfer', date: '' });
  };

  const handleAllocationSubmit = () => {
    alert('Allocation added successfully! (Prototype - no actual data change)');
    setAllocationForm({ region: '', purpose: 'Flood Relief', amount: '', date: '' });
  };

  const totalFunds = sampleData.donations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalAllocated = sampleData.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);

  const pieData = [
    { name: 'Flood Relief', value: sampleData.allocations.filter(a => a.purpose === 'Flood Relief').reduce((sum, a) => sum + a.amount, 0), color: '#8884d8' },
    { name: 'Medical Aid', value: sampleData.allocations.filter(a => a.purpose === 'Medical Aid').reduce((sum, a) => sum + a.amount, 0), color: '#82ca9d' },
    { name: 'Emergency Shelter', value: sampleData.allocations.filter(a => a.purpose === 'Emergency Shelter').reduce((sum, a) => sum + a.amount, 0), color: '#ffc658' },
    { name: 'Food Distribution', value: sampleData.allocations.filter(a => a.purpose === 'Food Distribution').reduce((sum, a) => sum + a.amount, 0), color: '#ff7c7c' },
    { name: 'Rehabilitation', value: sampleData.allocations.filter(a => a.purpose === 'Rehabilitation').reduce((sum, a) => sum + a.amount, 0), color: '#8dd1e1' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Relief Fund Admin Dashboard</h1>
        <div className="header-actions">
          
          <button className="btn btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Total Funds Card */}
        <div className="card summary-card">
          <h2>💰 Fund Summary</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Collected</span>
              <span className="stat-value">₹{totalFunds.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Allocated</span>
              <span className="stat-value">₹{totalAllocated.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining</span>
              <span className="stat-value">₹{(totalFunds - totalAllocated).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card chart-card">
          <h2>📊 Fund Allocation by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Donations Table */}
        <div className="card table-card">
          <h2>💝 Recent Donations</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.donations.map((donation, index) => (
                <tr key={donation.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td>{donation.donor}</td>
                  <td>{donation.type}</td>
                  <td>₹{donation.amount.toLocaleString()}</td>
                  <td>{donation.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Donation Form */}
        <div className="card form-card">
          <h2>➕ Add New Donation</h2>
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Donor Name:</label>
                <input
                  type="text"
                  placeholder="Enter donor name"
                  value={donationForm.donor}
                  onChange={(e) => setDonationForm({...donationForm, donor: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={donationForm.amount}
                  onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={donationForm.type}
                  onChange={(e) => setDonationForm({...donationForm, type: e.target.value})}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Government Grant">Government Grant</option>
                  <option value="Online">Online</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={donationForm.date}
                  onChange={(e) => setDonationForm({...donationForm, date: e.target.value})}
                  required
                />
              </div>
            </div>
            <button onClick={handleDonationSubmit} className="btn btn-primary">Add Donation</button>
          </div>
        </div>

        {/* Recent Allocations Table */}
        <div className="card table-card">
          <h2>🎯 Recent Allocations</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.allocations.map((allocation, index) => (
                <tr key={allocation.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td>{allocation.region}</td>
                  <td>{allocation.purpose}</td>
                  <td>₹{allocation.amount.toLocaleString()}</td>
                  <td>{allocation.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Allocation Form */}
        <div className="card form-card">
          <h2>🎯 Add New Allocation</h2>
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Region:</label>
                <input
                  type="text"
                  placeholder="Enter region name"
                  value={allocationForm.region}
                  onChange={(e) => setAllocationForm({...allocationForm, region: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purpose:</label>
                <select
                  value={allocationForm.purpose}
                  onChange={(e) => setAllocationForm({...allocationForm, purpose: e.target.value})}
                >
                  <option value="Flood Relief">Flood Relief</option>
                  <option value="Medical Aid">Medical Aid</option>
                  <option value="Emergency Shelter">Emergency Shelter</option>
                  <option value="Food Distribution">Food Distribution</option>
                  <option value="Rehabilitation">Rehabilitation</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={allocationForm.amount}
                  onChange={(e) => setAllocationForm({...allocationForm, amount: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={allocationForm.date}
                  onChange={(e) => setAllocationForm({...allocationForm, date: e.target.value})}
                  required
                />
              </div>
            </div>
            <button onClick={handleAllocationSubmit} className="btn btn-primary">Add Allocation</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Fund Component
const Fund = () => {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogin = (userType) => {
    setUser(userType);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode class to body
  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <div className="app">
      <style>{`
        :root {
          /* Light mode colors */
          --bg-primary: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
          --bg-card: linear-gradient(145deg, #ffffff, #f9fafb);
          --bg-secondary: #f3f4f6;
          --bg-tertiary: #f9fafb;
          --bg-hover: #e5e7eb;
          --bg-input: #ffffff;
          --bg-button: #3b82f6;
          --bg-button-hover: #2563eb;
          --bg-button-secondary: #dbeafe;
          --bg-button-secondary-hover: #bfdbfe;
          
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --text-tertiary: #4b5563;
          --text-muted: #9ca3af;
          --text-inverse: #ffffff;
          --text-accent: #3b82f6;
          --text-accent-hover: #1d4ed8;
          --text-dark: #111827;
          
          --border-color: #d1d5db;
          --border-separator: #e5e7eb;
          
          --shadow-card: 0 8px 20px rgba(0, 0, 0, 0.08);
          --shadow-card-hover: 0 16px 30px rgba(0, 0, 0, 0.15);
          --shadow-focus: 0 0 6px rgba(59, 130, 246, 0.3);
          
          --icon-color: #3b82f6;
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
        }

        /* Dark mode styles - applied when body has dark-mode class */
        body.dark-mode {
          --bg-primary: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          --bg-card: linear-gradient(145deg, #1e293b, #334155);
          --bg-secondary: #374151;
          --bg-tertiary: #374151;
          --bg-hover: #4b5563;
          --bg-input: #374151;
          --bg-button: #3b82f6;
          --bg-button-hover: #2563eb;
          --bg-button-secondary: #1e3a8a;
          --bg-button-secondary-hover: #1e40af;
          
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --text-tertiary: #e5e7eb;
          --text-muted: #9ca3af;
          --text-inverse: #ffffff;
          --text-accent: #60a5fa;
          --text-accent-hover: #3b82f6;
          --text-dark: #f9fafb;
          
          --border-color: #4b5563;
          --border-separator: #374151;
          
          --shadow-card: 0 8px 20px rgba(0, 0, 0, 0.3);
          --shadow-card-hover: 0 16px 30px rgba(0, 0, 0, 0.4);
          --shadow-focus: 0 0 6px rgba(59, 130, 246, 0.5);
          
          --icon-color: #60a5fa;
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: var(--bg-primary);
          min-height: 100vh;
          transition: all 0.3s ease;
          color: var(--text-primary);
        }

        .app {
          min-height: 100vh;
        }

        /* Login Page Styles */
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
        }

        .login-card {
          background: var(--bg-card);
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: var(--shadow-card);
          text-align: center;
          max-width: 500px;
          width: 100%;
          border: 1px solid var(--border-color);
        }

        .login-card h1 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .login-card p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .login-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Button Styles */
        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card-hover);
        }

        .btn-public {
          background: var(--success-color);
          color: var(--text-inverse);
        }

        .btn-public:hover {
          background: #059669;
        }

        .btn-admin {
          background: var(--bg-button);
          color: var(--text-inverse);
        }

        .btn-admin:hover {
          background: var(--bg-button-hover);
        }

        .btn-logout {
          background: var(--error-color);
          color: var(--text-inverse);
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
        }

        .btn-logout:hover {
          background: #dc2626;
        }

        .btn-primary {
          background: var(--bg-button);
          color: var(--text-inverse);
        }

        .btn-primary:hover {
          background: var(--bg-button-hover);
        }

        .theme-toggle {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
          padding: 0.5rem;
          border-radius: 0.75rem;
          margin-left: 1rem;
        }

        .theme-toggle:hover {
          background: var(--bg-hover);
          transform: none;
          box-shadow: none;
        }

        /* Dashboard Styles */
        .dashboard {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .dashboard-header {
          background: var(--bg-card);
          padding: 1.5rem 2rem;
          box-shadow: var(--shadow-card);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--border-separator);
        }

        .dashboard-header h1 {
          color: var(--text-primary);
          font-size: 1.75rem;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dashboard-content {
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Card Styles */
        .card {
          background: var(--bg-card);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-4px);
        }

        .card h2 {
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
          font-weight: 600;
          border-bottom: 2px solid var(--border-separator);
          padding-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Summary Card */
        .summary-card {
          grid-column: 1 / -1;
        }

        .summary-stats {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 0.75rem;
          min-width: 200px;
        }

        .stat-label {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          font-weight: 500;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-accent);
        }

        /* Chart Card */
        .chart-card {
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .chart-card .recharts-wrapper {
          flex: 1;
        }

        /* Table Styles */
        .table-card {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          background: var(--bg-input);
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .data-table th {
          background: var(--bg-secondary);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border-separator);
          font-size: 0.95rem;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-separator);
          color: var(--text-primary);
        }

        .row-even {
          background-color: var(--bg-tertiary);
        }

        .row-odd {
          background-color: var(--bg-input);
        }

        .data-table tr:hover {
          background-color: var(--bg-hover);
        }

        /* Form Styles */
        .form-card {
          grid-column: 1 / -1;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .form-group {
          flex: 1;
          min-width: 250px;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: 0.75rem;
          font-size: 1rem;
          background: var(--bg-input);
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--text-accent);
          box-shadow: var(--shadow-focus);
        }

        .form-group input::placeholder {
          color: var(--text-muted);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .dashboard-header {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }

          .summary-stats {
            flex-direction: column;
            align-items: center;
          }

          .stat {
            min-width: 100%;
          }

          .form-row {
            flex-direction: column;
          }

          .login-card {
            margin: 1rem;
            padding: 2rem;
          }

          .login-card h1 {
            font-size: 2rem;
          }
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      {!user && <LoginPage onLogin={handleLogin} />}
      {user === 'public' && <PublicDashboard onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}
      {user === 'admin' && <AdminDashboard onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}
    </div>
  );
};

export default Fund;