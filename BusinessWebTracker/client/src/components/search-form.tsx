import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SearchFormProps {
  onApiError?: () => void;
}

export default function SearchForm({ onApiError }: SearchFormProps) {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("5");
  const [category, setCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quick start suggestions for immediate money-making
  const quickStarts = [
    { location: "Miami, FL", category: "restaurant", label: "Miami Restaurants" },
    { location: "Austin, TX", category: "beauty", label: "Austin Beauty Salons" },
    { location: "Denver, CO", category: "retail", label: "Denver Retail Shops" },
    { location: "Portland, OR", category: "professional", label: "Portland Services" },
  ];

  const searchMutation = useMutation({
    mutationFn: async (searchParams: { location: string; radius: number; category?: string }) => {
      const response = await apiRequest('POST', '/api/search', searchParams);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Search completed",
        description: `Found ${data.noWebsiteCount} businesses without websites out of ${data.totalFound} total businesses.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "An error occurred while searching for businesses.";
      
      // Show API setup guide if it's an API configuration error
      if (errorMessage.includes("Google Places API") || errorMessage.includes("not authorized")) {
        onApiError?.();
      }
      
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to search for businesses.",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      location: location.trim(),
      radius: parseInt(radius),
      category: category === "all" ? undefined : category,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="City, State or ZIP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pr-10"
              />
              <i className="fas fa-map-marker-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            </div>
          </div>

          {/* Search Radius */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Radius</label>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 miles</SelectItem>
                <SelectItem value="10">10 miles</SelectItem>
                <SelectItem value="25">25 miles</SelectItem>
                <SelectItem value="50">50 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Business Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="restaurant">Restaurants</SelectItem>
                <SelectItem value="retail">Retail Stores</SelectItem>
                <SelectItem value="professional">Professional Services</SelectItem>
                <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                <SelectItem value="home">Home Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button 
              type="submit" 
              className="w-full bg-primary text-white hover:bg-blue-700"
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Searching...
                </>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>
                  Search Businesses
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
