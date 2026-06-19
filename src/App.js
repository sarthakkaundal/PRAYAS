import React, { useState, useEffect } from 'react';

import Reports from './pages/Reports';
import Map from './pages/Map';
import Help from './pages/Help';
import Fund from './pages/Fund'; // Import the Fund component
import Profile from './pages/Profile';
import AuthPage from './pages/Auth/AuthPage';
import { auth } from './pages/Auth/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

// Header Component
const Header = ({ theme, toggleTheme, user }) => {
	const [currentTime, setCurrentTime] = useState('');
	const location = useLocation();
	const navigate = useNavigate();
	const currentPage = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

	const handleLogout = async () => {
		try {
			await signOut(auth);
			navigate('/');
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

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
		<div className="flex justify-between items-stretch border-b border-grid bg-surface sticky top-0 z-[100]">
			<div className="p-6 border-r border-grid flex-1">
				<Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
					<h1 className="text-4xl font-bold uppercase tracking-wider mb-2">PRAYAS</h1>
				</Link>
				<p className="font-mono text-sm text-secondary">{currentTime}</p>
			</div>
			<div className="flex">
				<Link to="/report" style={{ textDecoration: 'none' }}
					className={`flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid transition-snap group ${currentPage === 'report' ? 'bg-volt text-inverse' : 'bg-surface hover:bg-volt hover:text-inverse'}`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<span className="font-mono text-xs mt-2 uppercase font-bold">Reports</span>
				</Link>

				<Link to="/funds" style={{ textDecoration: 'none' }}
					className={`flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid transition-snap group ${currentPage === 'funds' ? 'bg-volt text-inverse' : 'bg-surface hover:bg-volt hover:text-inverse'}`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span className="font-mono text-xs mt-2 uppercase font-bold">Funds</span>
				</Link>

				<Link to="/map" style={{ textDecoration: 'none' }}
					className={`flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid transition-snap group ${currentPage === 'map' ? 'bg-volt text-inverse' : 'bg-surface hover:bg-volt hover:text-inverse'}`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11a2 2 0 100-4 2 2 0 000 4z" />
					</svg>
					<span className="font-mono text-xs mt-2 uppercase font-bold">Map</span>
				</Link>

				<Link to="/help" style={{ textDecoration: 'none' }}
					className={`flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid transition-snap group ${currentPage === 'help' ? 'bg-volt text-inverse' : 'bg-surface hover:bg-volt hover:text-inverse'}`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.5 4.5a1 1 0 01-.217 1.013l-2.1 2.1a11.042 11.042 0 005.516 5.516l2.1-2.1a1 1 0 011.013-.217l4.5 1.5a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z" />
					</svg>
					<span className="font-mono text-xs mt-2 uppercase font-bold">Contact</span>
				</Link>

				{currentPage !== 'dashboard' && (
					<Link to="/" style={{ textDecoration: 'none' }}
						className="flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid bg-surface hover:bg-volt hover:text-inverse transition-snap group"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						<span className="font-mono text-xs mt-2 uppercase font-bold">Dashboard</span>
					</Link>
				)}

				<Link to="/profile" style={{ textDecoration: 'none' }}
					className={`flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid transition-snap group ${currentPage === 'profile' ? 'bg-volt text-inverse' : 'bg-surface hover:bg-volt hover:text-inverse'}`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					<span className="font-mono text-xs mt-2 uppercase font-bold">Profile</span>
				</Link>
				
				<div
					className="flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid bg-surface hover:bg-volt hover:text-inverse transition-snap group"
					onClick={toggleTheme}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-inverse transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d={theme === 'light' ? "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" : "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"} />
					</svg>
					<span className="font-mono text-xs mt-2 uppercase font-bold">{theme === 'light' ? 'NIGHT' : 'DAY'}</span>
				</div>

				<div
					className="flex flex-col items-center justify-center w-24 cursor-pointer border-l border-grid bg-surface hover:bg-red-500 hover:text-white transition-snap group"
					onClick={handleLogout}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary group-hover:text-white transition-snap" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					<span className="font-mono text-xs mt-2 uppercase font-bold text-red-500 group-hover:text-white transition-snap">Logout</span>
				</div>
			</div>
		</div>
	);
};

// Weather Card Component
const WeatherCard = () => {
	const [weather, setWeather] = useState({
		city: '--',
		temperature: '--',
		condition: '--',
		humidity: '--',
		rainfall: '--',
		wind: '--',
	});
	const [cityInput, setCityInput] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState([]);

	const getWeather = async (city = 'Delhi') => {
		const apiKey = process.env.REACT_APP_WEATHER_API_KEY || ''; 
		setErrorMsg('');

		const clearWeather = () => {
			setWeather({
				city: '--',
				temperature: '--',
				condition: '--',
				humidity: '--',
				rainfall: '--',
				wind: '--',
			});
		};

		if (!apiKey) {
			clearWeather();
			setErrorMsg('SYS_ERR: DATA_COULD_NOT_BE_LOADED_PROPERLY');
			return;
		}

		const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.cod !== 200 && data.cod !== "200") {
				console.error("OpenWeather API Error Data:", data);
				clearWeather();
				setErrorMsg('SYS_ERR: DATA_COULD_NOT_BE_LOADED_PROPERLY');
				return;
			}

			setWeather({
				city: data.name.toUpperCase(),
				temperature: `${Math.round(data.main.temp)}°`,
				condition: data.weather[0].description.toUpperCase(),
				humidity: `${data.main.humidity}%`,
				rainfall: data.rain ? `${data.rain['1h'] || data.rain['3h'] || 0}mm` : '0.0mm',
				wind: `${data.wind.speed} km/h`,
			});
		} catch (error) {
			console.error('Error fetching weather data:', error);
			clearWeather();
			setErrorMsg('SYS_ERR: DATA_COULD_NOT_BE_LOADED_PROPERLY');
		}
	};

	useEffect(() => {
		getWeather();
	}, []);

	const handleInputChange = async (e) => {
		const value = e.target.value;
		setCityInput(value);
		
		if (value.length >= 2) {
			const apiKey = process.env.REACT_APP_WEATHER_API_KEY || ''; 
			if (!apiKey) return;
			try {
				const url = `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${apiKey}`;
				const res = await fetch(url);
				const data = await res.json();
				if (Array.isArray(data) && data.length > 0) {
					const cityStrings = data.map(c => {
						return c.state ? `${c.name}, ${c.state}, ${c.country}` : `${c.name}, ${c.country}`;
					});
					setSuggestions([...new Set(cityStrings)]);
					setShowSuggestions(true);
				} else {
					setSuggestions([]);
					setShowSuggestions(false);
				}
			} catch(err) {
				console.error("Geocoding Error:", err);
			}
		} else {
			setShowSuggestions(false);
		}
	};

	const handleSearch = () => {
		setShowSuggestions(false);
		getWeather(cityInput || 'Delhi');
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<div className="flex flex-col bg-base mb-[1px]">
			<div className="flex justify-between items-center p-4 border-b border-grid bg-base">
				<h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">
					<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"></path>
					</svg>
					Weather Data
				</h2>
			</div>

			<div className="relative flex border-b border-grid" style={{ position: 'relative' }}>
				<input
					type="text"
					className="flex-1 bg-transparent border-none p-4 font-mono text-primary outline-none"
					value={cityInput}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
					onFocus={() => { if (cityInput.length > 0) setShowSuggestions(true); }}
					placeholder="INPUT CITY_NAME"
				/>
				<button 
					className="bg-transparent border-l border-grid p-4 font-mono uppercase font-bold text-primary hover:bg-volt hover:text-inverse transition-snap cursor-pointer"
					onClick={handleSearch}
				>Scan</button>

				{showSuggestions && suggestions.length > 0 && (
					<div style={{
						position: 'absolute',
						top: '100%',
						left: 0,
						width: 'calc(100% - 80px)', // leave room for scan button
						background: 'var(--bg-base)',
						border: '1px solid var(--grid-border)',
						borderTop: 'none',
						zIndex: 10,
						display: 'flex',
						flexDirection: 'column',
						boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
					}}>
						{suggestions.map(city => (
							<div 
								key={city}
								onMouseDown={() => { setCityInput(city); setShowSuggestions(false); getWeather(city); }}
								style={{
									padding: '0.75rem',
									cursor: 'pointer',
									fontFamily: 'JetBrains Mono',
									fontSize: '0.85rem',
									borderBottom: '1px solid var(--grid-border)',
									color: 'var(--text-primary)',
									transition: 'var(--transition-snap)'
								}}
								onMouseOver={(e) => { e.target.style.background = 'var(--accent-volt)'; e.target.style.color = 'var(--text-inverse)'; }}
								onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; }}
							>
								[LOC_MATCH]: {city}
							</div>
						))}
					</div>
				)}
			</div>

			{errorMsg && (
				<div style={{ fontFamily: 'JetBrains Mono', color: 'var(--status-danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
					{errorMsg}
				</div>
			)}

			<div className="flex flex-col gap-6">
				<div style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
					LOC: {weather.city}
				</div>
				<div className="text-center">
					<div className="text-6xl font-bold leading-none">{weather.temperature}</div>
					<div className="font-mono text-volt mt-2 uppercase tracking-widest">{weather.condition}</div>
				</div>
				<div className="flex flex-col gap-[1px] bg-grid mt-6">
					<div className="bg-base p-4 flex justify-between items-center">
						<span className="font-mono text-xs text-secondary uppercase tracking-widest">Humidity</span>
						<span className="font-mono font-bold text-sm">{weather.humidity}</span>
					</div>
					<div className="bg-base p-4 flex justify-between items-center">
						<span className="font-mono text-xs text-secondary uppercase tracking-widest">Rainfall</span>
						<span className="font-mono font-bold text-sm">{weather.rainfall}</span>
					</div>
					<div className="bg-base p-4 flex justify-between items-center">
						<span className="font-mono text-xs text-secondary uppercase tracking-widest">Wind</span>
						<span className="font-mono font-bold text-sm">{weather.wind}</span>
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
		<div className="flex flex-col bg-base mb-[1px]">
            <div className="flex justify-between items-center p-4 border-b border-grid bg-base">
                <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    Threat Assessment
                </h2>
            </div>
			<div className="flex flex-col items-center justify-center p-12 border-b border-grid bg-base gap-10">
				<div className="relative w-32 h-32 flex-shrink-0">
					<svg viewBox="0 0 100 100">
						<circle className="stroke-grid stroke-[2px] fill-transparent" cx="50" cy="50" r="46"></circle>
						<circle
							className="stroke-[2px] fill-transparent transition-all duration-1000 ease-out"
							cx="50"
							cy="50"
							r="46"
							style={{
								stroke: riskInfo.color,
								strokeDasharray: circumference,
								strokeDashoffset: strokeDashoffset,
							}}
						></circle>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<div className="text-3xl font-bold leading-none" style={{ color: riskInfo.color }}>
							{floodRisk}%
						</div>
						<div className="font-mono text-[10px] text-secondary mt-1 uppercase tracking-widest">PROBABILITY</div>
					</div>
				</div>
				<div className="w-full text-center font-bold uppercase border p-4" style={{ borderColor: riskInfo.color, color: riskInfo.color }}>
					<div className="text-sm tracking-wider">{riskInfo.level} Risk Level</div>
					<div className="font-mono text-[10px] text-secondary mt-2 tracking-widest">BASED ON LOCAL TELEMETRY</div>
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
		<div className="flex flex-col bg-base mb-[1px]" style={{ gridColumn: '1 / -1' }}>
            <div className="flex justify-between items-center p-4 border-b border-grid bg-base">
                <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Safe Zones (Nearest)
                </h2>
            </div>
			<div className="flex flex-col gap-0">
				{shelters.map((shelter) => (
					<div key={shelter.id} className="flex justify-between p-4 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] hover:z-10 relative">
						<div className="flex items-center gap-4">
							<div className="text-2xl">{shelter.icon}</div>
							<div>
								<div className="font-mono font-bold">{shelter.name}</div>
								<div className="font-mono text-xs text-secondary">Class: {shelter.type}</div>
							</div>
						</div>
						<div className="text-right">
							<div className="font-bold text-lg">{shelter.distance} KM</div>
							<div className="font-mono text-xs text-secondary">RANGE</div>
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
		<div className="flex flex-col bg-base mb-[1px]">
            <div className="flex justify-between items-center p-4 border-b border-grid bg-base">
                <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 17h5l-5 5v-5zM11 17H6l5 5v-5zM8 12V7a4 4 0 118 0v5H8z"></path>
                    </svg>
                    System Alerts
                </h2>
            </div>
			<div className="flex flex-col gap-0">
				{recentAlerts.map((alert) => (
					<div key={alert.id} className="flex items-start p-6 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] hover:z-10 relative">
						<div className={`w-2 h-2 mt-1.5 mr-4 shrink-0 bg-grid ${alert.isNew ? 'bg-volt shadow-[0_0_8px_var(--accent-volt)]' : 'bg-grid'}`}></div>
						<div className="flex flex-col gap-2">
							<div className="font-bold text-sm">{alert.message}</div>
							<div className="font-mono text-[10px] text-secondary uppercase tracking-widest">{alert.time}</div>
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
		const apiKey = process.env.REACT_APP_NEWS_API_KEY || '';
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
				{ id: 1, title: 'Local authorities prepare for monsoon season', time: '2 HOURS AGO', url: '' },
				{ id: 2, title: 'New flood early warning system installed', time: '4 HOURS AGO', url: '' },
				{ id: 3, title: 'Emergency services conduct rescue drills', time: '6 HOURS AGO', url: '' },
			]);
		}
	};

	useEffect(() => {
		fetchIndiaNews();
	}, []);

	return (
		<div className="flex flex-col bg-base mb-[1px]">
            <div className="flex justify-between items-center p-4 border-b border-grid bg-base">
                <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">Intel Feed</h2>
            </div>
			<div className="flex flex-col gap-0">
				{news.map((item) => (
					<div key={item.id} className="flex justify-between items-start p-6 border-b border-grid bg-base transition-snap hover:bg-volt-dim hover:shadow-[inset_4px_0_0_0_var(--accent-volt)] hover:z-10 relative">
						<div className="flex flex-col gap-2 pr-4">
							<h3 className="font-bold text-sm leading-snug">{item.title}</h3>
							<div className="font-mono text-[10px] text-secondary uppercase tracking-widest">{item.time}</div>
						</div>
						<a className="font-mono text-[10px] text-primary border border-grid px-2 py-1 hover:bg-grid hover:text-inverse transition-snap mt-1 shrink-0" href={item.url} target="_blank" rel="noopener noreferrer">
							[VIEW]
						</a>
					</div>
				))}
			</div>
		</div>
	);
};

// Footer Component
const Footer = () => (
	<div className="flex justify-between items-center p-6 border-t border-grid bg-surface mt-[1px]">
		<div className="font-mono text-xs text-secondary tracking-widest uppercase">
			© {new Date().getFullYear()} PRAYAS INITIATIVE
		</div>
		<div className="flex gap-6 font-mono text-xs font-bold uppercase">
			<Link to="/" style={{ textDecoration: 'none' }} className="cursor-pointer text-secondary hover:text-primary transition-snap">Privacy Policy</Link>
			<Link to="/" style={{ textDecoration: 'none' }} className="cursor-pointer text-secondary hover:text-primary transition-snap">Terms of Service</Link>
			<Link to="/help" style={{ textDecoration: 'none' }} className="cursor-pointer text-secondary hover:text-primary transition-snap">Contact HQ</Link>
		</div>
	</div>
);

// Main App Component
const App = () => {
	const [theme, setTheme] = useState(localStorage.getItem('prayas-theme') || 'dark');
	const [user, setUser] = useState(null);
	const [authChecked, setAuthChecked] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setAuthChecked(true);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('prayas-theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme(prev => prev === 'light' ? 'dark' : 'light');
	};

	// Render dashboard content
	const renderDashboard = () => (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-grid">
				<WeatherCard />
				<RiskIndicator />
			</div>
			<div className="grid grid-cols-1 gap-[1px] bg-grid">
			    <SheltersList />
            </div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-grid">
				<AlertsList />
				<NewsList />
			</div>
		</>
	);

	if (!authChecked) {
		return <div className="w-full min-h-screen bg-base flex justify-center items-center font-mono text-volt">INITIALIZING_SECURE_CONNECTION...</div>;
	}

	if (!user) {
		return <AuthPage setUserLoggedIn={() => {}} />;
	}

	return (
		<div className="w-full min-h-screen bg-base flex flex-col">
			<Header
				theme={theme}
				toggleTheme={toggleTheme}
				user={user}
			/>

			{/* Routes */}
			<div className="flex-1">
				<Routes>
					<Route path="/" element={renderDashboard()} />
					<Route path="/report" element={<Reports />} />
					<Route path="/funds/*" element={<Fund />} />
					<Route path="/map" element={<Map />} />
					<Route path="/help" element={<Help />} />
					<Route path="/profile" element={<Profile />} />
				</Routes>
			</div>

			<Footer />
		</div>
	);
};

export default App;
