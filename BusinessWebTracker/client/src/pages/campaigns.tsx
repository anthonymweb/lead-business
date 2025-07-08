import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import { Business } from "@shared/schema";

export default function Campaigns() {
  const [selectedBusinesses, setSelectedBusinesses] = useState<number[]>([]);
  const [emailTemplate, setEmailTemplate] = useState("professional");
  const [customSubject, setCustomSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['/api/businesses', { noWebsiteOnly: true }],
    queryFn: () => fetch('/api/businesses?noWebsiteOnly=true').then(res => res.json()),
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: {
      businessIds: number[];
      template: string;
      subject: string;
      message: string;
      senderEmail: string;
      senderName: string;
    }) => {
      const response = await apiRequest('POST', '/api/send-bulk-email', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Emails sent successfully",
        description: `${data.successCount} emails sent successfully. ${data.failureCount} failed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setSelectedBusinesses([]);
    },
    onError: (error: any) => {
      toast({
        title: "Email sending failed",
        description: error.message || "An error occurred while sending emails.",
        variant: "destructive",
      });
    },
  });

  const emailTemplates = {
    professional: {
      subject: "Professional Website Services for Your Business",
      message: `Hello,

I noticed that your business doesn't currently have a website. In today's digital world, having a professional online presence is crucial for attracting new customers and growing your business.

I specialize in creating beautiful, mobile-friendly websites that help local businesses like yours stand out online. I'd love to discuss how a website could benefit your business.

Would you be interested in a brief conversation about your online presence?

Best regards,
{senderName}
{senderEmail}`
    },
    website_proposal: {
      subject: "Free Website Consultation for Your Business",
      message: `Dear Business Owner,

I'm reaching out because I believe your business could benefit from having a professional website. I help local businesses establish their online presence with custom websites that drive real results.

Here's what I can offer:
• Professional website design
• Mobile-friendly layout
• Search engine optimization
• Easy content management
• Ongoing support

I'd be happy to provide a free consultation to discuss your specific needs.

Best regards,
{senderName}
{senderEmail}`
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(businesses.map((b: Business) => b.id));
    } else {
      setSelectedBusinesses([]);
    }
  };

  const handleSelectBusiness = (businessId: number, checked: boolean) => {
    if (checked) {
      setSelectedBusinesses([...selectedBusinesses, businessId]);
    } else {
      setSelectedBusinesses(selectedBusinesses.filter(id => id !== businessId));
    }
  };

  const handleSendEmails = () => {
    if (!senderEmail || !senderName) {
      toast({
        title: "Missing sender information",
        description: "Please provide your email and name before sending emails.",
        variant: "destructive",
      });
      return;
    }

    if (selectedBusinesses.length === 0) {
      toast({
        title: "No businesses selected",
        description: "Please select at least one business to send emails to.",
        variant: "destructive",
      });
      return;
    }

    const template = emailTemplates[emailTemplate as keyof typeof emailTemplates];
    const subject = emailTemplate === "custom" ? customSubject : template.subject;
    const message = emailTemplate === "custom" ? customMessage : template.message;

    sendEmailMutation.mutate({
      businessIds: selectedBusinesses,
      template: emailTemplate,
      subject,
      message,
      senderEmail,
      senderName,
    });
  };

  return (
    <Layout title="Email Campaigns" subtitle="Send automated emails to businesses without websites">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Template</label>
                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
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

              {emailTemplate === "custom" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject Line</label>
                    <Input
                      type="text"
                      placeholder="Email subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <Textarea
                      rows={6}
                      placeholder="Your custom message..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                    />
                  </div>
                </>
              )}

              {emailTemplate !== "custom" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message Preview</label>
                  <Textarea
                    rows={8}
                    value={emailTemplates[emailTemplate as keyof typeof emailTemplates].message.replace('{senderName}', senderName).replace('{senderEmail}', senderEmail)}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
              )}

              <Button
                onClick={handleSendEmails}
                disabled={sendEmailMutation.isPending || selectedBusinesses.length === 0}
                className="w-full bg-primary hover:bg-blue-700"
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send to {selectedBusinesses.length} Business{selectedBusinesses.length !== 1 ? 'es' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats?.noWebsite || 0}</div>
                  <div className="text-sm text-slate-600">Total Prospects</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats?.contacted || 0}</div>
                  <div className="text-sm text-slate-600">Contacted</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats?.interested || 0}</div>
                  <div className="text-sm text-slate-600">Interested</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats?.interested ? Math.round((stats.interested / stats.contacted) * 100) : 0}%</div>
                  <div className="text-sm text-slate-600">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Selection */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Recipients</CardTitle>
              <Badge variant="secondary">
                {selectedBusinesses.length} of {businesses.length} selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                <span className="ml-2">Loading businesses...</span>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-search text-slate-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No prospects found</h3>
                <p className="text-slate-600">Search for businesses to build your prospect list first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <Checkbox
                    checked={selectedBusinesses.length === businesses.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium text-slate-900">Select All ({businesses.length})</span>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {businesses.map((business: Business) => (
                    <div key={business.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                      <Checkbox
                        checked={selectedBusinesses.includes(business.id)}
                        onCheckedChange={(checked) => handleSelectBusiness(business.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{business.name}</div>
                        <div className="text-sm text-slate-600">{business.category} • {business.address}</div>
                      </div>
                      <Badge 
                        className={
                          business.contactStatus === 'new' ? 'bg-slate-100 text-slate-700' :
                          business.contactStatus === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          business.contactStatus === 'interested' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {business.contactStatus === 'new' ? 'New' :
                         business.contactStatus === 'contacted' ? 'Contacted' :
                         business.contactStatus === 'interested' ? 'Interested' :
                         'Not Interested'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </Layout>
  );
}