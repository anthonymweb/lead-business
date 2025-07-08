import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Business } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ResultsTableProps {
  onContactBusiness: (business: Business) => void;
}

export default function ResultsTable({ onContactBusiness }: ResultsTableProps) {
  const [selectedBusinesses, setSelectedBusinesses] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['/api/businesses', { noWebsiteOnly: true }],
    queryFn: () => fetch('/api/businesses?noWebsiteOnly=true').then(res => res.json()),
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business-leads.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export successful",
        description: "Business leads have been exported to CSV.",
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the data.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "New Lead", className: "bg-slate-100 text-slate-700" },
      contacted: { label: "Contacted", className: "bg-yellow-100 text-yellow-800" },
      interested: { label: "Interested", className: "bg-green-100 text-green-800" },
      not_interested: { label: "Not Interested", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <i 
          key={i}
          className={`${i < fullStars ? 'fas' : 'far'} fa-star text-yellow-400 text-xs`}
        />
      );
    }
    
    return (
      <div className="flex items-center">
        <span className="text-sm text-slate-700 mr-1">{rating.toFixed(1)}</span>
        <div className="flex">{stars}</div>
      </div>
    );
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

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
            <span className="ml-2">Loading businesses...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      {/* Results Header */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Search Results</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {businesses.length > 0 
                ? `Found ${businesses.length} businesses without websites`
                : "No businesses found. Try searching for businesses in a specific location."
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending || businesses.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <i className="fas fa-download mr-2"></i>
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {businesses.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-search text-slate-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-600">Search for businesses in a location to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <Checkbox
                      checked={selectedBusinesses.length === businesses.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Business Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Address</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {businesses.map((business: Business) => (
                  <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedBusinesses.includes(business.id)}
                        onCheckedChange={(checked) => handleSelectBusiness(business.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{business.name}</div>
                      <div className="text-sm text-slate-600">No website detected</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 capitalize">{business.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{business.address}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{business.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {business.email ? (
                        <span className="text-green-600">{business.email}</span>
                      ) : (
                        <span className="text-slate-400 italic">Will find email</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{renderStars(business.rating)}</td>
                    <td className="px-6 py-4">{getStatusBadge(business.contactStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onContactBusiness(business)}
                          className="text-primary hover:text-blue-700 transition-colors"
                        >
                          <i className="fas fa-envelope text-sm"></i>
                        </button>
                        {business.lat && business.lng && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <i className="fas fa-external-link-alt text-sm"></i>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
