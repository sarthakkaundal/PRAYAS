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
      alert('TRANSMISSION_SUCCESS: Message logged to system.');
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
      });
    } catch (error) {
      console.error("Error sending message: ", error);
      alert('TRANSMISSION_FAILED: ' + error.message);
    }
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
      <div className="p-8 border-b border-grid bg-base">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Comms & Support</h1>
        <p className="font-mono text-sm text-secondary uppercase tracking-widest">SECURE TRANSMISSION CHANNEL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-grid">
        {/* Contact Form */}
        <div className="flex flex-col bg-base p-8">
          <div className="flex items-center mb-8">
            <h2 className="text-[10px] font-mono text-secondary uppercase tracking-widest">TRANSMIT_MESSAGE</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">OPERATIVE_NAME</label>
              <input
                type="text"
                name="name"
                className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">COMMS_ADDRESS (EMAIL)</label>
              <input
                type="email"
                name="email"
                className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">TRANSMISSION_TYPE</label>
              <select
                name="subject"
                className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap"
                value={formData.subject}
                onChange={handleInputChange}
              >
                <option value="General Inquiry" className="bg-base">GENERAL_INQUIRY</option>
                <option value="Technical Support" className="bg-base">SYS_SUPPORT</option>
                <option value="Shelter Information Update" className="bg-base">SHELTER_UPDATE</option>
                <option value="Report a Bug" className="bg-base">BUG_REPORT</option>
                <option value="Suggest a New Feature" className="bg-base">FEATURE_REQ</option>
                <option value="Emergency Services" className="bg-base">EMERGENCY_OVERRIDE</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">PAYLOAD</label>
              <textarea
                name="message"
                className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap min-h-[120px] resize-y"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="5"
              />
            </div>

            <button type="submit" className="w-full bg-transparent border border-primary px-6 py-4 text-primary font-mono uppercase font-bold hover:bg-primary hover:text-base transition-snap">
              INITIATE_TRANSFER
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="flex flex-col gap-[1px] bg-grid">
          <div className="flex flex-col bg-base p-8">
            <div className="flex items-center mb-8">
              <h2 className="text-[10px] font-mono text-secondary uppercase tracking-widest">EMERGENCY_FREQUENCIES</h2>
            </div>
            <div className="flex flex-col gap-2 font-mono">
              {[
                { service: 'POLICE', number: '100' },
                { service: 'MEDEVAC', number: '102' },
                { service: 'FIRE_CTRL', number: '101' },
                { service: 'DISASTER_NET', number: '1078' },
                { service: 'NDRF_HQ', number: '011-24363260' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between p-4 border border-grid bg-transparent">
                  <span className="text-secondary text-sm">{item.service}</span>
                  <span className="text-volt font-bold text-sm">{item.number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col bg-base p-8 h-full">
            <div className="flex items-center mb-8">
              <h2 className="text-[10px] font-mono text-secondary uppercase tracking-widest">HQ_COORDINATES</h2>
            </div>
            <div className="font-mono text-sm text-secondary leading-relaxed">
              <p className="text-primary font-bold">NATIONAL DISASTER MGT AUTH</p>
              <p>NDMA BHAWAN, A-1</p>
              <p>SAFDARJUNG ENCLAVE</p>
              <p>NEW DELHI - 110029, IN</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-base mt-[1px]">
        <div className="flex items-center p-8 border-b border-grid">
          <h2 className="text-[10px] font-mono text-secondary uppercase tracking-widest">DATA_LOGS_FAQ</h2>
        </div>
        <div className="flex flex-col">
          {faqItems.map((faq, index) => (
            <div key={index} className="border-b border-grid">
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full p-6 text-left cursor-pointer flex justify-between font-mono text-sm transition-snap hover:bg-surface ${expandedFaq === index ? 'text-primary' : 'text-secondary'}`}
              >
                {faq.question}
                <span>{expandedFaq === index ? '[-]' : '[+]'}</span>
              </button>
              {expandedFaq === index && (
                <div className="p-6 pt-0 font-mono text-sm text-primary bg-transparent border-l-4 border-volt ml-6 mb-6">
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