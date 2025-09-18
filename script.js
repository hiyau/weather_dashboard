const API_KEY = '982039cc38a6cb62fcdb61c71670584a'; // Replace with your actual OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Major cities database for autocomplete
const majorCities = [
    { name: 'New York', country: 'US', coords: [40.7128, -74.0060] },
    { name: 'London', country: 'UK', coords: [51.5074, -0.1278] },
    { name: 'Paris', country: 'FR', coords: [48.8566, 2.3522] },
    { name: 'Tokyo', country: 'JP', coords: [35.6762, 139.6503] },
    { name: 'Sydney', country: 'AU', coords: [-33.8688, 151.2093] },
    { name: 'Dubai', country: 'AE', coords: [25.2048, 55.2708] },
    { name: 'Singapore', country: 'SG', coords: [1.3521, 103.8198] },
    { name: 'Mumbai', country: 'IN', coords: [19.0760, 72.8777] },
    { name: 'Delhi', country: 'IN', coords: [28.7041, 77.1025] },
    { name: 'Bangalore', country: 'IN', coords: [12.9716, 77.5946] },
    { name: 'Hyderabad', country: 'IN', coords: [17.3850, 78.4867] },
    { name: 'Chennai', country: 'IN', coords: [13.0827, 80.2707] },
    { name: 'Kolkata', country: 'IN', coords: [22.5726, 88.3639] },
    { name: 'Pune', country: 'IN', coords: [18.5204, 73.8567] },
    { name: 'Berlin', country: 'DE', coords: [52.5200, 13.4050] },
    { name: 'Madrid', country: 'ES', coords: [40.4168, -3.7038] },
    { name: 'Rome', country: 'IT', coords: [41.9028, 12.4964] },
    { name: 'Amsterdam', country: 'NL', coords: [52.3676, 4.9041] },
    { name: 'Barcelona', country: 'ES', coords: [41.3851, 2.1734] },
    { name: 'Istanbul', country: 'TR', coords: [41.0082, 28.9784] },
    { name: 'Moscow', country: 'RU', coords: [55.7558, 37.6176] },
    { name: 'Cairo', country: 'EG', coords: [30.0444, 31.2357] },
    { name: 'Lagos', country: 'NG', coords: [6.5244, 3.3792] },
    { name: 'São Paulo', country: 'BR', coords: [-23.5558, -46.6396] },
    { name: 'Mexico City', country: 'MX', coords: [19.4326, -99.1332] },
    { name: 'Buenos Aires', country: 'AR', coords: [-34.6118, -58.3960] },
    { name: 'Toronto', country: 'CA', coords: [43.6532, -79.3832] },
    { name: 'Vancouver', country: 'CA', coords: [49.2827, -123.1207] },
    { name: 'Los Angeles', country: 'US', coords: [34.0522, -118.2437] },
    { name: 'Chicago', country: 'US', coords: [41.8781, -87.6298] },
    { name: 'Miami', country: 'US', coords: [25.7617, -80.1918] },
    { name: 'San Francisco', country: 'US', coords: [37.7749, -122.4194] },
    { name: 'Seattle', country: 'US', coords: [47.6062, -122.3321] },
    { name: 'Boston', country: 'US', coords: [42.3601, -71.0589] }
];

let selectedCity = null;

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '🌨️', '13n': '🌨️',
    '50d': '🌫️', '50n': '🌫️'
};

function showError(message) {
    document.getElementById('errorMessage').innerHTML = 
        `<div class="error">${message}</div>`;
    setTimeout(() => {
        document.getElementById('errorMessage').innerHTML = '';
    }, 5000);
}

function showLoading() {
    document.getElementById('weatherContent').innerHTML = 
        `<div class="loading">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>`;
}

function getWeatherIcon(iconCode) {
    return weatherIcons[iconCode] || '🌤️';
}

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

async function showDropdown(cities) {
    const dropdown = document.getElementById('dropdown');
    if (cities.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = cities.map(city => {
        const location = city.state ? 
            `${city.name}, ${city.state}, ${city.country}` : 
            `${city.name}, ${city.country}`;
        return `<div class="dropdown-item" onclick="selectCity('${city.name}', '${city.country}', ${city.coords ? `[${city.coords[0]}, ${city.coords[1]}]` : 'null'})">${location}</div>`;
    }).join('');
    dropdown.style.display = 'block';
}

function selectCity(cityName, country, coords) {
    selectedCity = { 
        name: cityName, 
        country: country,
        coords: coords 
    };
    document.getElementById('cityInput').value = `${cityName}, ${country}`;
    document.getElementById('dropdown').style.display = 'none';
}

function filterCities(query) {
    if (query.length < 2) return [];
    return majorCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
}

async function searchCitiesAPI(query) {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        // Fallback to local database if no API key
        return filterCities(query);
    }
            
    try {
        const response = await fetch(
            `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
        );
                
        if (!response.ok) throw new Error('API request failed');
                
        const data = await response.json();
        return data.map(city => ({
            name: city.name,
            country: city.country,
            state: city.state,
            coords: [city.lat, city.lon]
        }));
    } catch (error) {
        console.error('Geocoding API error:', error);
        // Fallback to local database
        return filterCities(query);
    }
}

async function getWeatherByCoords(lat, lon, cityName) {
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Weather API request failed');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        return {
            current: currentData,
            forecast: forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5)
        };
    } catch (error) {
        console.error('Weather API error:', error);
        throw error;
    }
}

async function getWeatherByCity(cityName) {
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`),
            fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Weather API request failed');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        return {
            current: currentData,
            forecast: forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5)
        };
    } catch (error) {
        console.error('Weather API error:', error);
        throw error;
    }
}

