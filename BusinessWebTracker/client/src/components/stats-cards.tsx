import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const statsData = [
    {
      title: "Total Searched",
      value: stats?.totalSearched || 0,
      icon: "fas fa-search",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "No Website",
      value: stats?.noWebsite || 0,
      icon: "fas fa-exclamation-triangle",
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      title: "Contacted",
      value: stats?.contacted || 0,
      icon: "fas fa-envelope",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Interested",
      value: stats?.interested || 0,
      icon: "fas fa-thumbs-up",
      color: "bg-green-500/10 text-green-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
