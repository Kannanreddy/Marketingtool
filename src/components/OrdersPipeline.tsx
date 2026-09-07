import { useState, FormEvent } from 'react';
import { 
  ReceiptText, 
  Search, 
  Send, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  Package,
  ExternalLink,
  MessageCircle,
  Plus
} from 'lucide-react';
import { Order, StoreSettings, Product } from '../types';

interface OrdersPipelineProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['Status'], trackingNo?: string) => void;
  onAddOrder: (order: Order) => void;
  settings: StoreSettings;
  products: Product[];
  onLookupOrder: (orderId: string) => void;
}

export default function OrdersPipeline({
  orders,
  onUpdateOrderStatus,
  onAddOrder,
  settings,
  products
}: OrdersPipelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Manual Order Form
  const [newOrder, setNewOrder] = useState({
    sku: products[0]?.SKU || '',
    customerName: '',
    phone: '',
    address: '',
    quantity: 1,
    paymentMethod: 'COD' as const
  });

  const filteredOrders = orders.filter(o => {
    const matchQuery = 
      o.OrderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.Phone.includes(searchTerm) ||
      o.SKU.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'all' || o.Status === filterStatus;
    return matchQuery && matchStatus;
  });

  const notifyCustomerWhatsApp = (order: Order) => {
    const trackingLink = `${window.location.origin}/?track=${encodeURIComponent(order.OrderID)}`;
    const trackingDetails = order.TrackingNumber ? `\n🚚 Courier Tracking #: *${order.TrackingNumber}*` : '';

    const msg = `Hello ${order.CustomerName}!\n\nYour order from *${settings.StoreName}* has an update:\n\n` +
      `📦 Order ID: *${order.OrderID}*\n` +
      `⚡ Status: *${order.Status.toUpperCase()}*\n` +
      `🏷️ Item: ${order.SKU} (Qty: ${order.Quantity})\n` +
      `💰 Total: ${order.Total}${trackingDetails}\n\n` +
      `Track your live shipment status anytime here:\n${trackingLink}\n\n` +
      `Thank you for choosing ${settings.StoreName}!`;

    const cleanPhone = order.Phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCreateOrder = (e: FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.SKU === newOrder.sku) || products[0];
    const unitPrice = parseFloat(String(prod?.DiscountPrice || prod?.Price || '0').replace(/[^0-9.]/g, '')) || 0;
    const totalAmount = `₹${unitPrice * newOrder.quantity}`;

    const created: Order = {
      OrderID: `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      Timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      SKU: newOrder.sku,
      CustomerName: newOrder.customerName,
      Phone: newOrder.phone,
      Address: newOrder.address,
      Total: totalAmount,
      Source: 'Admin Dashboard',
      Status: 'New',
      Quantity: newOrder.quantity,
      PaymentMethod: newOrder.paymentMethod,
      PaymentStatus: 'Pending',
      TrackingNumber: ''
    };

    onAddOrder(created);
    setModalOpen(false);
    setNewOrder({
      sku: products[0]?.SKU || '',
      customerName: '',
      phone: '',
      address: '',
      quantity: 1,
      paymentMethod: 'COD'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Manual Order</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Item & Qty</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Courier Tracking #</th>
                <th className="py-3 px-4 text-right">Customer WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <ReceiptText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">No orders found in pipeline.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.OrderID} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order ID & Time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-xs">{o.OrderID}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{o.Timestamp}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{o.CustomerName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{o.Phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={o.Address}>
                        {o.Address}
                      </div>
                    </td>

                    {/* Product & Qty */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-slate-800">{o.SKU}</div>
                      <div className="text-xs text-slate-500">Qty: {o.Quantity}</div>
                    </td>

                    {/* Total & Payment */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-emerald-800">{o.Total}</div>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {o.PaymentMethod}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={o.Status}
                        onChange={(e) => onUpdateOrderStatus(o.OrderID, e.target.value as Order['Status'], o.TrackingNumber)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                          o.Status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : o.Status === 'Shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : o.Status === 'Packed'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : o.Status === 'Confirmed'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Courier Tracking */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. DTDC-12345"
                          defaultValue={o.TrackingNumber || ''}
                          onBlur={(e) => onUpdateOrderStatus(o.OrderID, o.Status, e.target.value)}
                          className="w-36 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </td>

                    {/* WhatsApp Notify */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => notifyCustomerWhatsApp(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#128C7E] transition-colors"
                        title="Send WhatsApp shipment notification"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Send Alert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">Create Direct Order</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product</label>
                <select
                  value={newOrder.sku}
                  onChange={(e) => setNewOrder({ ...newOrder, sku: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {products.map(p => (
                    <option key={p.SKU} value={p.SKU}>
                      {p.Name} ({p.DiscountPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Address</label>
                <textarea
                  rows={2}
                  value={newOrder.address}
                  onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none"
                  placeholder="Street, City, PIN code"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
