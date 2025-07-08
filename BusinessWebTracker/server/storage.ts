import { businesses, searchHistory, type Business, type InsertBusiness, type SearchHistory, type InsertSearchHistory, type UpdateBusiness } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Business operations
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByPlaceId(placeId: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, updates: UpdateBusiness): Promise<Business | undefined>;
  getBusinesses(filters?: { contactStatus?: string; category?: string }): Promise<Business[]>;
  getBusinessesWithoutWebsite(): Promise<Business[]>;
  
  // Search history operations
  createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistory(): Promise<SearchHistory[]>;
  
  // Stats
  getStats(): Promise<{
    totalSearched: number;
    noWebsite: number;
    contacted: number;
    interested: number;
  }>;
}

export class MemStorage implements IStorage {
  private businesses: Map<number, Business>;
  private searchHistoryMap: Map<number, SearchHistory>;
  private currentBusinessId: number;
  private currentSearchId: number;

  constructor() {
    this.businesses = new Map();
    this.searchHistoryMap = new Map();
    this.currentBusinessId = 1;
    this.currentSearchId = 1;
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinessByPlaceId(placeId: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(
      (business) => business.placeId === placeId,
    );
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.currentBusinessId++;
    const business: Business = { 
      ...insertBusiness, 
      id,
      contactStatus: insertBusiness.contactStatus || 'new',
      phone: insertBusiness.phone || null,
      rating: insertBusiness.rating || null,
      hasWebsite: insertBusiness.hasWebsite || false,
      website: insertBusiness.website || null,
      lat: insertBusiness.lat || null,
      lng: insertBusiness.lng || null,
      notes: insertBusiness.notes || null,
      createdAt: new Date(),
    };
    this.businesses.set(id, business);
    return business;
  }

  async updateBusiness(id: number, updates: UpdateBusiness): Promise<Business | undefined> {
    const business = this.businesses.get(id);
    if (!business) return undefined;
    
    const updatedBusiness = { ...business, ...updates };
    this.businesses.set(id, updatedBusiness);
    return updatedBusiness;
  }

  async getBusinesses(filters?: { contactStatus?: string; category?: string }): Promise<Business[]> {
    let results = Array.from(this.businesses.values());
    
    if (filters?.contactStatus) {
      results = results.filter(b => b.contactStatus === filters.contactStatus);
    }
    
    if (filters?.category) {
      results = results.filter(b => b.category === filters.category);
    }
    
    return results.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getBusinessesWithoutWebsite(): Promise<Business[]> {
    return Array.from(this.businesses.values())
      .filter(b => !b.hasWebsite)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.currentSearchId++;
    const search: SearchHistory = { 
      ...insertSearch, 
      id,
      category: insertSearch.category || null,
      createdAt: new Date(),
    };
    this.searchHistoryMap.set(id, search);
    return search;
  }

  async getSearchHistory(): Promise<SearchHistory[]> {
    return Array.from(this.searchHistoryMap.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getStats(): Promise<{
    totalSearched: number;
    noWebsite: number;
    contacted: number;
    interested: number;
  }> {
    const allBusinesses = Array.from(this.businesses.values());
    
    return {
      totalSearched: allBusinesses.length,
      noWebsite: allBusinesses.filter(b => !b.hasWebsite).length,
      contacted: allBusinesses.filter(b => b.contactStatus === 'contacted').length,
      interested: allBusinesses.filter(b => b.contactStatus === 'interested').length,
    };
  }
}

export class DatabaseStorage implements IStorage {
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || undefined;
  }

  async getBusinessByPlaceId(placeId: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.placeId, placeId));
    return business || undefined;
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const [business] = await db
      .insert(businesses)
      .values(insertBusiness)
      .returning();
    return business;
  }

  async updateBusiness(id: number, updates: UpdateBusiness): Promise<Business | undefined> {
    const [business] = await db
      .update(businesses)
      .set(updates)
      .where(eq(businesses.id, id))
      .returning();
    return business || undefined;
  }

  async getBusinesses(filters?: { contactStatus?: string; category?: string }): Promise<Business[]> {
    let query = db.select().from(businesses);
    
    if (filters?.contactStatus) {
      query = query.where(eq(businesses.contactStatus, filters.contactStatus));
    }
    
    if (filters?.category) {
      query = query.where(eq(businesses.category, filters.category));
    }
    
    return await query;
  }

  async getBusinessesWithoutWebsite(): Promise<Business[]> {
    return await db.select().from(businesses).where(eq(businesses.hasWebsite, false));
  }

  async createSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const [search] = await db
      .insert(searchHistory)
      .values(insertSearch)
      .returning();
    return search;
  }

  async getSearchHistory(): Promise<SearchHistory[]> {
    return await db.select().from(searchHistory).orderBy(searchHistory.searchedAt);
  }

  async getStats(): Promise<{
    totalSearched: number;
    noWebsite: number;
    contacted: number;
    interested: number;
  }> {
    const allBusinesses = await db.select().from(businesses);
    
    return {
      totalSearched: allBusinesses.length,
      noWebsite: allBusinesses.filter(b => !b.hasWebsite).length,
      contacted: allBusinesses.filter(b => b.contactStatus === 'contacted').length,
      interested: allBusinesses.filter(b => b.contactStatus === 'interested').length,
    };
  }
}

export const storage = new MemStorage();
