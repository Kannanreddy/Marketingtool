import { useState, useMemo, FormEvent } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Package, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { Product, StoreSettings, Order } from '../types';

interface ClientStorefrontProps {
  product: Product;
  allProducts: Product[];
  settings: StoreSettings;
  orders: Order[];
  onSubmitOrder: (order: Order) => void;
  onSelectProduct: (sku: string) => void;
  onExitClientMode: () => void;
  initialTrackingId?: string;
}

export default function ClientStorefront({
  product,
  allProducts,
  settings,
  orders,
  onSubmitOrder,
  onSelectProduct,
  onExitClientMode,
  initialTrackingId
}: ClientStorefrontProps) {
  const [viewMode, setViewMode] = useState<'checkout' | 'track'>('checkout');
  const [trackQuery, setTrackQuery] = useState(initialTrackingId || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);

  // Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custQty, setCustQty] = useState(1);
  const [custPaymentMethod, setCustPaymentMethod] = useState<'COD' | 'UPI'>('COD');

  const unitPrice = useMemo(() => {
    return parseFloat(String(product.DiscountPrice || product.Price || '0').replace(/[^0-9.]/g, '')) || 0;
  }, [product]);

  const originalPrice = useMemo(() => {
    return parseFloat(String(product.Price || '0').replace(/[^0-9.]/g, '')) || 0;
  }, [product]);

  const totalPrice = unitPrice * custQty;

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    const newOrder: Order = {
      OrderID: `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      Timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      SKU: product.SKU,
      CustomerName: custName.trim(),
      Phone: custPhone.trim(),
      Address: custAddress.trim(),
      Total: `₹${totalPrice}`,
      Source: 'Unique Order Page',
      Status: 'New',
      Quantity: custQty,
      PaymentMethod: custPaymentMethod,
      PaymentStatus: 'Pending',
      TrackingNumber: ''
    };

    onSubmitOrder(newOrder);
    setOrderConfirmed(newOrder);
  };

  const handleLookupOrder = (idToLookup?: string) => {
    const q = (idToLookup || trackQuery).trim().toUpperCase();
    if (!q) return;
    const found = orders.find(o => 
      o.OrderID.toUpperCase() === q || 
      o.Phone.includes(q) ||
      (o.TrackingNumber && o.TrackingNumber.toUpperCase() === q)
    );
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      alert(`No order found matching "${q}". Please check your Order ID.`);
    }
  };

  const openWhatsAppSupport = () => {
    const num = settings.WhatsAppNumber || '919876543210';
    const msg = `Hello ${settings.StoreName}, I have a question about ordering ${product.Name} (SKU: ${product.SKU}).`;
    window.open(`https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-950 text-emerald-200 text-xs py-2 px-4 text-center font-medium border-b border-emerald-900/50 flex items-center justify-between">
        <div className="hidden sm:block text-emerald-400/80">Certified Genuine Direct From Manufacturer</div>
        <div className="mx-auto sm:mx-0">{settings.HeaderAnnouncement || 'Free delivery on orders above ₹1,000'}</div>
        <button
          onClick={onExitClientMode}
          className="text-[11px] text-amber-400 hover:underline font-semibold flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Main Storefront Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-700 flex items-center justify-center text-white font-bold shadow-sm">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 tracking-tight leading-tight">
                {settings.StoreName || 'RACEOL Lubricants'}
              </h1>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Direct Order Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setViewMode(viewMode === 'checkout' ? 'track' : 'checkout');
                if (orderConfirmed) {
                  setTrackQuery(orderConfirmed.OrderID);
                  handleLookupOrder(orderConfirmed.OrderID);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-slate-600" />
              <span>{viewMode === 'checkout' ? 'Track Order' : 'Back to Product'}</span>
            </button>

            <button
              onClick={openWhatsAppSupport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">WhatsApp Help</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {viewMode === 'track' ? (
          /* ================= ORDER TRACKING VIEW ================= */
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Track Your Order Status</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your Order Reference ID (e.g. {orders[0]?.OrderID || 'ORD-260907-XXXX'})
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Enter Order ID or Phone..."
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookupOrder()}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                onClick={() => handleLookupOrder()}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Track
              </button>
            </div>

            {searchedOrder ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Order ID</span>
                    <div className="font-mono font-bold text-slate-900 text-sm">{searchedOrder.OrderID}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    searchedOrder.Status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : searchedOrder.Status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {searchedOrder.Status}
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="py-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                    {['New', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                      const stages = ['New', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
                      const currentIdx = stages.indexOf(searchedOrder.Status);
                      const isComplete = currentIdx >= idx;
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                            isComplete ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={isComplete ? 'text-emerald-900 font-bold' : 'text-slate-400'}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400">Product:</span>
                    <div className="font-semibold text-slate-800">{searchedOrder.SKU} (Qty: {searchedOrder.Quantity})</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Payable Total:</span>
                    <div className="font-bold text-emerald-800 text-sm">{searchedOrder.Total} ({searchedOrder.PaymentMethod})</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Customer:</span>
                    <div className="font-medium text-slate-700">{searchedOrder.CustomerName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Courier Tracking #:</span>
                    <div className="font-mono font-semibold text-slate-800">
                      {searchedOrder.TrackingNumber || 'Dispatched shortly'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No tracking search performed yet. Enter your order ID above.
              </div>
            )}
          </div>
        ) : orderConfirmed ? (
          /* ================= ORDER SUCCESS VIEW ================= */
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50/60">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Order Confirmed</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Thank You, {orderConfirmed.CustomerName}!</h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Your order has been recorded in our factory system and will be dispatched within 24 hours.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference ID:</span>
                <span className="font-mono font-bold text-slate-900">{orderConfirmed.OrderID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-semibold text-slate-900">{product.Name} (Qty: {orderConfirmed.Quantity})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Payable ({orderConfirmed.PaymentMethod}):</span>
                <span className="font-bold text-emerald-800 text-sm">{orderConfirmed.Total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="text-slate-700 max-w-[240px] truncate text-right">{orderConfirmed.Address}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setViewMode('track');
                  setTrackQuery(orderConfirmed.OrderID);
                  setSearchedOrder(orderConfirmed);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors"
              >
                Track My Shipment
              </button>
              <button
                onClick={() => setOrderConfirmed(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                Order Another Pack
              </button>
            </div>
          </div>
        ) : (
          /* ================= PRODUCT CHECKOUT VIEW ================= */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Product Visual & Details (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50/70 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                {/* Product Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Genuine Factory Stock
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold">{product.SKU}</span>
                </div>

                {/* Main Product Image */}
                <div className="aspect-square w-full max-w-[320px] mx-auto rounded-xl bg-white border border-slate-200 p-4 flex items-center justify-center overflow-hidden shadow-xs">
                  <img
                    src={product.ImageDriveURL}
                    alt={product.Name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Specs Cards */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs shadow-2xs">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5" /> Technical Specifications
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Viscosity</span>
                    <span className="font-bold text-slate-800">{product.viscosity || '20W-40'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pack Size</span>
                    <span className="font-bold text-slate-800">{product.size || '1L'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  {product.LongDescription || product.ShortDescription}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <Truck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span>Doorstep Delivery</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span>100% Certified</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <PhoneCall className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span>Direct Support</span>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Express Checkout Form (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    {product.category || 'Automotive Lubricants'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">In Stock: {product.Stock} units</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {product.Name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  {product.ShortDescription}
                </p>

                {/* Price Display */}
                <div className="flex items-center gap-3 p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl mb-6">
                  <div>
                    <span className="text-[11px] text-emerald-800 font-semibold block uppercase">Special Direct Price</span>
                    <span className="text-2xl sm:text-3xl font-bold text-emerald-950">
                      {product.DiscountPrice}
                    </span>
                  </div>
                  <div className="text-slate-400 line-through text-base font-semibold">
                    {product.Price}
                  </div>
                  <span className="ml-auto px-2.5 py-1 bg-red-500 text-white font-bold text-xs rounded-lg uppercase">
                    Factory Offer
                  </span>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-800" />
                    <span>Quick Order Form (Cash on Delivery / UPI)</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setCustQty(Math.max(1, custQty - 1))}
                          className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-sm font-bold text-slate-900 bg-white py-1.5">
                          {custQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustQty(custQty + 1)}
                          className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Delivery Address & PIN Code *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Door no, Street, Area, City, State, PIN code"
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCustPaymentMethod('COD')}
                        className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                          custPaymentMethod === 'COD'
                            ? 'border-emerald-700 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">Cash on Delivery</div>
                        <div className="text-[10px] text-slate-500 font-normal">Pay cash at doorstep</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCustPaymentMethod('UPI')}
                        className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                          custPaymentMethod === 'UPI'
                            ? 'border-emerald-700 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">UPI / QR Payment</div>
                        <div className="text-[10px] text-slate-500 font-normal">GPay, PhonePe, Paytm</div>
                      </button>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-100/90 rounded-xl border border-slate-200 mt-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Total Payable:</span>
                      <span className="text-xl font-bold text-emerald-950">₹{totalPrice}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-md">
                      Free Shipping Applied
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Confirm Order Now (₹{totalPrice})</span>
                  </button>
                </form>
              </div>

              {/* Other Products Carousel / Link */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">Other RACEOL Packs:</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allProducts.filter(p => p.SKU !== product.SKU).slice(0, 4).map(other => (
                    <button
                      key={other.SKU}
                      type="button"
                      onClick={() => onSelectProduct(other.SKU)}
                      className="text-left flex-shrink-0 p-2 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 text-xs transition-colors"
                    >
                      <div className="font-bold text-slate-800 truncate max-w-[120px]">{other.Name}</div>
                      <div className="text-emerald-700 font-semibold">{other.DiscountPrice}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-1">
          <p>{settings.FooterText || '© 2026 RACEOL Lubricants India. All rights reserved.'}</p>
          <p>
            Contact seller: <a href={`mailto:${settings.SellerEmail}`} className="text-emerald-800 underline">{settings.SellerEmail}</a> | WhatsApp: +{settings.WhatsAppNumber}
          </p>
        </div>
      </footer>
    </div>
  );
}
