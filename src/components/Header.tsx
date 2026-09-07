import { 
  ShoppingBag, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Share2,
  FileSpreadsheet
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface HeaderProps {
  currentTab: string;
  selectedProduct: Product | null;
  productsCount: number;
  settings: StoreSettings;
  onRefreshData: () => void;
  isSyncing: boolean;
  onPreviewClient: (sku?: string) => void;
  onOpenStudioForProduct: (sku: string) => void;
}

export default function Header({
  currentTab,
  selectedProduct,
  productsCount,
  settings,
  onRefreshData,
  isSyncing,
  onPreviewClient,
  onOpenStudioForProduct
}: HeaderProps) {
  const titles: Record<string, string> = {
    products: 'Products Catalog',
    studio: 'Creative Studio & Post Generator',
    scheduler: 'Automated Social Media Scheduler',
    orders: 'Orders Pipeline & Tracking',
    appsscript: 'Apps Script Project Code (100% Fixed)',
    settings: 'Brand & Storefront Settings'
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3">
        <h2 id="headerPageTitle" className="text-lg font-bold text-slate-900 tracking-tight">
          {titles[currentTab] || 'Admin Studio'}
        </h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{productsCount} Products Online</span>
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          id="btnSyncGoogleSheet"
          onClick={onRefreshData}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-60"
          title="Reload latest data from Google Sheet"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Sheet'}</span>
        </button>

        {selectedProduct && (
          <button
            id="btnHeaderStudio"
            onClick={() => onOpenStudioForProduct(selectedProduct.SKU)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
            title={`Create banner for ${selectedProduct.Name}`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Post Generator ({selectedProduct.SKU})</span>
          </button>
        )}

        <button
          id="btnTestClientOrderLink"
          onClick={() => onPreviewClient(selectedProduct?.SKU)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors"
          title="Open customer order page with active SKU"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span>View Customer Order Page</span>
          <ExternalLink className="w-3 h-3 text-emerald-300" />
        </button>
      </div>
    </header>
  );
}
