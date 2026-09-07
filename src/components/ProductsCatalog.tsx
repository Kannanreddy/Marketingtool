import { useState, useMemo, FormEvent } from 'react';
import { 
  Search, 
  Plus, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Filter, 
  FileSpreadsheet, 
  Download,
  AlertCircle,
  Tag,
  Boxes
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductsCatalogProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (sku: string) => void;
  onOpenStudio: (sku: string) => void;
  onPreviewClient: (sku: string) => void;
  settings: StoreSettings;
}

export default function ProductsCatalog({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onOpenStudio,
  onPreviewClient,
  settings
}: ProductsCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    SKU: '',
    Name: '',
    Price: '',
    DiscountPrice: '',
    Stock: 50,
    Status: 'Active',
    ImageDriveURL: '',
    Tags: '',
    ShortDescription: '',
    viscosity: '20W-40',
    size: '1L'
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
      if (p.Tags) {
        p.Tags.split(',').forEach(t => {
          const clean = t.trim();
          if (clean && !clean.includes('w')) set.add(clean);
        });
      }
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchQuery = 
        p.SKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.Tags && p.Tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.viscosity && p.viscosity.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = filterCategory === 'all' || 
        p.category === filterCategory || 
        (p.Tags && p.Tags.includes(filterCategory));

      return matchQuery && matchCat;
    });
  }, [products, searchTerm, filterCategory]);

  const handleOpenAdd = () => {
    setEditingSku(null);
    setFormData({
      SKU: `RACEOL-${Math.floor(100 + Math.random() * 900)}`,
      Name: '',
      Price: '₹350',
      DiscountPrice: '₹299',
      Stock: 50,
      Status: 'Active',
      ImageDriveURL: 'https://images.unsplash.com/photo-1635784063738-f9b6e22f7d5a?w=600&auto=format&fit=crop&q=80',
      Tags: 'engine-oil,bike',
      ShortDescription: '',
      viscosity: '20W-40',
      size: '1L'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingSku(p.SKU);
    setFormData({ ...p });
    setModalOpen(true);
  };

  const handleSaveModal = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.SKU || !formData.Name) {
      alert('SKU and Product Name are required.');
      return;
    }

    const prodToSave: Product = {
      SKU: formData.SKU.trim(),
      Name: formData.Name.trim(),
      Price: formData.Price?.trim() || '₹0',
      DiscountPrice: formData.DiscountPrice?.trim() || formData.Price?.trim() || '₹0',
      Stock: Number(formData.Stock) || 0,
      Status: formData.Status || 'Active',
      ImageDriveURL: formData.ImageDriveURL?.trim() || 'https://images.unsplash.com/photo-1635784063738-f9b6e22f7d5a?w=600&auto=format&fit=crop&q=80',
      Tags: formData.Tags?.trim() || '',
      ShortDescription: formData.ShortDescription?.trim() || '',
      LongDescription: formData.LongDescription?.trim() || formData.ShortDescription?.trim() || '',
      viscosity: formData.viscosity || '',
      size: formData.size || ''
    };

    if (editingSku) {
      onUpdateProduct(prodToSave);
    } else {
      onAddProduct(prodToSave);
    }
    setModalOpen(false);
  };

  const handleCopyLink = (sku: string) => {
    const url = `${window.location.origin}/?p=${encodeURIComponent(sku)}`;
    navigator.clipboard.writeText(url);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Name', 'Price', 'DiscountPrice', 'Stock', 'ImageDriveURL', 'Tags', 'Status', 'ShortDescription', 'OrderLink'];
    const rows = products.map(p => [
      `"${p.SKU}"`,
      `"${p.Name.replace(/"/g, '""')}"`,
      `"${p.Price}"`,
      `"${p.DiscountPrice}"`,
      p.Stock,
      `"${p.ImageDriveURL}"`,
      `"${p.Tags}"`,
      `"${p.Status}"`,
      `"${(p.ShortDescription || '').replace(/"/g, '""')}"`,
      `"${window.location.origin}/?p=${p.SKU}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `raceol_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="adminSearchInput"
              type="text"
              placeholder="Search by SKU, Name, Viscosity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="relative min-w-[140px]">
            <select
              id="filterCategorySelect"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 appearance-none pr-8 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btnExportProductsCsv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            title="Export catalog as Google Sheet compatible CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="btnAddNewProduct"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">SKU / Specs</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Price / Offer</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Marketing & Order Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">No products match your search.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting search filters or add a new product.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = Number(p.Stock) <= 25;
                  return (
                    <tr key={p.SKU} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          <img
                            src={p.ImageDriveURL}
                            alt={p.Name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback placeholder
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </td>

                      {/* SKU & Specs */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">{p.SKU}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span>{p.viscosity || 'Engine Oil'}</span>
                          {p.size && <span className="text-slate-400">• {p.size}</span>}
                        </div>
                      </td>

                      {/* Name & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">{p.Name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.ShortDescription}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-emerald-800 text-sm">{p.DiscountPrice}</div>
                        <div className="text-xs text-slate-400 line-through">{p.Price}</div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {p.Stock} in stock
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {p.Status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                        {/* Open Creative Studio */}
                        <button
                          onClick={() => onOpenStudio(p.SKU)}
                          className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                          title="Generate Promotional Banner & Social Post"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Banner</span>
                        </button>

                        {/* Customer Order Page Preview */}
                        <button
                          onClick={() => onPreviewClient(p.SKU)}
                          className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                          title="Open Unique Customer Order Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Order Page</span>
                        </button>

                        {/* Copy Order Link */}
                        <button
                          onClick={() => handleCopyLink(p.SKU)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors inline-flex items-center"
                          title="Copy Unique Order Link"
                        >
                          {copiedSku === p.SKU ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors inline-flex items-center"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete product ${p.SKU}?`)) {
                              onDeleteProduct(p.SKU);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors inline-flex items-center"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-bold text-lg text-slate-900">
                {editingSku ? `Edit Product: ${editingSku}` : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingSku}
                    value={formData.SKU}
                    onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="e.g. RACEOL-20W40-1L"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    placeholder="Raceol 20W-40 1L"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">M.R.P (Original Price)</label>
                  <input
                    type="text"
                    value={formData.Price}
                    onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    placeholder="₹342"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Offer Price (Discounted)</label>
                  <input
                    type="text"
                    value={formData.DiscountPrice}
                    onChange={(e) => setFormData({ ...formData, DiscountPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-emerald-800 font-bold"
                    placeholder="₹299"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.Stock}
                    onChange={(e) => setFormData({ ...formData, Stock: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Viscosity</label>
                  <input
                    type="text"
                    value={formData.viscosity}
                    onChange={(e) => setFormData({ ...formData, viscosity: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    placeholder="20W-40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    placeholder="1L / 5L / 500ML"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={formData.ImageDriveURL}
                  onChange={(e) => setFormData({ ...formData, ImageDriveURL: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.Tags}
                  onChange={(e) => setFormData({ ...formData, Tags: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  placeholder="engine-oil, bike, 20w40, genuine"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description (for social posts & checkout)</label>
                <textarea
                  rows={2}
                  value={formData.ShortDescription}
                  onChange={(e) => setFormData({ ...formData, ShortDescription: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  placeholder="Highlights, clutch grip, performance..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors"
                >
                  {editingSku ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
