'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Thermometer, Wind } from 'lucide-react';

interface WeatherData {
  city: string;
  current: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    description: string;
    icon: string;
  };
  lastUpdated: string;
}

interface WeatherCompactProps {
  city?: string;
  lat?: string;
  lon?: string;
  className?: string;
}

export default function WeatherCompact({ 
  city = 'Hyderabad', 
  lat, 
  lon, 
  className = '' 
}: WeatherCompactProps) {
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

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-xs text-red-500 mb-2">Weather unavailable</p>
            <Button 
              onClick={() => fetchWeatherData(true)} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
              className="h-6 text-xs"
            >
              {refreshing ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{weatherData.current.icon}</div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{weatherData.city}</span>
              </div>
              <div className="text-lg font-bold">{weatherData.current.temperature}°C</div>
              <div className="text-xs text-muted-foreground">{weatherData.current.description}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Wind className="h-3 w-3" />
              <span>{weatherData.current.windSpeed} km/h {getWindDirection(weatherData.current.windDirection)}</span>
            </div>
            <Button 
              onClick={() => fetchWeatherData(true)} 
              variant="ghost" 
              size="sm"
              disabled={refreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
