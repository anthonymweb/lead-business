import { InsertBusiness } from "@shared/schema";

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
}

interface SearchResult {
  place_id: string;
  name: string;
  vicinity: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Places API key is required');
    }
  }

  async searchBusinesses(location: string, query: string = '', radius: number = 5000): Promise<InsertBusiness[]> {
    try {
      // First, geocode the location to get coordinates
      const coordinates = await this.geocodeLocation(location);
      
      // Search for businesses near those coordinates
      const searchUrl = `${this.baseUrl}/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radius}&type=establishment&keyword=${encodeURIComponent(query)}&key=${this.apiKey}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      const businesses: InsertBusiness[] = [];
      
      // Process each result and get detailed information
      for (const result of data.results.slice(0, 20)) { // Limit to 20 results to avoid API quota issues
        try {
          const details = await this.getPlaceDetails(result.place_id);
          
          // Determine primary business category
          const category = this.categorizePlace(details.types);
          
          const business: InsertBusiness = {
            placeId: details.place_id,
            name: details.name,
            address: details.formatted_address,
            phone: details.formatted_phone_number || null,
            website: details.website || null,
            hasWebsite: !!details.website,
            category,
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            rating: details.rating || null,
            reviewCount: details.user_ratings_total || null,
            contactStatus: 'new'
          };

          businesses.push(business);
        } catch (error) {
          console.error(`Error getting details for place ${result.place_id}:`, error);
          // Continue with other businesses even if one fails
        }
      }

      // Filter to prioritize businesses without websites
      return businesses.sort((a, b) => {
        if (!a.hasWebsite && b.hasWebsite) return -1;
        if (a.hasWebsite && !b.hasWebsite) return 1;
        return 0;
      });

    } catch (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  }

  private async geocodeLocation(location: string): Promise<{ lat: number; lng: number }> {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`Could not geocode location: ${location}`);
    }

    return data.results[0].geometry.location;
  }

  private async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,website,types,geometry,rating,user_ratings_total&key=${this.apiKey}`;
    
    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Could not get place details: ${data.status}`);
    }

    return data.result;
  }

  private categorizePlace(types: string[]): string {
    // Map Google Place types to our categories
    const categoryMap: Record<string, string> = {
      'restaurant': 'Restaurant',
      'food': 'Restaurant',
      'meal_takeaway': 'Restaurant',
      'cafe': 'Restaurant',
      'bakery': 'Restaurant',
      'bar': 'Restaurant',
      'store': 'Retail',
      'clothing_store': 'Retail',
      'shoe_store': 'Retail',
      'electronics_store': 'Retail',
      'furniture_store': 'Retail',
      'jewelry_store': 'Retail',
      'book_store': 'Retail',
      'beauty_salon': 'Beauty & Wellness',
      'hair_care': 'Beauty & Wellness',
      'spa': 'Beauty & Wellness',
      'gym': 'Beauty & Wellness',
      'dentist': 'Healthcare',
      'doctor': 'Healthcare',
      'hospital': 'Healthcare',
      'pharmacy': 'Healthcare',
      'veterinary_care': 'Healthcare',
      'lawyer': 'Professional Services',
      'accounting': 'Professional Services',
      'real_estate_agency': 'Professional Services',
      'insurance_agency': 'Professional Services',
      'car_repair': 'Automotive',
      'car_dealer': 'Automotive',
      'gas_station': 'Automotive',
      'lodging': 'Hospitality',
      'travel_agency': 'Hospitality'
    };

    for (const type of types) {
      if (categoryMap[type]) {
        return categoryMap[type];
      }
    }

    return 'Other';
  }
}

export const googlePlacesService = new GooglePlacesService();