import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout";
import { Business, SearchHistory } from "@shared/schema";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: searchHistory = [] } = useQuery({
    queryKey: ['/api/search-history'],
    queryFn: () => fetch('/api/search-history').then(res => res.json()),
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['/api/businesses'],
    queryFn: () => fetch('/api/businesses').then(res => res.json()),
  });

  const conversionRate = stats?.contacted > 0 ? Math.round((stats.interested / stats.contacted) * 100) : 0;
  const websiteRate = stats?.totalSearched > 0 ? Math.round(((stats.totalSearched - stats.noWebsite) / stats.totalSearched) * 100) : 0;

  const getCategoryStats = () => {
    const categoryMap = new Map<string, { total: number; noWebsite: number; contacted: number; interested: number }>();
    
    businesses.forEach((business: Business) => {
      const category = business.category || 'Other';
      const existing = categoryMap.get(category) || { total: 0, noWebsite: 0, contacted: 0, interested: 0 };
      
      existing.total++;
      if (!business.hasWebsite) existing.noWebsite++;
      if (business.contactStatus === 'contacted') existing.contacted++;
      if (business.contactStatus === 'interested') existing.interested++;
      
      categoryMap.set(category, existing);
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats,
      conversionRate: stats.contacted > 0 ? Math.round((stats.interested / stats.contacted) * 100) : 0
    }));
  };

  const categoryStats = getCategoryStats();

  return (
    <Layout title="Analytics" subtitle="Track your lead generation performance and campaign effectiveness">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
                  <i className="fas fa-search text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Searched</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalSearched || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600">
                  <i className="fas fa-exclamation-triangle text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">No Website</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.noWebsite || 0}</p>
                  <p className="text-xs text-slate-500">{100 - websiteRate}% of searches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600">
                  <i className="fas fa-envelope text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Contacted</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.contacted || 0}</p>
                  <p className="text-xs text-slate-500">{stats?.noWebsite > 0 ? Math.round((stats.contacted / stats.noWebsite) * 100) : 0}% of prospects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
                  <i className="fas fa-thumbs-up text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Interested</p>
                  <p className="text-2xl font-bold text-slate-900">{stats?.interested || 0}</p>
                  <p className="text-xs text-slate-500">{conversionRate}% conversion rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryStats.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-chart-bar text-slate-400 text-4xl mb-4"></i>
                  <p className="text-slate-600">No data available yet. Start searching for businesses to see analytics.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryStats.map((category) => (
                    <div key={category.category} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 capitalize">{category.category}</h3>
                        <Badge variant="secondary">{category.total} total</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-600">No Website</div>
                          <div className="font-semibold text-yellow-600">{category.noWebsite}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Contacted</div>
                          <div className="font-semibold text-purple-600">{category.contacted}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Interested</div>
                          <div className="font-semibold text-green-600">{category.interested} ({category.conversionRate}%)</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-history text-slate-400 text-4xl mb-4"></i>
                  <p className="text-slate-600">No search history yet. Start searching to see your activity.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchHistory.slice(0, 10).map((search: SearchHistory) => (
                    <div key={search.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{search.location}</div>
                        <div className="text-sm text-slate-600">
                          {search.radius} miles • {search.category || 'All categories'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{search.noWebsiteCount} prospects</div>
                        <div className="text-xs text-slate-500">{search.resultsCount} total found</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-lightbulb text-blue-600 mr-2"></i>
                  <h3 className="font-semibold text-blue-900">Search Efficiency</h3>
                </div>
                <p className="text-sm text-blue-700">
                  {websiteRate}% of businesses already have websites. Focus on categories with higher no-website rates.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-chart-line text-green-600 mr-2"></i>
                  <h3 className="font-semibold text-green-900">Conversion Rate</h3>
                </div>
                <p className="text-sm text-green-700">
                  {conversionRate}% of contacted businesses show interest. 
                  {conversionRate < 10 ? ' Consider refining your outreach approach.' : 
                   conversionRate < 20 ? ' Good performance! Keep it up.' : 
                   ' Excellent conversion rate!'}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="fas fa-target text-purple-600 mr-2"></i>
                  <h3 className="font-semibold text-purple-900">Best Opportunities</h3>
                </div>
                <p className="text-sm text-purple-700">
                  {categoryStats.length > 0 ? (
                    `${categoryStats.reduce((best, current) => 
                      current.noWebsite > best.noWebsite ? current : best
                    ).category} has the most prospects without websites.`
                  ) : (
                    'Start searching to identify the best opportunities.'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    </Layout>
  );
}