export const CONTEXT_WEIGHTS = {
  // Soil saturation decay weights based on days past
  SOIL_SATURATION: {
    DAY_3: 0.5,
    DAY_7: 0.3,
    DAY_14: 0.15,
    DAY_30: 0.05
  },
  
  // Multipliers for deviations
  DEVIATION_MODIFIERS: {
    RAINFALL_HIGH: 1.3,
    RAINFALL_EXTREME: 1.6,
    PRESSURE_LOW: 1.2,
    HUMIDITY_HIGH: 1.15
  },

  // Thresholds
  THRESHOLDS: {
    SOIL_SATURATION_HIGH: 50, // mm of weighted accumulation
    SOIL_SATURATION_EXTREME: 100,
    RAINFALL_PERCENTILE_HIGH: 85,
    RAINFALL_PERCENTILE_EXTREME: 95
  }
};
