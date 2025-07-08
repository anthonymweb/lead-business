import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessSchema, insertSearchHistorySchema, updateBusinessSchema } from "@shared/schema";
import { z } from "zod";
import { sendBulkEmail, sendInterestNotification } from "./email";
import { googlePlacesService } from "./google-places";
import { freeBusinessSearchService } from "./free-business-search";
import { emailFinderService } from "./email-finder";
import { freeSMSService } from "./sms-sender";
import { instantMessagingService } from "./instant-messaging";
import { simpleMessagingService } from "./simple-messaging";

const searchSchema = z.object({
  location: z.string().min(1),
  radius: z.number().min(1).max(50),
  category: z.string().optional(),
});

const updateBusinessContactSchema = z.object({
  businessId: z.number(),
  contactStatus: z.enum(['new', 'contacted', 'interested', 'not_interested']),
  notes: z.string().optional(),
});

const bulkEmailSchema = z.object({
  businessIds: z.array(z.number()),
  template: z.string(),
  subject: z.string().min(1),
  message: z.string().min(1),
  senderEmail: z.string().email(),
  senderName: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Search businesses using multiple free sources
  app.post("/api/search", async (req, res) => {
    try {
      const { location, radius, category } = searchSchema.parse(req.body);
      
      const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;
      
      let businessesData: any[] = [];
      
      // Try Google Places API first if available
      if (apiKey) {
        try {
          businessesData = await googlePlacesService.searchBusinesses(location, category || '', radius * 1000);
        } catch (googleError: any) {
          console.log('Google Places API failed, using free alternatives:', googleError.message);
          businessesData = await freeBusinessSearchService.searchBusinesses(location, category || '', radius);
        }
      } else {
        // Use free business search service
        businessesData = await freeBusinessSearchService.searchBusinesses(location, category || '', radius);
      }

      // Save businesses to storage
      const savedBusinesses = [];
      for (const businessData of businessesData) {
        const existing = await storage.getBusinessByPlaceId(businessData.placeId);
        if (!existing) {
          const saved = await storage.createBusiness(businessData);
          savedBusinesses.push(saved);
        } else {
          savedBusinesses.push(existing);
        }
      }

      // Save search history
      const noWebsiteCount = savedBusinesses.filter(b => !b.hasWebsite).length;
      await storage.createSearchHistory({
        location,
        radius,
        category: category || 'All',
        resultsCount: savedBusinesses.length,
        businessesFound: savedBusinesses.length
      });

      res.json({
        businesses: savedBusinesses.filter(b => !b.hasWebsite), // Only return businesses without websites
        totalFound: savedBusinesses.length,
        noWebsiteCount,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all businesses with filters
  app.get("/api/businesses", async (req, res) => {
    try {
      const { contactStatus, category, noWebsiteOnly } = req.query;
      
      let businesses;
      if (noWebsiteOnly === 'true') {
        businesses = await storage.getBusinessesWithoutWebsite();
      } else {
        businesses = await storage.getBusinesses({
          contactStatus: contactStatus as string,
          category: category as string,
        });
      }
      
      res.json(businesses);
    } catch (error) {
      console.error("Get businesses error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update business contact status
  app.patch("/api/businesses/:id/contact", async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const { contactStatus, notes } = updateBusinessContactSchema.parse({
        businessId,
        ...req.body,
      });

      const updatedBusiness = await storage.updateBusiness(businessId, {
        contactStatus,
        notes: notes || null,
      });

      if (!updatedBusiness) {
        return res.status(404).json({ error: "Business not found" });
      }

      // If business is marked as interested, send notification email (if configured)
      if (contactStatus === 'interested') {
        const sendgridApiKey = process.env.SENDGRID_API_KEY;
        const notificationEmail = req.body.notificationEmail; // This would come from user settings
        
        if (sendgridApiKey && notificationEmail) {
          try {
            await sendInterestNotification(
              updatedBusiness.name,
              updatedBusiness.phone || updatedBusiness.address,
              notificationEmail
            );
          } catch (emailError) {
            console.error("Failed to send interest notification:", emailError);
            // Don't fail the request if email fails
          }
        }
      }

      res.json(updatedBusiness);
    } catch (error) {
      console.error("Update business error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get search history
  app.get("/api/search-history", async (req, res) => {
    try {
      const history = await storage.getSearchHistory();
      res.json(history);
    } catch (error) {
      console.error("Get search history error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Send multi-channel outreach (email + SMS)
  app.post("/api/send-bulk-email", async (req, res) => {
    try {
      const { businessIds, template, subject, message, senderEmail, senderName } = bulkEmailSchema.parse(req.body);
      
      // Get businesses to contact
      const allBusinesses = await storage.getBusinesses();
      const targetBusinesses = allBusinesses.filter(b => businessIds.includes(b.id));
      
      if (targetBusinesses.length === 0) {
        return res.status(400).json({ error: "No valid businesses found for the provided IDs" });
      }

      let emailSuccessCount = 0;
      let smsSuccessCount = 0;
      let failureCount = 0;
      const results = [];

      for (const business of targetBusinesses) {
        try {
          let contactMethod = 'none';
          let contactDetails = '';

          // Use simple messaging service for immediate delivery without complex setup
          const messageData = simpleMessagingService.generateBusinessMessage(business, template);
          const result = await simpleMessagingService.sendSimpleMessage(business, messageData.subject, messageData.message);
          
          if (result.success) {
            if (result.method === 'email') {
              emailSuccessCount++;
            } else {
              smsSuccessCount++;
            }
            contactMethod = result.method;
            contactDetails = result.details;
          } else {
            contactMethod = 'failed';
            contactDetails = result.message;
            failureCount++;
          }

          // Update business contact status
          await storage.updateBusiness(business.id, {
            contactStatus: 'contacted',
            notes: `${contactDetails} (Template: ${template})`
          });

          results.push({
            business: business.name,
            method: contactMethod,
            details: contactDetails
          });
          
          // Add delay between contacts to be respectful
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Failed to contact business ${business.id}:`, error);
          failureCount++;
          results.push({
            business: business.name,
            method: 'failed',
            details: `Error: ${error}`
          });
        }
      }

      res.json({ 
        emailSuccessCount,
        smsSuccessCount,
        failureCount,
        totalProcessed: targetBusinesses.length,
        results,
        message: `Contacted ${emailSuccessCount + smsSuccessCount} businesses successfully (${emailSuccessCount} emails, ${smsSuccessCount} SMS). ${failureCount} failed.`
      });
    } catch (error) {
      console.error("Bulk outreach error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Export to CSV
  app.get("/api/export", async (req, res) => {
    try {
      const businesses = await storage.getBusinessesWithoutWebsite();
      
      // Create CSV content
      const headers = ['Name', 'Category', 'Address', 'Phone', 'Rating', 'Contact Status', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...businesses.map(b => [
          `"${b.name}"`,
          `"${b.category}"`,
          `"${b.address}"`,
          `"${b.phone || ''}"`,
          b.rating || '',
          `"${b.contactStatus}"`,
          `"${b.notes || ''}"`
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=business-leads.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
