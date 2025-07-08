import { Business } from "@shared/schema";

interface EmailSearchResult {
  email: string | null;
  source: string;
  confidence: number;
}

export class EmailFinderService {
  
  async findBusinessEmail(business: Business): Promise<EmailSearchResult> {
    // Try multiple free methods to find business emails
    const methods = [
      () => this.searchFromWebsite(business),
      () => this.searchFromSocialMedia(business),
      () => this.guessCommonPatterns(business),
      () => this.searchOpenDirectory(business)
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result.email) {
          return result;
        }
      } catch (error) {
        console.log('Email search method failed:', error);
      }
    }

    return { email: null, source: 'none', confidence: 0 };
  }

  private async searchFromWebsite(business: Business): Promise<EmailSearchResult> {
    if (!business.website) {
      return { email: null, source: 'no_website', confidence: 0 };
    }

    try {
      // Construct possible website URLs
      const urls = [
        business.website.startsWith('http') ? business.website : `http://${business.website}`,
        business.website.startsWith('http') ? business.website : `https://${business.website}`
      ];

      for (const url of urls) {
        try {
          const response = await fetch(url, { 
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BusinessFinder/1.0)' }
          });
          
          if (response.ok) {
            const html = await response.text();
            const emails = this.extractEmailsFromText(html);
            
            if (emails.length > 0) {
              // Prefer info@, contact@, admin@ emails
              const preferredEmail = emails.find(email => 
                /^(info|contact|admin|hello|support)@/.test(email)
              ) || emails[0];
              
              return { 
                email: preferredEmail, 
                source: 'website', 
                confidence: 0.9 
              };
            }
          }
        } catch (error) {
          continue; // Try next URL
        }
      }
    } catch (error) {
      console.log('Website search failed:', error);
    }

    return { email: null, source: 'website_failed', confidence: 0 };
  }

  private async searchFromSocialMedia(business: Business): Promise<EmailSearchResult> {
    // Search for business on social platforms (using public APIs)
    const searchTerms = [
      `"${business.name}" ${business.address.split(',')[0]}`,
      `"${business.name}" Uganda`,
      business.name
    ];

    // This would require implementing searches across:
    // - LinkedIn public profiles
    // - Facebook business pages  
    // - Twitter/X profiles
    // For now, return null as these require careful rate limiting
    
    return { email: null, source: 'social_media', confidence: 0 };
  }

  private async guessCommonPatterns(business: Business): Promise<EmailSearchResult> {
    // Generate common email patterns for the business
    const businessName = business.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '');
    
    const domains = [
      `${businessName}.com`,
      `${businessName}.co.ug`,
      `${businessName}.ug`,
      `${businessName}uganda.com`,
      'gmail.com',
      'yahoo.com',
      'outlook.com'
    ];

    const prefixes = ['info', 'contact', 'admin', 'hello', 'owner', businessName];
    
    const candidateEmails = [];
    for (const domain of domains) {
      for (const prefix of prefixes) {
        candidateEmails.push(`${prefix}@${domain}`);
      }
    }

    // In a real implementation, you'd verify these emails exist
    // For now, we'll return the most likely pattern
    const mostLikely = `info@${businessName}.com`;
    
    return { 
      email: mostLikely, 
      source: 'pattern_guess', 
      confidence: 0.3 
    };
  }

  private async searchOpenDirectory(business: Business): Promise<EmailSearchResult> {
    // Search open business directories for contact information
    try {
      // Example: Search Uganda business directories
      const searchQuery = encodeURIComponent(`"${business.name}" Uganda contact email`);
      
      // This would search public directories like:
      // - Uganda Yellow Pages
      // - Uganda Business Directory
      // - OpenStreetMap business data
      
      // For now, return null as this requires careful scraping
      return { email: null, source: 'directory', confidence: 0 };
      
    } catch (error) {
      return { email: null, source: 'directory_failed', confidence: 0 };
    }
  }

  private extractEmailsFromText(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = text.match(emailRegex) || [];
    
    // Filter out common false positives
    return matches.filter(email => 
      !email.includes('example.com') &&
      !email.includes('test.com') &&
      !email.includes('placeholder') &&
      !email.includes('@sentry.') &&
      !email.includes('@google.') &&
      !email.includes('@facebook.')
    );
  }

  async verifyEmailExists(email: string): Promise<boolean> {
    // In a production system, you could use:
    // - DNS MX record checking
    // - SMTP connection testing
    // - Email validation APIs
    
    // For now, basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const emailFinderService = new EmailFinderService();