import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  placeId: text("place_id").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  category: text("category").notNull(),
  rating: real("rating"),
  hasWebsite: boolean("has_website").notNull().default(false),
  website: text("website"),
  lat: real("lat"),
  lng: real("lng"),
  contactStatus: text("contact_status").notNull().default("new"), // new, contacted, interested, not_interested
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  radius: integer("radius").notNull(),
  category: text("category"),
  resultsCount: integer("results_count").notNull(),
  noWebsiteCount: integer("no_website_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

export const updateBusinessSchema = createInsertSchema(businesses).pick({
  contactStatus: true,
  notes: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type UpdateBusiness = z.infer<typeof updateBusinessSchema>;
