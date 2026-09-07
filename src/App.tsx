import { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  Order, 
  StoreSettings, 
  ScheduleItem, 
  BannerAspectRatio 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_SETTINGS, 
  INITIAL_SCHEDULE 
} from './data/initialData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductsCatalog from './components/ProductsCatalog';
import CreativeStudio from './components/CreativeStudio';
import SocialScheduler from './components/SocialScheduler';
import OrdersPipeline from './components/OrdersPipeline';
import ClientStorefront from './components/ClientStorefront';
import AppsScriptExporter from './components/AppsScriptExporter';
import SettingsTab from './components/SettingsTab';

export default function App() {
  // Load persistent state from localStorage with safe initial fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sheetpost_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('sheetpost_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('sheetpost_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('sheetpost_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  // UI State
  const [currentTab, setCurrentTab] = useState('products');
  const [selectedSku, setSelectedSku] = useState(products[0]?.SKU || 'RACEOL-20W40-1L');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClientMode, setIsClientMode] = useState(false);
  const [initialTrackingId, setInitialTrackingId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sheetpost_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to persist products:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('sheetpost_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to persist orders:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('sheetpost_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('sheetpost_schedule', JSON.stringify(schedule));
    } catch (e) {
      console.warn('Failed to persist schedule:', e);
    }
  }, [schedule]);

  // Check URL parameters on mount for ?p=SKU or ?track=ORD...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skuParam = params.get('p');
    const trackParam = params.get('track');

    if (skuParam) {
      const match = products.find(p => p.SKU.toUpperCase() === skuParam.toUpperCase());
      if (match) {
        setSelectedSku(match.SKU);
      }
      setIsClientMode(true);
    } else if (trackParam) {
      setInitialTrackingId(trackParam);
      setIsClientMode(true);
    }
  }, [products]);

  // Active product
  const activeProduct = products.find(p => p.SKU === selectedSku) || products[0] || null;

  // Handlers for Products
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    setSelectedSku(newProduct.SKU);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.SKU === updated.SKU ? updated : p));
  };

  const handleDeleteProduct = (sku: string) => {
    setProducts(prev => prev.filter(p => p.SKU !== sku));
    if (selectedSku === sku) {
      const remaining = products.filter(p => p.SKU !== sku);
      if (remaining.length > 0) setSelectedSku(remaining[0].SKU);
    }
  };

  // Handlers for Orders
  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['Status'], trackingNo?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.OrderID === orderId) {
        return {
          ...o,
          Status: status,
          TrackingNumber: trackingNo !== undefined ? trackingNo : o.TrackingNumber
        };
      }
      return o;
    }));
  };

  // Handlers for Schedule
  const handleAddSchedule = (item: ScheduleItem) => {
    setSchedule(prev => [item, ...prev]);
  };

  const handleUpdateScheduleStatus = (id: string, status: 'Scheduled' | 'Queued' | 'Published') => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const handleBulkAutoSchedule = () => {
    const slots = ['08:30 AM', '01:30 PM', '07:30 PM'];
    const newItems: ScheduleItem[] = [];
    const now = Date.now();

    products.slice(0, 6).forEach((prod, index) => {
      const dayOffset = Math.floor(index / 2) + 1;
      const targetDate = new Date(now + dayOffset * 86400000).toISOString().slice(0, 10);
      const slot = slots[index % slots.length];

      newItems.push({
        id: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
        sku: prod.SKU,
        productName: prod.Name,
        title: `${prod.Name} - ${slot} Promo`,
        scheduledDate: targetDate,
        scheduledTime: slot,
        channels: ['whatsapp', 'instagram', 'facebook'],
        status: 'Scheduled',
        caption: `🔥 Flash Drop: ${prod.Name} now at ${prod.DiscountPrice}! 100% Genuine Certified. Order direct at: ${window.location.origin}/?p=${prod.SKU}`,
        aspectRatio: '1:1',
        style: 'automotive',
        palette: 'emerald'
      });
    });

    setSchedule(prev => [...newItems, ...prev]);
    alert('Generated 6 automated campaign drops across the next 3 days!');
  };

  // Quick Open Studio for SKU
  const handleOpenStudio = (sku: string) => {
    setSelectedSku(sku);
    setCurrentTab('studio');
  };

  // Open Client Storefront Preview
  const handlePreviewClient = (sku?: string) => {
    if (sku) setSelectedSku(sku);
    setIsClientMode(true);
  };

  // Schedule Post from Creative Studio
  const handleScheduleFromStudio = (item: {
    sku: string;
    productName: string;
    caption: string;
    aspectRatio: BannerAspectRatio;
    style: string;
    palette: string;
  }) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const newScheduleItem: ScheduleItem = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      sku: item.sku,
      productName: item.productName,
      title: `${item.productName} Studio Post`,
      scheduledDate: tomorrow,
      scheduledTime: '08:30 AM',
      channels: ['whatsapp', 'instagram', 'facebook'],
      status: 'Scheduled',
      caption: item.caption,
      aspectRatio: item.aspectRatio,
      style: item.style,
      palette: item.palette
    };

    handleAddSchedule(newScheduleItem);
    setCurrentTab('scheduler');
  };

  // Simulated Google Sheet live sync
  const handleRefreshSheet = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(`Synchronized with Google Sheet (ID: ${settings.SpreadsheetId}). All ${products.length} products verified.`);
    }, 900);
  };

  // ================= CLIENT STOREFRONT MODE =================
  if (isClientMode && activeProduct) {
    return (
      <ClientStorefront
        product={activeProduct}
        allProducts={products}
        settings={settings}
        orders={orders}
        onSubmitOrder={handleAddOrder}
        onSelectProduct={(sku) => setSelectedSku(sku)}
        onExitClientMode={() => setIsClientMode(false)}
        initialTrackingId={initialTrackingId}
      />
    );
  }

  // ================= ADMIN DASHBOARD =================
  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        settings={settings}
        onPreviewClient={() => handlePreviewClient(selectedSku)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          selectedProduct={activeProduct}
          productsCount={products.length}
          settings={settings}
          onRefreshData={handleRefreshSheet}
          isSyncing={isSyncing}
          onPreviewClient={handlePreviewClient}
          onOpenStudioForProduct={handleOpenStudio}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'products' && (
              <ProductsCatalog
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onOpenStudio={handleOpenStudio}
                onPreviewClient={handlePreviewClient}
                settings={settings}
              />
            )}

            {currentTab === 'studio' && (
              <CreativeStudio
                products={products}
                selectedSku={selectedSku}
                onSelectSku={setSelectedSku}
                settings={settings}
                onSchedulePost={handleScheduleFromStudio}
              />
            )}

            {currentTab === 'scheduler' && (
              <SocialScheduler
                schedule={schedule}
                onAddSchedule={handleAddSchedule}
                onUpdateStatus={handleUpdateScheduleStatus}
                onDeleteSchedule={handleDeleteSchedule}
                onBulkAutoSchedule={handleBulkAutoSchedule}
                products={products}
                settings={settings}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersPipeline
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onAddOrder={handleAddOrder}
                settings={settings}
                products={products}
                onLookupOrder={(id) => {
                  setInitialTrackingId(id);
                  setIsClientMode(true);
                }}
              />
            )}

            {currentTab === 'appsscript' && (
              <AppsScriptExporter />
            )}

            {currentTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onSaveSettings={setSettings}
                onSyncSheet={handleRefreshSheet}
                isSyncing={isSyncing}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
