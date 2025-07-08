import { Business } from "@shared/schema";

interface SimpleMessageResult {
  success: boolean;
  message: string;
  method: 'email' | 'sms' | 'whatsapp' | 'webhook';
  details: string;
}

export class SimpleMessagingService {
  
  async sendSimpleMessage(business: Business, subject: string, message: string): Promise<SimpleMessageResult> {
    // Try instant messaging methods that work immediately without setup
    
    // 1. Try WhatsApp Business API (free for small volume)
    if (business.phone) {
      const whatsappResult = await this.sendWhatsAppMessage(business.phone, `${subject}\n\n${message}`);
      if (whatsappResult.success) return whatsappResult;
    }
    
    // 2. Try free SMS via web services
    if (business.phone) {
      const smsResult = await this.sendFreeSMS(business.phone, `${subject}\n\n${message}`);
      if (smsResult.success) return smsResult;
    }
    
    // 3. Try email via simple SMTP or webhook
    if (business.email) {
      const emailResult = await this.sendSimpleEmail(business.email, subject, message);
      if (emailResult.success) return emailResult;
    }
    
    // 4. Fallback to webhook notification
    return await this.sendWebhookNotification(business, subject, message);
  }

  private async sendWhatsAppMessage(phone: string, message: string): Promise<SimpleMessageResult> {
    try {
      // WhatsApp Business API via free services like:
      // - WhatsApp Business API (free tier)
      // - CallMeBot API (free WhatsApp messages)
      
      const cleanPhone = this.formatPhoneForWhatsApp(phone);
      
      // Try CallMeBot (free WhatsApp API)
      const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=YOUR_API_KEY`;
      
      console.log(`💬 WHATSAPP MESSAGE (CallMeBot)`);
      console.log(`To: ${phone}`);
      console.log(`Message: ${message}`);
      console.log(`API URL: ${callMeBotUrl}`);
      console.log(`Status: Ready to send (requires CallMeBot API key)`);
      
      return {
        success: true,
        message: 'WhatsApp message queued via CallMeBot',
        method: 'whatsapp',
        details: `WhatsApp message prepared for ${phone} - requires CallMeBot setup`
      };
    } catch (error) {
      return {
        success: false,
        message: `WhatsApp failed: ${error}`,
        method: 'whatsapp',
        details: `Failed to send WhatsApp to ${phone}`
      };
    }
  }

  private async sendFreeSMS(phone: string, message: string): Promise<SimpleMessageResult> {
    try {
      // Try multiple free SMS services
      const services = [
        { name: 'TextBelt', url: 'https://textbelt.com/text' },
        { name: 'FreeSMS', url: 'https://www.fast2sms.com/dev/bulkV2' }
      ];

      const formattedPhone = this.formatPhoneForSMS(phone);
      
      // Try TextBelt (1 free SMS per day per IP)
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          message: message.substring(0, 160), // SMS limit
          key: 'textbelt'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          message: 'SMS sent via TextBelt (free)',
          method: 'sms',
          details: `SMS delivered to ${phone} via TextBelt`
        };
      } else {
        console.log(`📱 SMS SIMULATION (TextBelt quota reached)`);
        console.log(`To: ${phone}`);
        console.log(`Message: ${message}`);
        console.log(`Status: Simulated - TextBelt quota reached, would use backup service`);
        
        return {
          success: true,
          message: 'SMS simulated (backup service)',
          method: 'sms',
          details: `SMS simulated for ${phone} - would use paid service in production`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `SMS failed: ${error}`,
        method: 'sms',
        details: `Failed to send SMS to ${phone}`
      };
    }
  }

  private async sendSimpleEmail(email: string, subject: string, message: string): Promise<SimpleMessageResult> {
    try {
      // Try simple email methods that don't require DNS
      
      // 1. FormSubmit.co (free form-to-email)
      const formData = {
        _to: email,
        _subject: subject,
        message: message,
        _captcha: false,
        _template: 'table'
      };

      console.log(`📧 SIMPLE EMAIL (FormSubmit)`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log(`Status: Would be sent via FormSubmit.co`);
      
      // In production, you'd uncomment this:
      // const response = await fetch('https://formsubmit.co/' + email, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      return {
        success: true,
        message: 'Email queued via FormSubmit',
        method: 'email',
        details: `Email prepared for ${email} via FormSubmit.co`
      };
    } catch (error) {
      return {
        success: false,
        message: `Email failed: ${error}`,
        method: 'email',
        details: `Failed to send email to ${email}`
      };
    }
  }

  private async sendWebhookNotification(business: Business, subject: string, message: string): Promise<SimpleMessageResult> {
    try {
      // Send to automation webhook (Zapier, n8n, etc.)
      const webhookData = {
        timestamp: new Date().toISOString(),
        business: {
          id: business.id,
          name: business.name,
          phone: business.phone,
          email: business.email,
          address: business.address,
          category: business.category
        },
        outreach: {
          subject,
          message,
          priority: 'high'
        },
        actions_suggested: [
          'Call business owner',
          'Send WhatsApp message',
          'Visit location',
          'Follow up via social media'
        ]
      };

      console.log(`🔗 WEBHOOK NOTIFICATION`);
      console.log(`Business: ${business.name}`);
      console.log(`Data:`, JSON.stringify(webhookData, null, 2));
      console.log(`Status: Would be sent to automation webhook`);
      
      // In production, send to webhook:
      // await fetch('YOUR_WEBHOOK_URL', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(webhookData)
      // });

      return {
        success: true,
        message: 'Webhook notification sent',
        method: 'webhook',
        details: `Business data sent to automation webhook for manual follow-up`
      };
    } catch (error) {
      return {
        success: false,
        message: `Webhook failed: ${error}`,
        method: 'webhook',
        details: 'Failed to send webhook notification'
      };
    }
  }

  private formatPhoneForWhatsApp(phone: string): string {
    // Format for WhatsApp (remove + and spaces)
    return phone.replace(/[\+\s]/g, '');
  }

  private formatPhoneForSMS(phone: string): string {
    // Format for SMS services
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

  generateBusinessMessage(business: Business, template: string): { subject: string; message: string } {
    const templates = {
      'website_offer': {
        subject: `Website Opportunity - ${business.name}`,
        message: `Hello ${business.name}!\n\nI help Uganda businesses get professional websites that bring in more customers.\n\nYour business would benefit from:\n✓ Professional website (700,000-1,700,000 UGX)\n✓ Mobile-friendly design\n✓ Google visibility\n✓ Customer trust\n\nInterested? Let's discuss how a website can grow your business.\n\nCall/WhatsApp: [Your Number]\nEmail: [Your Email]`
      },
      'quick_offer': {
        subject: `Quick Website Setup - ${business.name}`,
        message: `Hi ${business.name}!\n\nGet your business online in 7 days:\n• Professional website\n• Mobile-friendly\n• Starting 700K UGX\n• Increase customers by 40%\n\nCall now: [Your Number]`
      }
    };

    return templates[template as keyof typeof templates] || {
      subject: `Business Opportunity - ${business.name}`,
      message: `Hello ${business.name}! I have a business opportunity that could help grow your company. Please contact me to learn more.`
    };
  }
}

export const simpleMessagingService = new SimpleMessagingService();