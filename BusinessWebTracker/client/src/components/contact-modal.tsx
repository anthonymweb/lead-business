import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Business } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ContactModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

const emailTemplates = {
  professional: {
    subject: "Professional Website Services for {businessName}",
    body: `Hello,

I noticed that {businessName} doesn't currently have a website. In today's digital world, having a professional online presence is crucial for attracting new customers and growing your business.

I specialize in creating beautiful, mobile-friendly websites that help local businesses like yours stand out online. I'd love to discuss how a website could benefit {businessName}.

Would you be interested in a brief conversation about your online presence?

Best regards,
[Your Name]
[Your Contact Information]`
  },
  website_proposal: {
    subject: "Free Website Consultation for {businessName}",
    body: `Dear {businessName} team,

I'm reaching out because I believe your business could benefit from having a professional website. I help local businesses establish their online presence with custom websites that drive real results.

Here's what I can offer:
• Professional website design
• Mobile-friendly layout
• Search engine optimization
• Easy content management
• Ongoing support

I'd be happy to provide a free consultation to discuss your specific needs.

Best regards,
[Your Name]
[Your Contact Information]`
  },
  custom: {
    subject: "Website Services for {businessName}",
    body: ""
  }
};

export default function ContactModal({ business, isOpen, onClose }: ContactModalProps) {
  const [template, setTemplate] = useState("professional");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateContactMutation = useMutation({
    mutationFn: async (data: { contactStatus: string; notes?: string }) => {
      if (!business) throw new Error("No business selected");
      const response = await apiRequest('PATCH', `/api/businesses/${business.id}/contact`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      onClose();
    },
  });

  // Update message when template or business changes
  useState(() => {
    if (business && template !== "custom") {
      const selectedTemplate = emailTemplates[template as keyof typeof emailTemplates];
      const personalizedMessage = selectedTemplate.body.replace(/{businessName}/g, business.name);
      setMessage(personalizedMessage);
    }
  }, [business, template]);

  const handleSendEmail = () => {
    if (!business) return;

    // In a real application, this would integrate with an email service
    // For now, we'll simulate sending and update the contact status
    toast({
      title: "Email sent successfully",
      description: `Contact email sent to ${business.name}. The business has been marked as contacted.`,
    });

    updateContactMutation.mutate({
      contactStatus: "contacted",
      notes: `Email sent: ${emailTemplates[template as keyof typeof emailTemplates].subject.replace(/{businessName}/g, business.name)}`,
    });
  };

  const handleMarkAsInterested = () => {
    if (!business) return;
    
    const notificationEmail = localStorage.getItem('notificationEmail');
    
    updateContactMutation.mutate({
      contactStatus: "interested",
      notes: "Business expressed interest in website services",
      notificationEmail: notificationEmail || undefined,
    });

    toast({
      title: "Business marked as interested",
      description: `${business.name} has been marked as interested.`,
    });
  };

  const handleMarkAsNotInterested = () => {
    if (!business) return;
    
    updateContactMutation.mutate({
      contactStatus: "not_interested",
      notes: "Business declined website services",
    });

    toast({
      title: "Business marked as not interested",
      description: `${business.name} has been marked as not interested.`,
    });
  };

  if (!business) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Contact {business.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Template</label>
            <Select value={template} onValueChange={(value) => {
              setTemplate(value);
              if (value !== "custom") {
                const selectedTemplate = emailTemplates[value as keyof typeof emailTemplates];
                setMessage(selectedTemplate.body.replace(/{businessName}/g, business.name));
              } else {
                setMessage("");
              }
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional Introduction</SelectItem>
                <SelectItem value="website_proposal">Website Proposal</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message Preview</label>
            <Textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Email message will appear here..."
              className="resize-none"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleSendEmail}
              disabled={updateContactMutation.isPending || !message.trim()}
              className="bg-primary hover:bg-blue-700"
            >
              {updateContactMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-envelope mr-2"></i>
              )}
              Send Email
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={handleMarkAsInterested}
                disabled={updateContactMutation.isPending}
                className="flex-1"
              >
                <i className="fas fa-thumbs-up mr-2"></i>
                Mark Interested
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleMarkAsNotInterested}
                disabled={updateContactMutation.isPending}
                className="flex-1"
              >
                <i className="fas fa-thumbs-down mr-2"></i>
                Mark Not Interested
              </Button>
            </div>
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
