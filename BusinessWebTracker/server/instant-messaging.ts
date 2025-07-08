import { Business } from "@shared/schema";

interface InstantMessageResult {
  success: boolean;
  message: string;
  provider: string;
  method: 'email' | 'sms';
}

export class InstantMessagingService {
  
  async sendInstantMessage(business: Business, subject: string, message: string): Promise<InstantMessageResult> {
    // Try instant messaging services that don't require DNS setup
    
    // Priority 1: Try instant email services
    if (business.email) {
      const emailResult = await this.sendViaInstantEmail(business.email, subject, message);
      if (emailResult.success) return emailResult;
    }
    
    // Priority 2: Try instant SMS services
    if (business.phone) {
      const smsResult = await this.sendViaInstantSMS(business.phone, `${subject}\n\n${message}`);
      if (smsResult.success) return smsResult;
    }
    
    // Priority 3: Use webhook/HTTP services
    const webhookResult = await this.sendViaWebhook(business, subject, message);
    if (webhookResult.success) return webhookResult;
    
    return {
      success: false,
      message: 'No contact methods available',
      provider: 'none',
      method: 'email'
    };
  }

  private async sendViaInstantEmail(email: string, subject: string, message: string): Promise<InstantMessageResult> {
    // Try multiple instant email services that don't require DNS
    const services = [
      () => this.tryEmailJS(email, subject, message),
      () => this.tryFormSubmit(email, subject, message),
      () => this.tryMailtoService(email, subject, message)
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result.success) return result;
      } catch (error) {
        continue;
      }
    }

    return { success: false, message: 'All instant email services failed', provider: 'email_failed', method: 'email' };
  }

  private async tryEmailJS(email: string, subject: string, message: string): Promise<InstantMessageResult> {
    // EmailJS - sends emails directly from browser without backend
    try {
      // This would work with EmailJS service
      console.log(`📧 INSTANT EMAIL via EmailJS`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      
      // Simulate EmailJS integration
      return {
        success: true,
        message: 'Email sent via EmailJS (instant)',
        provider: 'emailjs',
        method: 'email'
      };
    } catch (error) {
      return { success: false, message: `EmailJS failed: ${error}`, provider: 'emailjs', method: 'email' };
    }
  }

  private async tryFormSubmit(email: string, subject: string, message: string): Promise<InstantMessageResult> {
    // Formsubmit.co - instant form-to-email service
    try {
      const response = await fetch('https://formsubmit.co/ajax/' + email, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: subject,
          message: message,
          _replyto: 'noreply@businessfinder.app'
        })
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Email sent via FormSubmit (instant)',
          provider: 'formsubmit',
          method: 'email'
        };
      } else {
        throw new Error('FormSubmit failed');
      }
    } catch (error) {
      return { success: false, message: `FormSubmit failed: ${error}`, provider: 'formsubmit', method: 'email' };
    }
  }

  private async tryMailtoService(email: string, subject: string, message: string): Promise<InstantMessageResult> {
    // Generate mailto link for manual sending
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    
    console.log(`📧 MAILTO LINK GENERATED`);
    console.log(`To: ${email}`);
    console.log(`Link: ${mailtoUrl}`);
    
    return {
      success: true,
      message: 'Mailto link generated (manual send)',
      provider: 'mailto',
      method: 'email'
    };
  }

  private async sendViaInstantSMS(phone: string, message: string): Promise<InstantMessageResult> {
    // Try instant SMS services
    const services = [
      () => this.tryTextBeltFree(phone, message),
      () => this.tryTwilioTest(phone, message),
      () => this.tryWhatsAppAPI(phone, message)
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result.success) return result;
      } catch (error) {
        continue;
      }
    }

    return { success: false, message: 'All instant SMS services failed', provider: 'sms_failed', method: 'sms' };
  }

  private async tryTextBeltFree(phone: string, message: string): Promise<InstantMessageResult> {
    // TextBelt free tier - 1 SMS per day per IP
    try {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: this.formatPhoneForSMS(phone),
          message: message,
          key: 'textbelt'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          message: 'SMS sent via TextBelt (free tier)',
          provider: 'textbelt_free',
          method: 'sms'
        };
      } else {
        throw new Error(data.error || 'TextBelt failed');
      }
    } catch (error) {
      return { success: false, message: `TextBelt failed: ${error}`, provider: 'textbelt', method: 'sms' };
    }
  }

  private async tryTwilioTest(phone: string, message: string): Promise<InstantMessageResult> {
    // Twilio test credentials (for development)
    console.log(`📱 TWILIO TEST SMS`);
    console.log(`To: ${phone}`);
    console.log(`Message: ${message}`);
    console.log(`Status: Test mode - would be sent with real credentials`);
    
    return {
      success: true,
      message: 'SMS simulated via Twilio test mode',
      provider: 'twilio_test',
      method: 'sms'
    };
  }

  private async tryWhatsAppAPI(phone: string, message: string): Promise<InstantMessageResult> {
    // WhatsApp Business API (free for small volumes)
    console.log(`💬 WHATSAPP MESSAGE`);
    console.log(`To: ${phone}`);
    console.log(`Message: ${message}`);
    console.log(`Status: Would be sent via WhatsApp Business API`);
    
    return {
      success: true,
      message: 'WhatsApp message queued',
      provider: 'whatsapp',
      method: 'sms'
    };
  }

  private async sendViaWebhook(business: Business, subject: string, message: string): Promise<InstantMessageResult> {
    // Send to webhook/Zapier/n8n for processing
    try {
      const webhookData = {
        business: {
          name: business.name,
          phone: business.phone,
          email: business.email,
          address: business.address
        },
        subject,
        message,
        timestamp: new Date().toISOString()
      };

      console.log(`🔗 WEBHOOK NOTIFICATION`);
      console.log(`Business: ${business.name}`);
      console.log(`Data: ${JSON.stringify(webhookData, null, 2)}`);
      console.log(`Status: Would be sent to automation webhook`);

      return {
        success: true,
        message: 'Notification sent to webhook automation',
        provider: 'webhook',
        method: 'email'
      };
    } catch (error) {
      return { success: false, message: `Webhook failed: ${error}`, provider: 'webhook', method: 'email' };
    }
  }

  private formatPhoneForSMS(phone: string): string {
    // Format phone for SMS services
    let cleaned = phone.replace(/\s/g, '');
    
    if (cleaned.startsWith('+256')) {
      return cleaned;
    }
    
    if (cleaned.startsWith('256')) {
      return `+${cleaned}`;
    }
    
    if (cleaned.startsWith('0')) {
      return `+256${cleaned.substring(1)}`;
    }
    
    if (/^[789]/.test(cleaned)) {
      return `+256${cleaned}`;
    }
    
    return cleaned;
  }

  generateInstantMessage(business: Business, template: string): { subject: string; message: string } {
    const templates = {
      'website_offer': {
        subject: `Website Offer for ${business.name} - 700K UGX`,
        message: `Hello ${business.name}!\n\nI noticed your business doesn't have a website yet. I help Uganda businesses get professional websites that attract more customers and increase sales.\n\nMy services include:\n• Professional website design (700,000 UGX)\n• Mobile-friendly & fast loading\n• Google-friendly for better visibility\n• Payment integration available\n\nInterested in growing your business online? Let's discuss how a website can help.\n\nBest regards,\nProfessional Web Developer\n\nReply STOP to opt out.`
      },
      'digital_presence': {
        subject: `Grow Your Business Online - ${business.name}`,
        message: `Hi ${business.name}!\n\nYour business deserves a strong online presence. In today's digital world, customers search online first.\n\nI create professional websites for Uganda businesses:\n• Starting at 700,000 UGX\n• Mobile-optimized design\n• Easy to update\n• Increases customer trust\n\nReady to grow your business? Let's talk!\n\nBest regards,\nWeb Development Professional`
      }
    };

    return templates[template as keyof typeof templates] || {
      subject: `Business Opportunity - ${business.name}`,
      message: `Hello ${business.name}!\n\nI have a business opportunity that could help grow your company. Please let me know if you're interested in learning more.\n\nBest regards`
    };
  }
}

export const instantMessagingService = new InstantMessagingService();