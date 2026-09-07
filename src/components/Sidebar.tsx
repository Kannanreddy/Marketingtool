import { 
  Package, 
  Palette, 
  CalendarClock, 
  ReceiptText, 
  Code2, 
  Settings, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  Layers
} from 'lucide-react';
import { StoreSettings } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  settings: StoreSettings;
  onPreviewClient: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  settings,
  onPreviewClient
}: SidebarProps) {
  const menuItems = [
    { id: 'products', label: 'Products Catalog', icon: Package },
    { id: 'studio', label: 'Creative Studio', icon: Palette },
    { id: 'scheduler', label: 'Auto Scheduler', icon: CalendarClock },
    { id: 'orders', label: 'Orders Pipeline', icon: ReceiptText },
    { id: 'appsscript', label: 'Apps Script Code', icon: Code2, badge: 'Fixed' },
    { id: 'settings', label: 'Brand Settings', icon: Settings },
  ];

  return (
    <aside 
      id="sidebar" 
      className={`bg-emerald-950 text-white flex flex-col flex-shrink-0 transition-all duration-200 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-emerald-900/60 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Layers className="w-5 h-5 text-emerald-950" />
            </div>
            <div className="truncate">
              <h1 className="font-bold text-sm tracking-wide text-white truncate">
                {settings.StoreName || 'RACEOL'}
              </h1>
              <p className="text-[11px] text-emerald-400 font-medium">SheetPost Studio</p>
            </div>
          </div>
        )}
        <button
          id="toggleSidebarBtn"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-900 hover:text-white transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                  : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-emerald-400'}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left flex items-center justify-between">
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Client Mode Preview Trigger */}
      <div className="p-3 border-t border-emerald-900/60 bg-emerald-950/80">
        <button
          id="btnOpenCustomerStorefront"
          onClick={onPreviewClient}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-400 text-emerald-950 hover:brightness-105 transition-all shadow-md shadow-amber-500/10 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Switch to Customer Order Page"
        >
          <ShoppingBag className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">Customer Order Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {!collapsed && (
          <div className="mt-3 px-1 text-[11px] text-emerald-300/60 leading-tight">
            Connected Sheet:
            <div className="text-emerald-200 font-mono text-[10px] truncate mt-0.5">
              {settings.SpreadsheetId ? `...${settings.SpreadsheetId.slice(-12)}` : 'Default'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
