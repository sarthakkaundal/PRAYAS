import React, { useState } from 'react';

const Help = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('TRANSMISSION_SUCCESS');
    setFormData({
      name: '',
      email: '',
      subject: 'General Inquiry',
      message: ''
    });
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "SHELTER_UPDATE_PROCEDURE",
      answer: "Email shelters@prayas.in with ID, LOCATION, CAPACITY, and CONTACT_INFO."
    },
    {
      question: "SYSTEM_MAINTENANCE_SLA",
      answer: "Priority 1 issues: < 24h. Priority 0 (Emergency): Immediate dispatch."
    },
    {
      question: "FEATURE_REQUEST_PROTOCOL",
      answer: "Use subject 'Suggest a New Feature'. Telemetry logs will be analyzed for integration."
    },
    {
      question: "THREAT_MODEL_ACCURACY",
      answer: "Risk indicators aggregate real-time telemetry and historical matrices. Highly accurate, but defer to official emergency broadcasts."
    }
  ];

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Comms & Support</h1>
        <p className="page-subtitle">SECURE TRANSMISSION CHANNEL</p>
      </div>

      <div className="content-grid">
        {/* Contact Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">TRANSMIT_MESSAGE</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">OPERATIVE_NAME</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">COMMS_ADDRESS (EMAIL)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">TRANSMISSION_TYPE</label>
              <select
                name="subject"
                className="form-select"
                value={formData.subject}
                onChange={handleInputChange}
              >
                <option value="General Inquiry">GENERAL_INQUIRY</option>
                <option value="Technical Support">SYS_SUPPORT</option>
                <option value="Shelter Information Update">SHELTER_UPDATE</option>
                <option value="Report a Bug">BUG_REPORT</option>
                <option value="Suggest a New Feature">FEATURE_REQ</option>
                <option value="Emergency Services">EMERGENCY_OVERRIDE</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">PAYLOAD</label>
              <textarea
                name="message"
                className="form-textarea"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="5"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              INITIATE_TRANSFER
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">EMERGENCY_FREQUENCIES</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'JetBrains Mono' }}>
              {[
                { service: 'POLICE', number: '100' },
                { service: 'MEDEVAC', number: '102' },
                { service: 'FIRE_CTRL', number: '101' },
                { service: 'DISASTER_NET', number: '1078' },
                { service: 'NDRF_HQ', number: '011-24363260' }
              ].map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem',
                  border: '1px solid var(--grid-border)',
                  background: 'var(--bg-base)'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.service}</span>
                  <span style={{ color: 'var(--accent-volt)' }}>{item.number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">HQ_COORDINATES</h2>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <p style={{ color: 'var(--text-primary)' }}>NATIONAL DISASTER MGT AUTH</p>
              <p>NDMA BHAWAN, A-1</p>
              <p>SAFDARJUNG ENCLAVE</p>
              <p>NEW DELHI - 110029, IN</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderRight: 'none', borderBottom: 'none' }}>
        <div className="card-header">
          <h2 className="card-title">DATA_LOGS_FAQ</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqItems.map((faq, index) => (
            <div key={index} style={{ borderBottom: '1px solid var(--grid-border)' }}>
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'var(--bg-base)',
                  border: 'none',
                  borderLeft: expandedFaq === index ? '4px solid var(--accent-volt)' : '1px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'JetBrains Mono',
                  color: expandedFaq === index ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition-snap)'
                }}
              >
                {faq.question}
                <span>{expandedFaq === index ? '[-]' : '[+]'}</span>
              </button>
              {expandedFaq === index && (
                <div style={{
                  padding: '1rem',
                  paddingLeft: 'calc(1rem + 3px)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '0.85rem',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  borderLeft: '4px solid var(--accent-volt)',
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;