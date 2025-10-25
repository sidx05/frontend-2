'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, MapPin, Thermometer, Wind, Droplets } from 'lucide-react';

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

interface WeatherWidgetProps {
  city?: string;
  lat?: string;
  lon?: string;
  className?: string;
}

export default function WeatherWidget({ 
  city = 'Hyderabad', 
  lat, 
  lon, 
  className = '' 
}: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeatherData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (lat) params.append('lat', lat);
      if (lon) params.append('lon', lon);
      if (city) params.append('city', city);

      const response = await fetch(`/api/weather?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setWeatherData(result.data);
      } else {
        setError(result.error || 'Failed to fetch weather data');
      }
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [city, lat, lon]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={() => fetchWeatherData(true)} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather
          </CardTitle>
          <Button 
            onClick={() => fetchWeatherData(true)} 
            variant="ghost" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{weatherData.city}</span>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="text-4xl">{weatherData.current.icon}</span>
            <div>
              <div className="text-3xl font-bold">{weatherData.current.temperature}°C</div>
              <div className="text-sm text-muted-foreground">{weatherData.current.description}</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              <span>{weatherData.current.windSpeed} km/h {getWindDirection(weatherData.current.windDirection)}</span>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">5-Day Forecast</h4>
          <div className="space-y-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{day.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{formatDate(day.date)}</div>
                    <div className="text-xs text-muted-foreground">{day.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {day.precipitation > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <Droplets className="h-3 w-3" />
                      <span>{day.precipitation.toFixed(1)}mm</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">{day.maxTemp}°</span>
                    <span className="text-muted-foreground">/{day.minTemp}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {new Date(weatherData.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}