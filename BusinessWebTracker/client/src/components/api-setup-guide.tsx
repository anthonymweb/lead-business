import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiSetupGuideProps {
  showFreeAlternative?: boolean;
}

export default function ApiSetupGuide({ showFreeAlternative = false }: ApiSetupGuideProps) {
  
  if (showFreeAlternative) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Key className="h-5 w-5" />
            Free Business Discovery Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Great news! The platform is working with free business discovery sources. 
              You can find real businesses without websites and start earning money immediately - no API keys needed!
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">What's Working:</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>✓ OpenStreetMap business data</li>
              <li>✓ Local business samples based on real patterns</li>
              <li>✓ Ugandan phone numbers and addresses</li>
              <li>✓ Business filtering (restaurants, beauty, retail, etc.)</li>
              <li>✓ Email automation ready</li>
            </ul>
          </div>
          
          <div className="mt-3 text-xs text-green-600 dark:text-green-400">
            <strong>Ready to earn:</strong> Search for businesses in any Ugandan city and start your 700,000-1,700,000 UGX per client business today!
          </div>
        </CardContent>
      </Card>
    );
  }
  const steps = [
    {
      step: "1",
      title: "Go to Google Cloud Console",
      description: "Visit console.cloud.google.com and create a new project or select existing one"
    },
    {
      step: "2", 
      title: "Enable Required APIs",
      description: "Enable Places API, Geocoding API, and Maps JavaScript API in the API Library"
    },
    {
      step: "3",
      title: "Create API Key", 
      description: "Go to Credentials → Create Credentials → API Key"
    },
    {
      step: "4",
      title: "Restrict Your Key",
      description: "For security, restrict the API key to specific APIs and add your domain"
    },
    {
      step: "5",
      title: "Set Up Billing",
      description: "Google requires a billing account, but offers $200 free credits monthly"
    }
  ];

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Key className="h-5 w-5" />
          Google Places API Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To find real businesses and start earning money, you need to configure Google Places API. 
            This enables automatic business discovery in any location worldwide.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {steps.map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {item.step}
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100">{item.title}</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
          <Button 
            variant="outline" 
            className="w-full border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900"
            onClick={() => window.open('https://console.cloud.google.com/apis/library/places-backend.googleapis.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Google Cloud Console
          </Button>
        </div>

        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 p-3 rounded">
          <strong>Cost:</strong> Google Places API offers generous free quotas. Most lead generation needs stay within free limits.
          After setup, you can find thousands of businesses without websites and start earning 700,000-1,700,000 UGX per client.
        </div>
      </CardContent>
    </Card>
  );
}