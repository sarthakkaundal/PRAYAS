export const RISK_LEVELS = [
  { 
    max: 20, 
    level: 'Very Low', 
    color: 'var(--status-success)', 
    recommendations: ['Normal monitoring'] 
  },
  { 
    max: 40, 
    level: 'Low', 
    color: 'var(--status-info)', 
    recommendations: ['Stay informed'] 
  },
  { 
    max: 60, 
    level: 'Moderate', 
    color: 'var(--status-warning)', 
    recommendations: ['Monitor official alerts'] 
  },
  { 
    max: 80, 
    level: 'High', 
    color: 'var(--status-danger)', 
    recommendations: ['Prepare emergency supplies', 'Identify nearby shelters'] 
  },
  { 
    max: 100, 
    level: 'Extreme', 
    color: 'var(--status-danger)', 
    recommendations: ['Immediate evacuation if advised', 'Avoid flooded roads', 'Contact emergency services'] 
  }
];

export const getRiskCategory = (score) => {
  return RISK_LEVELS.find(r => score <= r.max) || RISK_LEVELS[RISK_LEVELS.length - 1];
};
