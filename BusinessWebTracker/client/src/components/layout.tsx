import Sidebar from "@/components/sidebar";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors">
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-slate-600 text-sm"></i>
                </div>
                <span className="text-sm font-medium text-slate-900">Lead Generator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}