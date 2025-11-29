import React, { useState } from 'react';

const Help = ({ darkMode }) => {
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
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    // Reset form
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
      question: "How do I report a shelter location update?",
      answer: "You can email us at shelters@prayas.in with the details of the shelter location update including name, address, capacity, and contact information."
    },
    {
      question: "How quickly are website bugs fixed?",
      answer: "We aim to fix urgent issues within 24-48 hours. Critical bugs that affect emergency services are given highest priority and are addressed immediately."
    },
    {
      question: "Can I suggest new features?",
      answer: "Yes! Use the Subject dropdown in the contact form and select 'Suggest a New Feature.' We value community feedback and regularly implement useful suggestions."
    },
    {
      question: "How accurate is the flood risk indicator?",
      answer: "Our flood risk indicator uses real-time weather data, historical patterns, and geographic information to provide risk assessments. While highly accurate, always follow official emergency advisories."
    },
    {
      question: "How often is shelter information updated?",
      answer: "Shelter information is updated in real-time when changes are reported. We verify all updates within 20-40 minutes to ensure accuracy during emergency situations."
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: 'var(--text-primary)', 
          marginBottom: '10px',
          fontWeight: '600'
        }}>
          Contact & Support
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Get in touch with us for support, report issues, or suggest improvements to help us serve the community better.
        </p>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Contact Form */}
        <div className="card" style={{ minHeight: '790px' }}>
          <div className="card-header">
            <h2 className="card-title">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Send us a Message
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                color: 'var(--text-primary)' 
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--icon-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                color: 'var(--text-primary)' 
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--icon-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                color: 'var(--text-primary)' 
              }}>
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--icon-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Shelter Information Update">Shelter Information Update</option>
                <option value="Report a Bug">Report a Bug</option>
                <option value="Suggest a New Feature">Suggest a New Feature</option>
                <option value="Emergency Services">Emergency Services</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                color: 'var(--text-primary)' 
              }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Please provide as much detail as possible..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--icon-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                marginTop: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Emergency Numbers */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.5 4.5a1 1 0 01-.217 1.013l-2.1 2.1a11.042 11.042 0 005.516 5.516l2.1-2.1a1 1 0 011.013-.217l4.5 1.5a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z"></path>
                </svg>
                Emergency Numbers
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { service: 'Police', number: '100' },
                { service: 'Ambulance', number: '102' },
                { service: 'Fire', number: '101' },
                { service: 'Disaster Helpline', number: '1078' },
                { service: 'NDRF', number: '011-24363260' }
              ].map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.service}</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shelter Updates */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Shelter Information Updates
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              For officials or managers of shelters to add, remove, or update their location details, please contact{' '}
              <a
                href="mailto:shelters@prayas.in"
                style={{ 
                  color: 'var(--text-accent)', 
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                shelters@prayas.in
              </a>
            </p>
          </div>

          {/* Mailing Address */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Mailing Address
              </h2>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                National Disaster Management Authority (NDMA)
              </p>
              <p>NDMA Bhawan, A-1, Safdarjung Enclave</p>
              <p>New Delhi - 110029</p>
              <p>India</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Frequently Asked Questions
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Have a quick question? You might find your answer below before you reach out!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {faqItems.map((faq, index) => (
            <div 
              key={index}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
              >
                {faq.question}
                <span style={{ 
                  transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▼
                </span>
              </button>
              {expandedFaq === index && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  borderTop: '1px solid var(--border-color)'
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