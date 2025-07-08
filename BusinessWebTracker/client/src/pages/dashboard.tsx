import { useState } from "react";
import SearchForm from "@/components/search-form";
import ResultsTable from "@/components/results-table";
import StatsCards from "@/components/stats-cards";
import ContactModal from "@/components/contact-modal";
import MoneyMakingTips from "@/components/money-making-tips";
import ApiSetupGuide from "@/components/api-setup-guide";
import Layout from "@/components/layout";
import { Business } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);

  // Check if we have any businesses to determine if API is working
  const { data: businesses } = useQuery({
    queryKey: ['/api/businesses'],
    queryFn: async () => {
      const response = await fetch('/api/businesses');
      return response.json();
    }
  });

  const handleContactBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setIsContactModalOpen(true);
  };

  return (
    <Layout title="Business Search" subtitle="Find businesses without websites and generate leads">
      <MoneyMakingTips />
      <ApiSetupGuide showFreeAlternative={true} />
      <SearchForm onApiError={() => setShowApiGuide(true)} />
      <ResultsTable onContactBusiness={handleContactBusiness} />
      <StatsCards />

      <ContactModal
        business={selectedBusiness}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </Layout>
  );
}
