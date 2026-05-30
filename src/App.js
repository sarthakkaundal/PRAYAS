import React, { useState, useEffect } from 'react';
import './App.css';
import Reports from './pages/Reports';
import Map from './pages/Map';
import Help from './pages/Help';
import Fund from './pages/Fund'; // Import the Fund component

// Header Component
const Header = ({ setCurrentPage, currentPage }) => {
	const [currentTime, setCurrentTime] = useState('');

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const dateOptions = {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			};
			const timeOptions = {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			};

			const dateStr = now.toLocaleDateString('en-CA', dateOptions);
			const timeStr = now.toLocaleTimeString('en-US', timeOptions);

			setCurrentTime(`SYS.DATE: ${dateStr} // ${timeStr}`);
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="header">
			<div className="header-left">
				<h1>PRAYAS</h1>
				<p>{currentTime}</p>
			</div>
			<div className="header-icons">
				<div
					className={`icon-card ${currentPage === 'report' ? 'active' : ''}`}
					onClick={() => setCurrentPage('report')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<span>Reports</span>
				</div>

				<div
					className={`icon-card ${currentPage === 'funds' ? 'active' : ''}`}
					onClick={() => setCurrentPage('funds')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Funds</span>
				</div>

				<div
					className={`icon-card ${currentPage === 'map' ? 'active' : ''}`}
					onClick={() => setCurrentPage('map')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11a2 2 0 100-4 2 2 0 000 4z" />
					</svg>
					<span>Map</span>
				</div>

				<div
					className={`icon-card ${currentPage === 'help' ? 'active' : ''}`}
					onClick={() => setCurrentPage('help')}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.5 4.5a1 1 0 01-.217 1.013l-2.1 2.1a11.042 11.042 0 005.516 5.516l2.1-2.1a1 1 0 011.013-.217l4.5 1.5a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z" />
					</svg>
					<span>Contact</span>
				</div>

				{currentPage !== 'dashboard' && (
					<div
						className="icon-card"
						onClick={() => setCurrentPage('dashboard')}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						<span>Dashboard</span>
					</div>
				)}
			</div>
		</div>
	);
};

// Weather Card Component
const WeatherCard = () => {
	const [weather, setWeather] = useState({
		temperature: '--',
		condition: '--',
		humidity: '--',
		rainfall: '--',
		wind: '--',
	});
	const [cityInput, setCityInput] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	const getWeather = async (city = 'Delhi') => {
		const apiKey = process.env.REACT_APP_WEATHER_API_KEY || ''; 
		setErrorMsg('');

		if (!apiKey) {
			setErrorMsg('SYS_ERR: DATA_COULD_NOT_BE_LOADED_PROPERLY');
			return;
		}

		const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.cod !== 200 && data.cod !== "200") {
				console.error("OpenWeather API Error Data:", data);
				setErrorMsg('SYS_ERR: DATA_COULD_NOT_BE_LOADED_PROPERLY');
				return;
			}

			setWeather({
				temperature: `${Math.round(data.main.temp)}°`,
				condition: data.weather[0].description,
				humidity: `${data.main.humidity}%`,
				rainfall: data.rain ? `${data.rain['1h'] || data.rain['3h'] || 0}mm` : '0.0mm',
				wind: `${data.wind.speed} km/h`,
			});
		} catch (error) {
			console.error('Error fetching weather data:', error);
			setErrorMsg('SYS_ERR: DATA_COULD_NOT_BE_LOADED_PROPERLY');
		}
	};

	useEffect(() => {
		getWeather();
	}, []);

	const handleSearch = () => {
		getWeather(cityInput || 'Delhi');
	};

	return (
		<div className="card">
			<div className="card-header">
				<h2 className="card-title">
					<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"></path>
					</svg>
					Weather Data
				</h2>
			</div>

			<div className="search-box">
				<input
					type="text"
					value={cityInput}
					onChange={(e) => setCityInput(e.target.value)}
					placeholder="INPUT CITY_NAME"
				/>
				<button onClick={handleSearch}>Scan</button>
			</div>

			{errorMsg && (
				<div style={{ fontFamily: 'JetBrains Mono', color: 'var(--status-danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
					{errorMsg}
				</div>
			)}

			<div className="weather-info">
				<div className="temperature">
					<div className="temperature-value">{weather.temperature}</div>
					<div className="weather-condition">{weather.condition}</div>
				</div>
				<div className="weather-details">
					<div className="weather-item">
						<span>Humidity</span>
						<span>{weather.humidity}</span>
					</div>
					<div className="weather-item">
						<span>Rainfall</span>
						<span>{weather.rainfall}</span>
					</div>
					<div className="weather-item">
						<span>Wind</span>
						<span>{weather.wind}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

// Risk Indicator Component
const RiskIndicator = () => {
	const floodRisk = 0;

	const getRiskLevel = (risk) => {
		if (risk < 30) return { level: 'Low', color: '#00ff9d' };
		if (risk < 70) return { level: 'Medium', color: '#ffae00' };
		return { level: 'High', color: '#ff2a55' };
	};

	const riskInfo = getRiskLevel(floodRisk);
	const radius = 42;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (floodRisk / 100) * circumference;

	return (
		<div className="card">
            <div className="card-header">
                <h2 className="card-title">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    Threat Assessment
                </h2>
            </div>
			<div className="risk-indicator">
				<div className="circular-progress">
					<svg viewBox="0 0 100 100">
						<circle className="progress-bg" cx="50" cy="50" r="42"></circle>
						<circle
							className="progress-bar"
							cx="50"
							cy="50"
							r="42"
							style={{
								stroke: riskInfo.color,
								strokeDasharray: circumference,
								strokeDashoffset: strokeDashoffset,
							}}
						></circle>
					</svg>
					<div className="progress-text">
						<div className="progress-percentage" style={{ color: riskInfo.color }}>
							{floodRisk}%
						</div>
						<div className="progress-label">PROBABILITY</div>
					</div>
				</div>
				<div className="risk-level" style={{ borderColor: riskInfo.color, color: riskInfo.color }}>
					<div>{riskInfo.level} Risk Level</div>
					<div className="risk-level-text">BASED ON LOCAL TELEMETRY</div>
				</div>
			</div>
		</div>
	);
};

// Shelters List Component
const SheltersList = () => {
	const shelters = [
		{ id: 1, name: 'Chiheru Railway Station', distance: 3.8, type: 'government', icon: '🚉' },
	].sort((a, b) => a.distance - b.distance);

	return (
		<div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
                <h2 className="card-title">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Safe Zones (Nearest)
                </h2>
            </div>
			<div className="shelters-list">
				{shelters.map((shelter) => (
					<div key={shelter.id} className="shelter-item">
						<div className="shelter-info">
							<div className="shelter-icon">{shelter.icon}</div>
							<div>
								<div className="shelter-name">{shelter.name}</div>
								<div className="shelter-type">Class: {shelter.type}</div>
							</div>
						</div>
						<div className="shelter-distance">
							<div className="distance-value">{shelter.distance} KM</div>
							<div className="distance-label">RANGE</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// Alerts List Component
const AlertsList = () => {
	const recentAlerts = [
		{ id: 3, message: 'No risk around your area', time: '1 HOUR AGO', isNew: false },
	];

	return (
		<div className="card">
            <div className="card-header">
                <h2 className="card-title">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 17h5l-5 5v-5zM11 17H6l5 5v-5zM8 12V7a4 4 0 118 0v5H8z"></path>
                    </svg>
                    System Alerts
                </h2>
            </div>
			<div className="alerts-list">
				{recentAlerts.map((alert) => (
					<div key={alert.id} className="alert-item">
						<div className={`alert-indicator ${alert.isNew ? 'alert-new' : 'alert-old'}`}></div>
						<div className="alert-content">
							<div className="alert-message">{alert.message}</div>
							<div className="alert-time">{alert.time}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// News List Component
const NewsList = () => {
	const [news, setNews] = useState([]);

	const fetchIndiaNews = async () => {
		const apiKey = '';
		const url = `https://newsapi.org/v2/everything?q=flood OR disaster AND India&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;

		try {
			const res = await fetch(url);
			const data = await res.json();

			const newsItems = data.articles.map((article, index) => ({
				id: index + 1,
				title: article.title,
				time: new Date(article.publishedAt).toLocaleString(),
				url: article.url,
			}));

			setNews(newsItems);
		} catch (error) {
			console.error('Error fetching news:', error);
			setNews([
				{ id: 1, title: 'Local authorities prepare for monsoon season', time: '2 HOURS AGO', url: '#' },
				{ id: 2, title: 'New flood early warning system installed', time: '4 HOURS AGO', url: '#' },
				{ id: 3, title: 'Emergency services conduct rescue drills', time: '6 HOURS AGO', url: '#' },
			]);
		}
	};

	useEffect(() => {
		fetchIndiaNews();
	}, []);

	return (
		<div className="card">
            <div className="card-header">
                <h2 className="card-title">Intel Feed</h2>
            </div>
			<div className="news-list">
				{news.map((item) => (
					<div key={item.id} className="news-item">
						<div className="news-header">
							<h3 className="news-title">{item.title}</h3>
							<a className="news-link" href={item.url} target="_blank" rel="noopener noreferrer">
								[VIEW]
							</a>
						</div>
						<div className="news-time">{item.time}</div>
					</div>
				))}
			</div>
		</div>
	);
};

// Main App Component
const App = () => {
	const [currentPage, setCurrentPage] = useState('dashboard'); // default view

	// Render dashboard content
	const renderDashboard = () => (
		<>
			<div className="dashboard-grid cols-2">
				<WeatherCard />
				<RiskIndicator />
			</div>
			<div className="dashboard-grid cols-1">
			    <SheltersList />
            </div>
			<div className="dashboard-grid cols-2">
				<AlertsList />
				<NewsList />
			</div>
		</>
	);

	// Determine if current page should be full width
	const isFullWidthPage = currentPage === 'map' || currentPage === 'report' || currentPage === 'help' || currentPage === 'funds';

	return (
		<div className={`container ${isFullWidthPage ? 'full-width' : ''}`}>
			<Header
				setCurrentPage={setCurrentPage}
				currentPage={currentPage}
			/>

			{/* Conditional rendering based on current page */}
			{currentPage === 'dashboard' && renderDashboard()}
			{currentPage === 'report' && <Reports />}
			{currentPage === 'funds' && <Fund />}
			{currentPage === 'map' && <Map />}
			{currentPage === 'help' && <Help />}
		</div>
	);
};

export default App;
