// Real Weather API - OpenWeatherMap (Free tier)
export class RealWeatherAPI {
  private apiKey: string;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 600000; // 10 minutes

  constructor(apiKey: string = 'demo') {
    this.apiKey = apiKey;
    console.log('[RealWeatherAPI] Initialized with OpenWeatherMap');
  }

  // Get current weather by city name
  async getCurrentWeather(city: string): Promise<any | null> {
    const cacheKey = `weather_${city}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('[RealWeatherAPI] Invalid API key, using demo data');
          return this.getDemoWeather(city);
        }
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const weather = {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDeg: data.wind.deg,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        visibility: data.visibility,
        clouds: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
        timezone: data.timezone
      };

      this.setCache(cacheKey, weather);
      return weather;
    } catch (error) {
      console.error('[RealWeatherAPI] Weather fetch failed:', error);
      return this.getDemoWeather(city);
    }
  }

  // Get weather by coordinates
  async getWeatherByCoords(lat: number, lon: number): Promise<any | null> {
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) return this.getDemoWeather(`${lat},${lon}`);

      const data = await response.json();
      const weather = {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      };

      this.setCache(cacheKey, weather);
      return weather;
    } catch (error) {
      console.error('[RealWeatherAPI] Coord weather fetch failed:', error);
      return this.getDemoWeather(`${lat},${lon}`);
    }
  }

  // Get 5-day forecast
  async getForecast(city: string): Promise<any[]> {
    const cacheKey = `forecast_${city}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) return [];

      const data = await response.json();
      const forecast = data.list.map((item: any) => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));

      this.setCache(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.error('[RealWeatherAPI] Forecast fetch failed:', error);
      return [];
    }
  }

  // Demo weather data (fallback)
  private getDemoWeather(location: string): any {
    return {
      city: location,
      country: 'Demo',
      temperature: 20 + Math.random() * 10,
      feelsLike: 20 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
      description: 'Demo weather data - API key required for real data',
      icon: '01d',
      demo: true
    };
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
      apiSource: 'OpenWeatherMap',
      hasApiKey: this.apiKey !== 'demo'
    };
  }
}

// Real Earthquake Data - USGS (Free)
export class RealEarthquakeAPI {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 300000; // 5 minutes

  constructor() {
    console.log('[RealEarthquakeAPI] Initialized with USGS Earthquake Hazards Program');
  }

  // Get recent earthquakes
  async getRecentEarthquakes(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<any[]> {
    const cacheKey = `earthquakes_${timeframe}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const urls: Record<string, string> = {
        hour: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
        day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
        week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
        month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
      };

      const response = await fetch(urls[timeframe]);
      if (!response.ok) throw new Error(`USGS API error: ${response.status}`);

      const data = await response.json();
      const earthquakes = data.features.map((feature: any) => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        place: feature.properties.place,
        time: new Date(feature.properties.time).toISOString(),
        updated: new Date(feature.properties.updated).toISOString(),
        timezone: feature.properties.tz,
        url: feature.properties.url,
        detail: feature.properties.detail,
        felt: feature.properties.felt,
        reportedIntensity: feature.properties.cdi,
        estimatedIntensity: feature.properties.mmi,
        alert: feature.properties.alert,
        status: feature.properties.status,
        tsunami: feature.properties.tsunami,
        type: feature.properties.type,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        depth: feature.geometry.coordinates[2]
      }));

      this.setCache(cacheKey, earthquakes);
      return earthquakes;
    } catch (error) {
      console.error('[RealEarthquakeAPI] Earthquake fetch failed:', error);
      return [];
    }
  }

  // Get significant earthquakes
  async getSignificantEarthquakes(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any[]> {
    try {
      const urls: Record<string, string> = {
        day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson',
        week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
        month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson'
      };

      const response = await fetch(urls[timeframe]);
      if (!response.ok) return [];

      const data = await response.json();
      return data.features.map((feature: any) => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        place: feature.properties.place,
        time: new Date(feature.properties.time).toISOString(),
        url: feature.properties.url,
        alert: feature.properties.alert,
        tsunami: feature.properties.tsunami,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        depth: feature.geometry.coordinates[2]
      }));
    } catch (error) {
      console.error('[RealEarthquakeAPI] Significant earthquake fetch failed:', error);
      return [];
    }
  }

  // Get earthquakes by magnitude
  async getEarthquakesByMagnitude(minMag: number, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any[]> {
    const all = await this.getRecentEarthquakes(timeframe);
    return all.filter(eq => eq.magnitude >= minMag);
  }

  // Get earthquakes near a location
  async getEarthquakesNear(latitude: number, longitude: number, radiusKm: number = 500): Promise<any[]> {
    const all = await this.getRecentEarthquakes('week');
    
    return all.filter(eq => {
      const distance = this.calculateDistance(latitude, longitude, eq.latitude, eq.longitude);
      return distance <= radiusKm;
    });
  }

  // Calculate distance (Haversine)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
      apiSource: 'USGS Earthquake Hazards Program',
      rateLimit: 'Unlimited (free)'
    };
  }
}
