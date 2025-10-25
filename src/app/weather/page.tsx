'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Thermometer, Wind, Droplets, Eye, Sunrise, Sunset } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

interface WeatherData {
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    windDirection: number;
    time: string;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    precipitation: number;
    description: string;
    icon: string;
  }>;
  lastUpdated: string;
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('Hyderabad');
  const [searchCity, setSearchCity] = useState('');

  const fetchWeatherData = async (cityName: string = city) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
      const result = await response.json();

      if (result.success) {
        setWeatherData(result.data);
        setCity(cityName);
      } else {
        setError(result.error || 'Failed to fetch weather data');
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherData(searchCity.trim());
      setSearchCity('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 35) return 'text-red-500';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-yellow-500';
    if (temp >= 5) return 'text-blue-500';
    return 'text-blue-700';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Weather Report</h1>
              <p className="text-muted-foreground">Get real-time weather information and forecasts</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="Enter city name..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading weather data...</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">{error}</div>
              <Button onClick={() => fetchWeatherData()}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {weatherData && !loading && (
          <div className="space-y-8">
            {/* Current Weather */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Current Weather - {weatherData.city}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Weather Info */}
                    <div className="md:col-span-2 text-center">
                      <div className="flex items-center justify-center gap-6 mb-6">
                        <span className="text-8xl">{weatherData.current.icon}</span>
                        <div>
                          <div className={`text-6xl font-bold ${getTemperatureColor(weatherData.current.temperature)}`}>
                            {weatherData.current.temperature}°C
                          </div>
                          <div className="text-xl text-muted-foreground mt-2">
                            {weatherData.current.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Last updated: {formatTime(weatherData.current.time)}
                      </div>
                    </div>

                    {/* Weather Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Wind className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Wind</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{weatherData.current.windSpeed} km/h</div>
                          <div className="text-sm text-muted-foreground">
                            {getWindDirection(weatherData.current.windDirection)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Thermometer className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Feels Like</span>
                        </div>
                        <div className="font-semibold">{weatherData.current.temperature}°C</div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Eye className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Visibility</span>
                        </div>
                        <div className="font-semibold">Good</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 5-Day Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>5-Day Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {weatherData.forecast.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="text-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-sm font-medium mb-2">
                          {formatDate(day.date)}
                        </div>
                        <div className="text-3xl mb-2">{day.icon}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {day.description}
                        </div>
                        <div className="flex justify-center gap-2 mb-2">
                          <span className="font-semibold">{day.maxTemp}°</span>
                          <span className="text-muted-foreground">/{day.minTemp}°</span>
                        </div>
                        {day.precipitation > 0 && (
                          <div className="flex items-center justify-center gap-1 text-xs text-blue-500">
                            <Droplets className="h-3 w-3" />
                            <span>{day.precipitation.toFixed(1)}mm</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weather Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Weather Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weatherData.current.temperature > 30 && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">🌡️ Hot Weather</h4>
                        <p className="text-orange-700 text-sm">
                          Stay hydrated, wear light clothing, and avoid prolonged sun exposure.
                        </p>
                      </div>
                    )}
                    
                    {weatherData.current.windSpeed > 20 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">💨 Windy Conditions</h4>
                        <p className="text-blue-700 text-sm">
                          Be cautious when driving and secure loose objects outdoors.
                        </p>
                      </div>
                    )}
                    
                    {weatherData.forecast.some(day => day.precipitation > 5) && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">🌧️ Rain Expected</h4>
                        <p className="text-blue-700 text-sm">
                          Carry an umbrella and be prepared for wet conditions.
                        </p>
                      </div>
                    )}
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">📱 Stay Updated</h4>
                      <p className="text-green-700 text-sm">
                        Weather conditions can change quickly. Check regularly for updates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
