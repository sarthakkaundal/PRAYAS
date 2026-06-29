export const getWeather = async (lat, lon) => {
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY || ''; 
  if (!apiKey) {
    throw new Error('Weather API key is missing');
  }
  
  const url = (lat && lon) 
    ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    : `https://api.openweathermap.org/data/2.5/weather?q=Delhi&units=metric&appid=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod === 200 || data.cod === "200") {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch weather');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};
