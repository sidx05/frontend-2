import { NextRequest, NextResponse } from 'next/server';

// GET /api/weather?lat=17.3850&lon=78.4867&city=Hyderabad - Get weather data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const city = searchParams.get('city') || 'Hyderabad';
    
    // Default coordinates for Hyderabad if not provided
    const latitude = lat || '17.3850';
    const longitude = lon || '78.4867';
    
    // Open-Meteo API endpoints
    const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto&forecast_days=5`;
    
    // Fetch current weather and forecast
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    
    // Weather code mapping
    const weatherCodes: { [key: number]: { description: string; icon: string } } = {
      0: { description: 'Clear sky', icon: '☀️' },
      1: { description: 'Mainly clear', icon: '🌤️' },
      2: { description: 'Partly cloudy', icon: '⛅' },
      3: { description: 'Overcast', icon: '☁️' },
      45: { description: 'Foggy', icon: '🌫️' },
      48: { description: 'Depositing rime fog', icon: '🌫️' },
      51: { description: 'Light drizzle', icon: '🌦️' },
      53: { description: 'Moderate drizzle', icon: '🌦️' },
      55: { description: 'Dense drizzle', icon: '🌦️' },
      61: { description: 'Slight rain', icon: '🌧️' },
      63: { description: 'Moderate rain', icon: '🌧️' },
      65: { description: 'Heavy rain', icon: '🌧️' },
      71: { description: 'Slight snow', icon: '❄️' },
      73: { description: 'Moderate snow', icon: '❄️' },
      75: { description: 'Heavy snow', icon: '❄️' },
      77: { description: 'Snow grains', icon: '❄️' },
      80: { description: 'Slight rain showers', icon: '🌦️' },
      81: { description: 'Moderate rain showers', icon: '🌦️' },
      82: { description: 'Violent rain showers', icon: '🌦️' },
      85: { description: 'Slight snow showers', icon: '🌨️' },
      86: { description: 'Heavy snow showers', icon: '🌨️' },
      95: { description: 'Thunderstorm', icon: '⛈️' },
      96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
      99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
    };
    
    const currentWeather = currentData.current_weather;
    const weatherInfo = weatherCodes[currentWeather.weathercode] || { description: 'Unknown', icon: '❓' };
    
    // Format forecast data
    const forecast = forecastData.daily.time.slice(0, 5).map((date: string, index: number) => ({
      date,
      maxTemp: Math.round(forecastData.daily.temperature_2m_max[index]),
      minTemp: Math.round(forecastData.daily.temperature_2m_min[index]),
      weatherCode: forecastData.daily.weathercode[index],
      precipitation: forecastData.daily.precipitation_sum[index],
      ...weatherCodes[forecastData.daily.weathercode[index]] || { description: 'Unknown', icon: '❓' }
    }));
    
    const weatherData = {
      city,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      current: {
        temperature: Math.round(currentWeather.temperature),
        weatherCode: currentWeather.weathercode,
        windSpeed: Math.round(currentWeather.windspeed),
        windDirection: currentWeather.winddirection,
        time: currentWeather.time,
        ...weatherInfo
      },
      forecast,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: weatherData
    });
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}