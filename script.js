const apiKey = 'c761d618284ca17e025f9c20cd5f6713';
const searchButton = document.getElementById('search-button');
const locationInput = document.getElementById('location-input');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const visibility = document.getElementById('visibility');
const weatherIcon = document.getElementById('weather-icon');

searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        const selectedUnit = document.getElementById('unit-select').value;
        fetchWeatherByCityName(location, selectedUnit)
            .then(data => updateWeatherInfo(data, selectedUnit))
            .catch(error => handleWeatherError(error));
    }
});

const unitSelect = document.getElementById('unit-select');

unitSelect.addEventListener('change', () => {
    const location = locationInput.value;
    const selectedUnit = unitSelect.value;
    fetchWeatherByCityName(location, selectedUnit)
        .then(data => updateWeatherInfo(data, selectedUnit))
        .catch(error => handleWeatherError(error));
});

const useLocationButton = document.getElementById('use-location-button');

useLocationButton.addEventListener('click', () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    const selectedUnit = document.getElementById('unit-select').value;
                    const data = await fetchWeatherByCoordinates(latitude, longitude, selectedUnit);
                    updateWeatherInfo(data, selectedUnit);
                } catch (error) {
                    handleWeatherError(error);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
            }
        );
    } else {
        console.error('Geolocation is not supported by your browser.');
    }
});

function updateWeatherInfo(data, selectedUnit) {
    // Update weather information on the page as needed
    const cityNameElement = document.getElementById('city-name');
    const dateTimeElement = document.getElementById('date-time');
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    const formattedDate = currentDate.toLocaleDateString(undefined, options);

    cityNameElement.textContent = `City: ${data.name}`;
    dateTimeElement.textContent = `Date and Time: ${formattedDate}`;
    temperature.textContent = `Temperature: ${data.main.temp}°${selectedUnit === 'metric' ? 'C' : 'F'}`;
    description.textContent = `Description: ${data.weather[0].description}`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    visibility.textContent = `Visibility: ${data.visibility / 1000} km`;

    // Set the weather icon based on the weather condition
    const weatherIconClass = `wi wi-owm-${data.weather[0].id}`;
    weatherIcon.className = weatherIconClass;

    // Set the weather condition class on the body element
    const weatherCondition = data.weather[0].main.toLowerCase();
    document.body.className = `weather-condition-${weatherCondition}`;

    displayWeatherForecast(data.name, apiKey);
}

async function fetchWeatherByCityName(cityName, selectedUnit) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${selectedUnit}&appid=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data by city name:', error);
        throw error;
    }
}

async function fetchWeatherByCoordinates(latitude, longitude, selectedUnit) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${selectedUnit}&appid=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data by coordinates:', error);
        throw error;
    }
}

function handleWeatherError(error) {
    console.error('Error fetching weather data:', error);
    temperature.textContent = 'Location not found';
    description.textContent = '';
    humidity.textContent = '';
    wind.textContent = '';
    visibility.textContent = '';
    document.body.className = '';
    weatherIcon.className = '';
}

async function fetchWeatherForecast(cityName, apiKey) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather forecast data:', error);
        throw error;
    }
}

async function displayWeatherForecast(cityName, apiKey) {
    try {
        const forecastData = await fetchWeatherForecast(cityName, apiKey);
        const forecastElement = document.querySelector('.weather-forecast');

        // Clear any previous forecast data
        forecastElement.innerHTML = '';

        // Extract and display forecast data
        forecastData.list.slice(0, 3).forEach((forecast) => {
            const date = new Date(forecast.dt * 1000);
            const temperature = forecast.main.temp;
            const description = forecast.weather[0].description;

            // Create HTML elements to display forecast data
            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <p>Date: ${date.toLocaleDateString()}</p>
                <p>Temperature: ${temperature}°C</p>
                <p>Description: ${description}</p>
            `;

            forecastElement.appendChild(forecastItem);
        });
    } catch (error) {
        console.error('Error displaying weather forecast:', error);
    }
}

// Initialize the weather app with a default location and unit
const defaultLocation = ''; // You can change this to your desired default location
const defaultUnit = 'metric'; // You can change this to 'imperial' for Fahrenheit

// Call the updateBackground function with the initial weather condition (Clear)
updateBackground('Clear');

// Call the fetchWeatherByCityName function with the default location and unit
fetchWeatherByCityName(defaultLocation, defaultUnit)
    .then(data => {
        updateWeatherInfo(data, defaultUnit);
        updateBackground(data.weather[0].main);
    })
    .catch(error => handleWeatherError(error));

// Function to update the background image based on weather condition
function updateBackground(weatherCondition) {
    const body = document.body; // Or select a specific container element
    const weatherBackgrounds = {
        Clear: 'url(./images/clear.jpg)',
        Clouds: 'url(./images/cloudy.jpg)',
        Rain: 'url(./images/rainy.jpg)',
        Sunny: 'url(./images/sunny.jpg)', // Added the "Sunny" condition
        // Add more weather conditions and image URLs here
    };

    const backgroundImage = weatherBackgrounds[weatherCondition] || 'url(./images/default-image.jpg)';

    body.style.backgroundImage = backgroundImage;
}

