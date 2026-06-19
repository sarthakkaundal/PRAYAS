import React, { useState } from 'react';
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import { auth } from './Auth/firebase';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const db = getDatabase();
      const messagesRef = ref(db, 'contact_messages');
      await push(messagesRef, {
        ...formData,
        userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
        timestamp: serverTimestamp(),
      });
      alert('Message sent successfully.');
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (error) {
      console.error("Error sending message: ", error);
      alert('Failed to send message: ' + error.message);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    { question: "How do I update shelter information?", answer: "Email shelters@prayas.in with shelter ID, location, capacity, and contact details." },
    { question: "What is the system maintenance SLA?", answer: "Priority 1 issues are resolved within 24 hours. Emergency (Priority 0) issues receive immediate response." },
    { question: "How can I suggest a new feature?", answer: "Use the contact form with subject 'Feature Request'. Include detailed description of the proposed feature." },
    { question: "How accurate is the flood prediction?", answer: "Risk indicators aggregate real-time weather data and historical patterns. Always defer to official emergency broadcasts for critical decisions." }
  ];

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--grid-border)',
    backgroundColor: 'var(--bg-base)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const focusHandlers = {
    onFocus: (e) => { e.target.style.borderColor = 'var(--accent-volt)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-volt-dim)'; },
    onBlur: (e) => { e.target.style.borderColor = 'var(--grid-border)'; e.target.style.boxShadow = 'none'; },
  };

  const emergencyServices = [
    { service: 'Police', number: '100', color: '#3b82f6' },
    { service: 'Ambulance', number: '102', color: '#ef4444' },
    { service: 'Fire', number: '101', color: '#f97316' },
    { service: 'Disaster Helpline', number: '1078', color: 'var(--accent-volt)' },
    { service: 'NDRF HQ', number: '011-24363260', color: '#14b8a6', wide: true },
  ];

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="opacity-0 animate-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>01</span>
          <span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Support & Emergency</span>
        </div>
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Emergency Coordination Center</h1>
          <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Contact support and access emergency services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Contact Form — Linear style */}
        <div className="opacity-0 animate-in" style={{ animationDelay: '0.05s' }}>
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-volt)' }}></div>
              Send Message
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} {...focusHandlers} />
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={inputStyle} {...focusHandlers} />
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange} style={inputStyle}>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Shelter Information Update">Shelter Update</option>
                  <option value="Report a Bug">Bug Report</option>
                  <option value="Suggest a New Feature">Feature Request</option>
                  <option value="Emergency Services">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} required rows="4" style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} {...focusHandlers} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px' }} onMouseOver={(e) => { e.target.style.boxShadow = 'var(--shadow-glow-volt)'; }} onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}>Send Message</button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5 opacity-0 animate-in" style={{ animationDelay: '0.1s' }}>
          {/* Emergency Numbers — ArcGIS-style alert cards */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--status-danger)' }}></div>
              Emergency Numbers
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {emergencyServices.map((item, index) => (
                <div key={index} className={`rounded-lg p-3.5 border transition-all duration-200 ${item.wide ? 'col-span-2' : ''}`}
                  style={{ backgroundColor: `${item.color}08`, borderColor: `${item.color}20`, borderLeft: `3px solid ${item.color}` }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 2px 8px ${item.color}15`; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>{item.service}</span>
                  <span className="text-lg font-bold block" style={{ color: item.color }}>{item.number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HQ Info */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              Headquarters
            </h2>
            <div className="rounded-lg p-4 font-mono text-sm leading-relaxed" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-border)', color: 'var(--text-secondary)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>National Disaster Management Authority</p>
              <p>NDMA Bhawan, A-1</p>
              <p>Safdarjung Enclave</p>
              <p>New Delhi - 110029, India</p>
            </div>
          </div>

          {/* FAQ — with smooth animations */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
            </div>
            <div className="flex flex-col">
              {faqItems.map((faq, index) => (
                <div key={index} style={{ borderBottom: index < faqItems.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left flex justify-between items-center transition-colors duration-150"
                    style={{ cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontFamily: 'inherit', fontSize: '13px', color: expandedFaq === index ? 'var(--accent-volt)' : 'var(--text-primary)', fontWeight: '500' }}
                    onMouseOver={(e) => { if (expandedFaq !== index) e.currentTarget.style.backgroundColor = 'var(--bg-base)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span>{faq.question}</span>
                    <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)', color: expandedFaq === index ? 'var(--accent-volt)' : 'var(--text-tertiary)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div style={{
                    maxHeight: expandedFaq === index ? '200px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}>
                    <div className="px-4 pb-4">
                      <div className="rounded-lg p-3 text-sm leading-relaxed" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-border)', borderLeft: '3px solid var(--accent-volt)', color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;