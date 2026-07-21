/**
 * Generates an explanation based on both current and historical context.
 */
export const generateContextualExplanation = (scores, finalScore, categoryLevel, context) => {
  if (finalScore < 20) {
    return {
      primaryDriver: "None",
      primaryExplanation: "Stable atmospheric conditions and minimal precipitation indicate a safe environment.",
      secondaryFactors: [],
      contextualNote: context ? "Current conditions are well within historical seasonal norms." : ""
    };
  }

  const contributions = [
    { name: "Heavy Rainfall", value: scores.rainfall, desc: "recent intense precipitation" },
    { name: "Low Pressure", value: scores.pressure, desc: "a cyclonic/low-pressure system" },
    { name: "High Humidity", value: scores.humidity, desc: "highly saturated atmospheric moisture" },
    { name: "Strong Winds", value: scores.wind, desc: "high wind speeds" },
    { name: "Cloud Cover", value: scores.cloud, desc: "dense storm clouds" }
  ];

  contributions.sort((a, b) => b.value - a.value);
  const primary = contributions[0];
  const secondary = contributions.slice(1).filter(c => c.value > 10).map(c => c.name);

  let explanation = `${primary.name} (${primary.desc}) is the most significant factor driving the current ${categoryLevel} risk level. `;
  let contextualNote = "";

  if (context) {
    if (primary.name === "Heavy Rainfall" && context.rainfallDeviation > 50) {
      const multiplier = (1 + (context.rainfallDeviation / 100)).toFixed(1);
      contextualNote += `Today's rainfall is ${multiplier}x higher than the historical seasonal average. `;
    }
    
    if (context.soilSaturationEstimate > 50) {
      contextualNote += `Furthermore, significant rainfall accumulation over the past few weeks has likely saturated the surrounding area, elevating flood susceptibility. `;
    }

    if (context.pressureDeviation < -1.5) {
      contextualNote += `Atmospheric pressure remains noticeably below seasonal norms, indicating instability. `;
    }
  }

  return {
    primaryDriver: primary.name,
    primaryExplanation: explanation + contextualNote,
    secondaryFactors: secondary,
    contextualNote
  };
};
