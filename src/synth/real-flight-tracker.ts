// Real Flight Tracking - OpenSky Network (Free API)
export class RealFlightTracker {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 30000; // 30 seconds (flights move fast)

  constructor() {
    console.log('[RealFlightTracker] Initialized with OpenSky Network API');
  }

  // Get all flights in a bounding box
  async getFlightsInBounds(
    lamin: number, // min latitude
    lamax: number, // max latitude
    lomin: number, // min longitude
    lomax: number  // max longitude
  ): Promise<any[]> {
    const cacheKey = `flights_${lamin}_${lamax}_${lomin}_${lomax}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://opensky-network.org/api/states/all?lamin=${lamin}&lamin=${lamax}&lomin=${lomin}&lomax=${lomax}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('[RealFlightTracker] Rate limited, using cached data');
          return this.getLastKnownFlights();
        }
        throw new Error(`OpenSky API error: ${response.status}`);
      }

      const data = await response.json();
      const states = data.states || [];

      const flights = states.map((state: any[]) => ({
        icao24: state[0],
        callsign: state[1]?.trim() || 'Unknown',
        origin: state[2] || 'Unknown',
        timePosition: state[3],
        lastContact: state[4],
        longitude: state[5],
        latitude: state[6],
        baroAltitude: state[7],
        onGround: state[8],
        velocity: state[9],
        trueTrack: state[10],
        verticalRate: state[11],
        sensors: state[12],
        geoAltitude: state[13],
        squawk: state[14],
        spi: state[15],
        positionSource: state[16]
      }));

      this.setCache(cacheKey, flights);
      return flights;
    } catch (error) {
      console.error('[RealFlightTracker] Flight fetch failed:', error);
      return this.getLastKnownFlights();
    }
  }

  // Get flights by callsign or ICAO24
  async getFlightByCallsign(callsign: string): Promise<any | null> {
    try {
      const response = await fetch(
        `https://opensky-network.org/api/states/all?icao24=${callsign.toLowerCase()}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      const states = data.states || [];

      if (states.length === 0) return null;

      const state = states[0];
      return {
        icao24: state[0],
        callsign: state[1]?.trim() || 'Unknown',
        origin: state[2] || 'Unknown',
        longitude: state[5],
        latitude: state[6],
        baroAltitude: state[7],
        onGround: state[8],
        velocity: state[9],
        trueTrack: state[10],
        verticalRate: state[11]
      };
    } catch (error) {
      console.error('[RealFlightTracker] Flight lookup failed:', error);
      return null;
    }
  }

  // Get flights by country
  async getFlightsByCountry(country: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://opensky-network.org/api/states/all?country=${encodeURIComponent(country)}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      const states = data.states || [];

      return states.map((state: any[]) => ({
        icao24: state[0],
        callsign: state[1]?.trim() || 'Unknown',
        origin: state[2] || 'Unknown',
        longitude: state[5],
        latitude: state[6],
        baroAltitude: state[7],
        velocity: state[9],
        trueTrack: state[10]
      }));
    } catch (error) {
      console.error('[RealFlightTracker] Country flight fetch failed:', error);
      return [];
    }
  }

  // Get all flights (global)
  async getAllFlights(): Promise<any[]> {
    try {
      const response = await fetch('https://opensky-network.org/api/states/all');

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('[RealFlightTracker] Rate limited');
          return this.getLastKnownFlights();
        }
        throw new Error(`OpenSky API error: ${response.status}`);
      }

      const data = await response.json();
      const states = data.states || [];

      return states.map((state: any[]) => ({
        icao24: state[0],
        callsign: state[1]?.trim() || 'Unknown',
        origin: state[2] || 'Unknown',
        longitude: state[5],
        latitude: state[6],
        baroAltitude: state[7],
        velocity: state[9],
        trueTrack: state[10]
      }));
    } catch (error) {
      console.error('[RealFlightTracker] Global flight fetch failed:', error);
      return this.getLastKnownFlights();
    }
  }

  // Get last known flights from cache
  private getLastKnownFlights(): any[] {
    for (const [key, value] of this.cache) {
      if (key.startsWith('flights_')) {
        return value.data || [];
      }
    }
    return [];
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Find flights near a location
  async findFlightsNear(latitude: number, longitude: number, radiusKm: number = 100): Promise<any[]> {
    const allFlights = await this.getAllFlights();
    
    return allFlights.filter(flight => {
      if (!flight.latitude || !flight.longitude) return false;
      const distance = this.calculateDistance(latitude, longitude, flight.latitude, flight.longitude);
      return distance <= radiusKm;
    });
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

    // Limit cache size
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
      apiSource: 'OpenSky Network',
      rateLimit: '1 request per 10 seconds (anonymous)'
    };
  }
}
