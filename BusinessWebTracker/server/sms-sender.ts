import { Business } from "@shared/schema";

interface SMSResult {
  success: boolean;
  message: string;
  provider: string;
}

export class FreeSMSService {
  
  async sendSMS(phone: string, message: string, business: Business): Promise<SMSResult> {
    // Try multiple free SMS methods
    const methods = [
      () => this.sendViaTextBelt(phone, message),
      () => this.sendViaFreeSMSAPI(phone, message),
      () => this.sendViaEmailToSMS(phone, message),
      () => this.simulateSMSForDemo(phone, message, business)
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.log('SMS method failed:', error);
      }
    }

    // Fallback to simulation
    return this.simulateSMSForDemo(phone, message, business);
  }

  private async sendViaTextBelt(phone: string, message: string): Promise<SMSResult> {
    // TextBelt - Free SMS API (1 SMS per day per IP)
    try {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: this.formatPhoneForInternational(phone),
          message: message,
          key: 'textbelt' // Free tier key
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          message: 'SMS sent via TextBelt',
          provider: 'textbelt'
        };
      } else {
        throw new Error(data.error || 'TextBelt failed');
      }
    } catch (error) {
      return {
        success: false,
        message: `TextBelt failed: ${error}`,
        provider: 'textbelt'
      };
    }
  }

  private async sendViaFreeSMSAPI(phone: string, message: string): Promise<SMSResult> {
    // Alternative free SMS services (these often have limitations)
    try {
      // Example: Some services offer free tier with registration
      // This would require API keys but some have free tiers
      
      throw new Error('Free SMS API not available without registration');
    } catch (error) {
      return {
        success: false,
        message: `Free SMS API failed: ${error}`,
        provider: 'free_api'
      };
    }
  }

  private async sendViaEmailToSMS(phone: string, message: string): Promise<SMSResult> {
    // Some carriers allow email-to-SMS
    // Format: phonenumber@carrier-sms-gateway.com
    
    const ugandanCarrierGateways = [
      '@sms.mtn.co.ug',
      '@sms.airtel.co.ug',
      '@sms.utl.co.ug'
    ];

    try {
      // Extract phone number without country code
      const cleanPhone = phone.replace(/^\+256\s?/, '').replace(/\s/g, '');
      
      // Try each carrier gateway
      for (const gateway of ugandanCarrierGateways) {
        const emailAddress = `${cleanPhone}${gateway}`;
        
        // This would use your email service to send to SMS gateway
        // For now, we'll simulate this
        console.log(`Would send SMS via email to: ${emailAddress}`);
      }

      return {
        success: false,
        message: 'Email-to-SMS requires email service setup',
        provider: 'email_to_sms'
      };
    } catch (error) {
      return {
        success: false,
        message: `Email-to-SMS failed: ${error}`,
        provider: 'email_to_sms'
      };
    }
  }

  private async simulateSMSForDemo(phone: string, message: string, business: Business): Promise<SMSResult> {
    // For demo purposes - simulate SMS sending
    console.log(`\n📱 SMS SIMULATION 📱`);
    console.log(`To: ${phone} (${business.name})`);
    console.log(`Message: ${message}`);
    console.log(`Status: Simulated - would be sent in production\n`);

    // Add realistic delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'SMS simulated successfully (demo mode)',
      provider: 'simulation'
    };
  }

  private formatPhoneForInternational(phone: string): string {
    // Convert Ugandan phone numbers to international format
    let cleaned = phone.replace(/\s/g, '');
    
    // If starts with +256, use as is
    if (cleaned.startsWith('+256')) {
      return cleaned;
    }
    
    // If starts with 256, add +
    if (cleaned.startsWith('256')) {
      return `+${cleaned}`;
    }
    
    // If starts with 0, replace with +256
    if (cleaned.startsWith('0')) {
      return `+256${cleaned.substring(1)}`;
    }
    
    // If starts with 7, assume Uganda mobile
    if (/^[789]/.test(cleaned)) {
      return `+256${cleaned}`;
    }
    
    return cleaned;
  }

  generateBusinessSMSMessage(business: Business, template: string): string {
    // Generate personalized SMS message
    const templates = {
      'website_offer': `Hi ${business.name}! I noticed you don't have a website. I create professional websites for Uganda businesses at 700K-1.7M UGX. Can we discuss how a website could help grow your business? Reply STOP to opt out.`,
      
      'digital_presence': `Hello ${business.name}! Your business deserves a strong online presence. I help Uganda businesses get found on Google with professional websites. Starting at 700K UGX. Interested? Reply STOP to opt out.`,
      
      'custom': template
    };

    return templates[template as keyof typeof templates] || template;
  }
}

export const freeSMSService = new FreeSMSService();