const API_KEY = "3921f76f67f5b98cfb51140ee409c279";

async function fetchWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=ru&id&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка при получении данных о погоде:", error);
  }
}

function updateWeatherCard(weatherData) {
  console.log(weatherData);
  const weatherCard = document.getElementById("weather-card");
  if (!weatherCard || !weatherData) return;

  const { temp } = weatherData.main;
  const name = weatherData.name;
  const { description, icon } = weatherData.weather[0];

  weatherCard.innerHTML = `
    <h2>${name}</h2>
    <p>Температура: ${(temp - 273.15).toFixed(2)}°C</p>
    <p>${description}</p>
    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" style="width:32px; height:32px"/>
  `;
}

function showWeather() {
  if (!navigator.geolocation) {
    console.log("Geolocation не поддерживается вашим браузером");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const weatherData = await fetchWeather(latitude, longitude);

      if (weatherData) {
        updateWeatherCard(weatherData);
      }
    },
    (error) => {
      console.error("Ошибка при определении местоположения:", error);
    }
  );
}
