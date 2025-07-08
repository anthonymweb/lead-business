import { MailService } from '@sendgrid/mail';

let mailService: MailService | null = null;

function initializeMailService() {
  if (!mailService) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY environment variable must be set");
    }
    
    mailService = new MailService();
    mailService.setApiKey(apiKey);
  }
  return mailService;
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const service = initializeMailService();
    
    await service.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendBulkEmail(
  recipients: string[],
  from: string,
  subject: string,
  message: string
): Promise<{ successCount: number; failureCount: number }> {
  let successCount = 0;
  let failureCount = 0;
  
  for (const recipient of recipients) {
    try {
      const success = await sendEmail({
        to: recipient,
        from,
        subject,
        text: message,
        html: message.replace(/\n/g, '<br>')
      });
      
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to send email to ${recipient}:`, error);
      failureCount++;
    }
  }
  
  return { successCount, failureCount };
}

export async function sendInterestNotification(
  businessName: string,
  businessContact: string,
  notificationEmail: string
): Promise<boolean> {
  const subject = `Business Interest Alert: ${businessName}`;
  const message = `
Good news! A business has expressed interest in your website services.

Business Details:
- Name: ${businessName}
- Contact: ${businessContact}

You can now reach out to them directly to discuss their website needs.

This is an automated notification from your Lead Generator application.
  `;
  
  return sendEmail({
    to: notificationEmail,
    from: notificationEmail, // Using same email as from for simplicity
    subject,
    text: message,
    html: message.replace(/\n/g, '<br>')
  });
}