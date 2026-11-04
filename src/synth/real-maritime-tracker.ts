// Real Maritime Tracking - Using MarineTraffic alternatives and AIS data
export class RealMaritimeTracker {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 60000; // 1 minute

  constructor() {
    console.log('[RealMaritimeTracker] Initialized with AIS data sources');
  }

  // Get vessel data from AISHub (free AIS data)
  async getVesselsInBounds(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number
  ): Promise<any[]> {
    const cacheKey = `vessels_${minLat}_${maxLat}_${minLon}_${maxLon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // AISHub provides free AIS data
      const response = await fetch(
        `http://data.aishub.net/ws.php?username=demo&format=1&output=json`
      );

      if (!response.ok) throw new Error(`AISHub API error: ${response.status}`);

      const data = await response.json();
      
      // Filter by bounds
      const vessels = data.filter((vessel: any) => {
        const lat = vessel.LATITUDE;
        const lon = vessel.LONGITUDE;
        return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
      }).map((vessel: any) => ({
        mmsi: vessel.MMSI,
        name: vessel.NAME || `Vessel ${vessel.MMSI}`,
        latitude: vessel.LATITUDE,
        longitude: vessel.LONGITUDE,
        speed: vessel.SPEED,
        course: vessel.COURSE,
        heading: vessel.HEADING,
        shipType: this.getShipTypeName(vessel.SHIPTYPE),
        destination: vessel.DESTINATION || 'Unknown',
        lastUpdate: vessel.LASTUPDATE
      }));

      this.setCache(cacheKey, vessels);
      return vessels;
    } catch (error) {
      console.error('[RealMaritimeTracker] Vessel fetch failed:', error);
      return [];
    }
  }

  // Get vessel by MMSI
  async getVesselByMMSI(mmsi: string): Promise<any | null> {
    try {
      const response = await fetch(
        `http://data.aishub.net/ws.php?username=demo&format=1&output=json&mmsi=${mmsi}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data.length === 0) return null;

      const vessel = data[0];
      return {
        mmsi: vessel.MMSI,
        name: vessel.NAME || `Vessel ${vessel.MMSI}`,
        latitude: vessel.LATITUDE,
        longitude: vessel.LONGITUDE,
        speed: vessel.SPEED,
        course: vessel.COURSE,
        heading: vessel.HEADING,
        shipType: this.getShipTypeName(vessel.SHIPTYPE),
        destination: vessel.DESTINATION || 'Unknown',
        lastUpdate: vessel.LASTUPDATE
      };
    } catch (error) {
      console.error('[RealMaritimeTracker] Vessel lookup failed:', error);
      return null;
    }
  }

  // Get vessels by type
  async getVesselsByType(shipType: number): Promise<any[]> {
    try {
      const response = await fetch(
        `http://data.aishub.net/ws.php?username=demo&format=1&output=json&shiptype=${shipType}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.map((vessel: any) => ({
        mmsi: vessel.MMSI,
        name: vessel.NAME || `Vessel ${vessel.MMSI}`,
        latitude: vessel.LATITUDE,
        longitude: vessel.LONGITUDE,
        speed: vessel.SPEED,
        course: vessel.COURSE,
        shipType: this.getShipTypeName(vessel.SHIPTYPE)
      }));
    } catch (error) {
      console.error('[RealMaritimeTracker] Type filter failed:', error);
      return [];
    }
  }

  // Get all vessels
  async getAllVessels(): Promise<any[]> {
    try {
      const response = await fetch(
        `http://data.aishub.net/ws.php?username=demo&format=1&output=json`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.map((vessel: any) => ({
        mmsi: vessel.MMSI,
        name: vessel.NAME || `Vessel ${vessel.MMSI}`,
        latitude: vessel.LATITUDE,
        longitude: vessel.LONGITUDE,
        speed: vessel.SPEED,
        course: vessel.COURSE,
        shipType: this.getShipTypeName(vessel.SHIPTYPE)
      }));
    } catch (error) {
      console.error('[RealMaritimeTracker] Global vessel fetch failed:', error);
      return [];
    }
  }

  // Find vessels near a location
  async findVesselsNear(latitude: number, longitude: number, radiusKm: number = 100): Promise<any[]> {
    const allVessels = await this.getAllVessels();
    
    return allVessels.filter(vessel => {
      if (!vessel.latitude || !vessel.longitude) return false;
      const distance = this.calculateDistance(latitude, longitude, vessel.latitude, vessel.longitude);
      return distance <= radiusKm;
    });
  }

  // Ship type names
  private getShipTypeName(typeCode: number): string {
    const types: Record<number, string> = {
      0: 'Unknown',
      20: 'Wing in ground',
      30: 'Fishing',
      31: 'Towing',
      32: 'Towing (large)',
      33: 'Dredging',
      35: 'Military',
      36: 'Sailing',
      37: 'Pleasure',
      40: 'High speed craft',
      50: 'Pilot vessel',
      51: 'Search and rescue',
      52: 'Tug',
      53: 'Port tender',
      55: 'Law enforcement',
      60: 'Passenger',
      70: 'Cargo',
      71: 'Cargo (hazardous)',
      80: 'Tanker',
      81: 'Tanker (hazardous)'
    };

    return types[typeCode] || `Type ${typeCode}`;
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
      apiSource: 'AISHub',
      rateLimit: 'Demo account - limited requests'
    };
  }
}
