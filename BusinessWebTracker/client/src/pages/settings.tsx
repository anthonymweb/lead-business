import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";

export default function Settings() {
  const [emailSettings, setEmailSettings] = useState({
    senderName: localStorage.getItem('senderName') || '',
    senderEmail: localStorage.getItem('senderEmail') || '',
    notifyOnInterest: localStorage.getItem('notifyOnInterest') === 'true',
    notificationEmail: localStorage.getItem('notificationEmail') || '',
  });

  const [apiSettings, setApiSettings] = useState({
    googleApiKey: '',
    sendgridApiKey: '',
  });

  const { toast } = useToast();

  const handleSaveEmailSettings = () => {
    localStorage.setItem('senderName', emailSettings.senderName);
    localStorage.setItem('senderEmail', emailSettings.senderEmail);
    localStorage.setItem('notifyOnInterest', emailSettings.notifyOnInterest.toString());
    localStorage.setItem('notificationEmail', emailSettings.notificationEmail);
    
    toast({
      title: "Settings saved",
      description: "Your email settings have been saved successfully.",
    });
  };

  return (
    <Layout title="Settings" subtitle="Configure your lead generation preferences and API settings">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={emailSettings.senderName}
                  onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={emailSettings.senderEmail}
                  onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailSettings.notifyOnInterest}
                  onCheckedChange={(checked) => setEmailSettings({...emailSettings, notifyOnInterest: checked})}
                />
                <label className="text-sm text-slate-700">
                  Notify me when businesses express interest
                </label>
              </div>

              {emailSettings.notifyOnInterest && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notification Email</label>
                  <Input
                    type="email"
                    placeholder="notifications@email.com"
                    value={emailSettings.notificationEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, notificationEmail: e.target.value})}
                  />
                </div>
              )}

              <Button onClick={handleSaveEmailSettings} className="w-full">
                <i className="fas fa-save mr-2"></i>
                Save Email Settings
              </Button>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Google Places API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your Google Places API key"
                  value={apiSettings.googleApiKey}
                  onChange={(e) => setApiSettings({...apiSettings, googleApiKey: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Required for searching businesses on Google Maps
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SendGrid API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your SendGrid API key"
                  value={apiSettings.sendgridApiKey}
                  onChange={(e) => setApiSettings({...apiSettings, sendgridApiKey: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Required for sending automated emails
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">API Setup Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Get Google Places API key from Google Cloud Console</li>
                  <li>• Enable Places API and Geocoding API</li>
                  <li>• Get SendGrid API key from SendGrid dashboard</li>
                  <li>• Verify your sender email in SendGrid</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Email Best Practices</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Keep emails professional and concise</li>
                  <li>• Personalize messages when possible</li>
                  <li>• Include clear contact information</li>
                  <li>• Follow CAN-SPAM compliance guidelines</li>
                  <li>• Respect unsubscribe requests</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Legal Considerations</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Only contact businesses for legitimate purposes</li>
                  <li>• Comply with local spam and privacy laws</li>
                  <li>• Respect business preferences</li>
                  <li>• Maintain professional communication</li>
                  <li>• Keep records of consent where required</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
    </Layout>
  );
}