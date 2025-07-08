import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Business } from "@shared/schema";
import ContactModal from "@/components/contact-modal";
import Layout from "@/components/layout";

export default function Prospects() {
  const [filter, setFilter] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['/api/businesses', { noWebsiteOnly: filter === 'no_website' }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter === 'no_website') {
        params.append('noWebsiteOnly', 'true');
      } else if (filter !== 'all') {
        params.append('contactStatus', filter);
      }
      return fetch(`/api/businesses?${params}`).then(res => res.json());
    },
  });

  const handleContactBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setIsContactModalOpen(true);
  };

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

  return (
    <Layout title="Prospects" subtitle="Manage your business leads and track contact status">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Prospects</CardTitle>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  <SelectItem value="no_website">No Website Only</SelectItem>
                  <SelectItem value="new">New Leads</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                <span className="ml-2">Loading prospects...</span>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-users text-slate-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No prospects found</h3>
                <p className="text-slate-600">Start searching for businesses to build your prospect list.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.map((business: Business) => (
                  <div key={business.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{business.name}</h3>
                          {getStatusBadge(business.contactStatus)}
                          {!business.hasWebsite && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              No Website
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <p><strong>Category:</strong> {business.category}</p>
                            <p><strong>Address:</strong> {business.address}</p>
                          </div>
                          <div>
                            <p><strong>Phone:</strong> {business.phone || 'N/A'}</p>
                            <div className="flex items-center">
                              <strong className="mr-2">Rating:</strong>
                              {renderStars(business.rating)}
                            </div>
                          </div>
                        </div>
                        {business.notes && (
                          <div className="mt-2 text-sm text-slate-600">
                            <strong>Notes:</strong> {business.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleContactBusiness(business)}
                          className="bg-primary hover:bg-blue-700"
                        >
                          <i className="fas fa-envelope mr-2"></i>
                          Contact
                        </Button>
                        {business.lat && business.lng && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`, '_blank')}
                          >
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            View on Map
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ContactModal
          business={selectedBusiness}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
    </Layout>
  );
}