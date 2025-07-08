export const EMAIL_TEMPLATES = {
  WEBSITE_OFFER: {
    subject: "Boost [Business Name]'s Online Presence - Free Consultation",
    body: `Hello [Business Name] Team,

I was searching for local businesses in your area and noticed that [Business Name] doesn't currently have a website. In today's digital world, this could mean missing out on potential customers who are searching online for services like yours.

Here's what you might be missing without a professional website:
• 78% of customers research businesses online before visiting
• Google My Business listings with websites get 35% more clicks
• Online presence builds trust and credibility with new customers
• 24/7 marketing that works while you sleep

I specialize in creating professional, mobile-friendly websites for local businesses like yours. I'd love to offer you a FREE consultation to discuss:

✓ A custom website that showcases your services
✓ Google My Business optimization
✓ Search engine visibility improvements
✓ Mobile-responsive design for all devices

This consultation is completely free with no obligation. I believe every local business deserves a strong online presence, and I'd be happy to show you exactly how a website could benefit [Business Name].

Would you be interested in a brief 15-minute call this week to discuss your online goals?

Best regards,
[Your Name]
[Your Phone Number]
[Your Email]

P.S. I'm offering special launch pricing for new clients this month. Let's chat about how we can get [Business Name] found online!`
  },

  FOLLOW_UP: {
    subject: "Quick Follow-up: Website Consultation for [Business Name]",
    body: `Hi [Business Name],

I reached out last week about creating a professional website for your business. I understand you're busy running [Business Name], so I wanted to follow up briefly.

Many of my clients initially hesitated about getting a website, but after seeing the results, they wish they had started sooner. Just last month, one client saw a 40% increase in new customers within 60 days of launching their website.

I'm still offering that FREE consultation where we can discuss:
• How a website could specifically benefit your business
• Simple solutions that fit your budget
• No-pressure, honest advice about your online presence

The consultation takes just 15 minutes and could potentially transform how customers find and choose your business.

Would Tuesday or Wednesday work better for a quick call?

Best regards,
[Your Name]`
  },

  SOCIAL_MEDIA_OFFER: {
    subject: "[Business Name] - Missing Customers on Social Media?",
    body: `Hello [Business Name],

I noticed [Business Name] doesn't have much of a social media presence. With over 70% of your potential customers active on Facebook and Instagram daily, this could be a huge missed opportunity.

Here's what proper social media management could do for [Business Name]:
• Showcase your work and build trust with potential customers
• Get found by locals searching for your services
• Generate word-of-mouth referrals and reviews
• Stay connected with your existing customer base

I help local businesses like yours establish a professional social media presence that actually brings in customers - not just likes.

Package includes:
✓ Professional business profiles setup
✓ Content creation and posting schedule
✓ Local customer engagement strategy
✓ Review management and reputation building

Would you be interested in learning how [Business Name] could attract more customers through social media? I'm offering a free strategy session this week.

Best regards,
[Your Name]`
  },

  GOOGLE_MY_BUSINESS: {
    subject: "Is [Business Name] Missing from Google Searches?",
    body: `Hi [Business Name] Team,

I was doing some local business research and noticed [Business Name] might not be fully optimized on Google. This means potential customers searching for your services might not be finding you.

Here's the reality:
• 46% of all Google searches are looking for local businesses
• 88% of consumers who search for local businesses call or visit within 24 hours
• Businesses with complete Google profiles get 7x more clicks

I can help [Business Name] get found by more local customers through:
✓ Complete Google My Business optimization
✓ Professional photos and business information
✓ Review management and response strategy
✓ Local search ranking improvements

This service typically pays for itself within the first few new customers it brings in.

Would you like to see exactly how [Business Name] appears in local searches compared to your competitors? I can provide a free analysis this week.

Best regards,
[Your Name]`
  }
};

export function getPersonalizedTemplate(
  templateKey: keyof typeof EMAIL_TEMPLATES, 
  businessName: string,
  senderName: string,
  senderPhone?: string,
  senderEmail?: string
) {
  const template = EMAIL_TEMPLATES[templateKey];
  
  let personalizedBody = template.body
    .replace(/\[Business Name\]/g, businessName)
    .replace(/\[Your Name\]/g, senderName);
  
  if (senderPhone) {
    personalizedBody = personalizedBody.replace(/\[Your Phone Number\]/g, senderPhone);
  }
  
  if (senderEmail) {
    personalizedBody = personalizedBody.replace(/\[Your Email\]/g, senderEmail);
  }
  
  return {
    subject: template.subject.replace(/\[Business Name\]/g, businessName),
    body: personalizedBody
  };
}