import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, Zap, Mail } from "lucide-react";

export default function MoneyMakingTips() {
  const tips = [
    {
      icon: Target,
      title: "Target High-Value Businesses", 
      description: "Focus on restaurants, beauty salons, and professional services - they need websites most",
      earning: "700,000-1,700,000 UGX per client"
    },
    {
      icon: Zap,
      title: "Quick Setup Services",
      description: "Offer simple landing pages, Google My Business optimization, and social media setup",
      earning: "300,000-800,000 UGX per service"
    },
    {
      icon: Mail,
      title: "Professional Email Templates",
      description: "Use built-in templates mentioning lost customers and online presence benefits", 
      earning: "20-30% response rate"
    },
    {
      icon: DollarSign,
      title: "Package Your Services",
      description: "Bundle website + SEO + social media for higher-value contracts",
      earning: "1,200,000-3,500,000 UGX packages"
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Quick Money-Making Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <tip.icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">{tip.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{tip.description}</p>
              <Badge variant="secondary" className="mt-2 text-green-700 bg-green-100">
                {tip.earning}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}