async function getWeather(city = null) {
    const cityInput = document.getElementById('cityInput');
    let searchCity;
            
    if (city) {
        searchCity = city;
    } else if (selectedCity) {
        searchCity = selectedCity.name;
    } else {
        const inputValue = cityInput.value.trim();
        if (!inputValue) {
            showError('Please enter a city name or select from dropdown');
            return;
        }
        searchCity = inputValue.split(',')[0]; // Take only city name if format is "City, Country"
    }

    showLoading();

    try {
        let weatherData;
                
        // Check if we have an API key
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            showError('Please add your OpenWeatherMap API key to get real weather data. Currently showing demo data.');
            weatherData = generateMockWeatherData(searchCity);
        } else {
            // Use real API
            if (selectedCity && selectedCity.coords) {
                // Use coordinates if available for more accurate results
                weatherData = await getWeatherByCoords(
                    selectedCity.coords[0], 
                    selectedCity.coords[1], 
                    searchCity
                );
            } else {
                // Use city name search
                weatherData = await getWeatherByCity(searchCity);
            }
        }
                
        displayWeather(weatherData);
    } catch (error) {
        showError('Unable to fetch weather data. Please check your internet connection and try again.');
        console.error('Weather API error:', error);
    }
}

function generateMockWeatherData(city) {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
    const icons = ['01d', '02d', '10d', '13d', '11d'];
            
    // Use city name to generate consistent but varied data
    const cityHash = city.toLowerCase().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const randomCondition = cityHash % conditions.length;
    const baseTempSeed = (cityHash * 7) % 35;
    const baseTemp = baseTempSeed + 5; // 5-40°C
            
    return {
        current: {
            name: city,
            main: {
                temp: baseTemp,
                feels_like: baseTemp + ((cityHash * 3) % 6) - 3,
                humidity: ((cityHash * 5) % 40) + 40,
                pressure: ((cityHash * 11) % 50) + 1000
            },
            weather: [{
                main: conditions[randomCondition],
                description: conditions[randomCondition].toLowerCase(),
                icon: icons[randomCondition]
            }],
            wind: {
                speed: ((cityHash * 13) % 20) + 1
            },
            visibility: ((cityHash * 17) % 5000) + 5000,
            sys: {
                sunrise: Date.now() / 1000 - 3600,
                sunset: Date.now() / 1000 + 3600
            }
        },
        forecast: Array.from({length: 5}, (_, i) => ({
            dt: (Date.now() / 1000) + (i + 1) * 86400,
            main: {
                temp_max: baseTemp + ((cityHash * (i + 1) * 7) % 10) - 5,
                temp_min: baseTemp - ((cityHash * (i + 1) * 11) % 10) - 5
            },
            weather: [{
                main: conditions[((cityHash * (i + 1)) % conditions.length)],
                icon: icons[((cityHash * (i + 1)) % icons.length)]
            }]
        }))
    };
}

function displayWeather(data) {
    const current = data.current;
    const forecast = data.forecast;

    const weatherHTML = `
            <div class="weather-cards">
            <div class="weather-card current-weather">
                <h2>${current.name}</h2>
                <div class="weather-icon">${getWeatherIcon(current.weather[0].icon)}</div>
                <div class="temperature">${Math.round(current.main.temp)}°C</div>
                <div class="weather-description">${current.weather[0].description}</div>
                <div class="weather-details">
                    <div class="detail-item">
                        <div class="detail-label">Feels like</div>
                        <div class="detail-value">${Math.round(current.main.feels_like)}°C</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Humidity</div>
                        <div class="detail-value">${current.main.humidity}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Wind Speed</div>
                        <div class="detail-value">${current.wind.speed} m/s</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Pressure</div>
                        <div class="detail-value">${current.main.pressure} hPa</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Visibility</div>
                        <div class="detail-value">${(current.visibility / 1000).toFixed(1)} km</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">UV Index</div>
                        <div class="detail-value">${Math.floor(Math.random() * 8) + 1}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="forecast-container">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-grid">
                ${forecast.map(day => `
                    <div class="forecast-item">
                        <div class="forecast-date">${formatDate(day.dt)}</div>
                        <div class="forecast-icon">${getWeatherIcon(day.weather[0].icon)}</div>
                        <div>${day.weather[0].main}</div>
                        <div class="forecast-temps">
                            <span>H: ${Math.round(day.main.temp_max)}°</span>
                            <span>L: ${Math.round(day.main.temp_min)}°</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('weatherContent').innerHTML = weatherHTML;
}

        // Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const cityInput = document.getElementById('cityInput');
            
    cityInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        selectedCity = null; // Reset selection when typing
                
        if (query.length >= 2) {
            const filteredCities = filterCities(query);
            showDropdown(filteredCities);
        } else {
            hideDropdown();
        }
    });

    cityInput.addEventListener('blur', function() {
        hideDropdown();
    });

    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            hideDropdown();
            getWeather();
        }
    });

    // Load default weather on page load
    getWeather('London');
});