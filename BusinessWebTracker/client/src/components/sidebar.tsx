import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const navigationItems = [
    {
      href: "/",
      icon: "fas fa-search",
      label: "Business Search",
      active: location === "/"
    },
    {
      href: "/prospects",
      icon: "fas fa-list",
      label: "Prospects",
      active: location === "/prospects",
      count: stats?.noWebsite
    },
    {
      href: "/campaigns",
      icon: "fas fa-envelope",
      label: "Email Campaigns",
      active: location === "/campaigns"
    },
    {
      href: "/analytics",
      icon: "fas fa-chart-line",
      label: "Analytics",
      active: location === "/analytics"
    }
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-search text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Lead Generator</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  item.active 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-700 hover:bg-slate-100"
                }`}>
                  <i className={`${item.icon} text-sm`}></i>
                  <span>{item.label}</span>
                  {item.count && (
                    <span className="ml-auto bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-slate-200">
        <Link href="/settings">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <i className="fas fa-cog text-sm"></i>
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
