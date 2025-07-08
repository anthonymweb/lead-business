// Vercel serverless function entry point for API routes
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

// Import storage and create simple API handler
const app = express();
app.use(express.json());

// Simple in-memory storage for Vercel
class VercelStorage {
  private businesses = new Map();
  private searchHistory = new Map();
  private currentBusinessId = 1;
  private currentSearchId = 1;

  async getBusiness(id) {
    return this.businesses.get(id);
  }

  async getBusinesses(filters = {}) {
    const allBusinesses = Array.from(this.businesses.values());
    if (filters.contactStatus) {
      return allBusinesses.filter(b => b.contactStatus === filters.contactStatus);
    }
    return allBusinesses;
  }

  async createBusiness(business) {
    const newBusiness = { ...business, id: this.currentBusinessId++ };
    this.businesses.set(newBusiness.id, newBusiness);
    return newBusiness;
  }

  async updateBusiness(id, updates) {
    const business = this.businesses.get(id);
    if (business) {
      Object.assign(business, updates);
      return business;
    }
    return undefined;
  }

  async getBusinessesWithoutWebsite() {
    return Array.from(this.businesses.values()).filter(b => !b.website);
  }

  async createSearchHistory(search) {
    const newSearch = { ...search, id: this.currentSearchId++ };
    this.searchHistory.set(newSearch.id, newSearch);
    return newSearch;
  }

  async getSearchHistory() {
    return Array.from(this.searchHistory.values());
  }

  async getStats() {
    const businesses = Array.from(this.businesses.values());
    return {
      totalSearched: businesses.length,
      noWebsite: businesses.filter(b => !b.website).length,
      contacted: businesses.filter(b => b.contactStatus === 'contacted').length,
      interested: businesses.filter(b => b.contactStatus === 'interested').length
    };
  }
}

const storage = new VercelStorage();

// API Routes
app.get('/api/businesses', async (req, res) => {
  try {
    const { contactStatus, category } = req.query;
    const businesses = await storage.getBusinesses({ contactStatus, category });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

app.post('/api/search', async (req, res) => {
  try {
    const { location, category } = req.body;
    
    // Generate sample businesses for the location
    const sampleBusinesses = [
      {
        name: `${category || 'Local'} Business in ${location}`,
        address: `${location}, Uganda`,
        phone: '+256 700 123 456',
        category: category || 'General',
        hasWebsite: false,
        contactStatus: 'new',
        source: 'local_search'
      }
    ];

    const businesses = [];
    for (const business of sampleBusinesses) {
      const created = await storage.createBusiness(business);
      businesses.push(created);
    }

    await storage.createSearchHistory({
      location,
      category: category || '',
      resultsCount: businesses.length
    });

    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.put('/api/businesses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const business = await storage.updateBusiness(id, updates);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update business' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await storage.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Export handler for Vercel
export default app;
