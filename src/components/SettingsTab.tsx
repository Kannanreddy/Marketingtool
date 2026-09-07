import { useState, FormEvent } from 'react';
import { 
  Settings, 
  Save, 
  FileSpreadsheet, 
  Check, 
  Phone, 
  Mail, 
  Building, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { StoreSettings } from '../types';

interface SettingsTabProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onSyncSheet: () => void;
  isSyncing: boolean;
}

export default function SettingsTab({
  settings,
  onSaveSettings,
  onSyncSheet,
  isSyncing
}: SettingsTabProps) {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>Company & Brand Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on promotional banners, client checkout, and WhatsApp order alerts.
            </p>
          </div>

          {saved && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Store Name</label>
            <input
              type="text"
              required
              value={formData.StoreName}
              onChange={(e) => setFormData({ ...formData, StoreName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Business Number (with country code)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.WhatsAppNumber}
                  onChange={(e) => setFormData({ ...formData, WhatsAppNumber: e.target.value })}
                  placeholder="919876543210"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seller Contact Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.SellerEmail}
                  onChange={(e) => setFormData({ ...formData, SellerEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Header Announcement Bar (Storefront banner)
            </label>
            <input
              type="text"
              value={formData.HeaderAnnouncement}
              onChange={(e) => setFormData({ ...formData, HeaderAnnouncement: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Footer Copyright Notice</label>
            <input
              type="text"
              value={formData.FooterText}
              onChange={(e) => setFormData({ ...formData, FooterText: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Google Sheet ID */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Sheet Spreadsheet ID / URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.SpreadsheetId}
                onChange={(e) => setFormData({ ...formData, SpreadsheetId: e.target.value })}
                className="flex-1 px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={onSyncSheet}
                disabled={isSyncing}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Test Sync</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Currently connected to: <span className="font-mono text-slate-600">1kBl0watSXkeOelqv33cY3HvxffNO_gvrBQB5k66eoOs</span>
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
