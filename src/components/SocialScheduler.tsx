import { useState, FormEvent } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Download, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  Bot
} from 'lucide-react';
import { ScheduleItem, Product, StoreSettings } from '../types';

interface SocialSchedulerProps {
  schedule: ScheduleItem[];
  onAddSchedule: (item: ScheduleItem) => void;
  onUpdateStatus: (id: string, status: 'Scheduled' | 'Queued' | 'Published') => void;
  onDeleteSchedule: (id: string) => void;
  onBulkAutoSchedule: () => void;
  products: Product[];
  settings: StoreSettings;
}

export default function SocialScheduler({
  schedule,
  onAddSchedule,
  onUpdateStatus,
  onDeleteSchedule,
  onBulkAutoSchedule,
  products,
  settings
}: SocialSchedulerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState(products[0]?.SKU || '');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [timeSlot, setTimeSlot] = useState('08:30 AM');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['whatsapp', 'instagram']);
  const [caption, setCaption] = useState('');

  const handleOpenAdd = () => {
    const prod = products.find(p => p.SKU === selectedSku) || products[0];
    if (prod) {
      setCaption(`🔥 Exclusive Deal on ${prod.Name}! Special offer price ${prod.DiscountPrice}. Order direct: ${window.location.origin}/?p=${prod.SKU}`);
    }
    setModalOpen(true);
  };

  const handleProductChange = (sku: string) => {
    setSelectedSku(sku);
    const prod = products.find(p => p.SKU === sku);
    if (prod) {
      setCaption(`🔥 Exclusive Deal on ${prod.Name}! Special offer price ${prod.DiscountPrice}. Order direct: ${window.location.origin}/?p=${prod.SKU}`);
    }
  };

  const toggleChannel = (ch: string) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter(c => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.SKU === selectedSku) || products[0];
    if (!prod) return;

    const newItem: ScheduleItem = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      sku: prod.SKU,
      productName: prod.Name,
      title: `${prod.Name} - ${timeSlot} Drop`,
      scheduledDate,
      scheduledTime: timeSlot,
      channels: selectedChannels.length > 0 ? selectedChannels : ['whatsapp'],
      status: 'Scheduled',
      caption,
      aspectRatio: '1:1',
      style: 'automotive',
      palette: 'emerald'
    };

    onAddSchedule(newItem);
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ScheduleID', 'SKU', 'ProductName', 'Date', 'Time', 'Channels', 'Status', 'Caption'];
    const rows = schedule.map(s => [
      `"${s.id}"`,
      `"${s.sku}"`,
      `"${s.productName.replace(/"/g, '""')}"`,
      `"${s.scheduledDate}"`,
      `"${s.scheduledTime}"`,
      `"${s.channels.join(';')}"`,
      `"${s.status}"`,
      `"${s.caption.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `raceol_schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Automated Social Media Pipeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-schedule and stagger product banners across WhatsApp Status, Instagram, Facebook, and Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBulkAutoSchedule}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors shadow-xs"
            title="Auto-generate 7-day marketing calendar for catalog"
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>Auto-Fill 7-Day Queue</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Schedule</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Schedule Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((item) => {
          const isPublished = item.status === 'Published';
          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                isPublished ? 'border-slate-200 opacity-80' : 'border-emerald-200/80 ring-1 ring-emerald-500/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">{item.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isPublished 
                      ? 'bg-slate-100 text-slate-600' 
                      : item.status === 'Queued'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.productName}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-3">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.scheduledDate} at {item.scheduledTime}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 line-clamp-3 mb-3">
                  {item.caption}
                </div>

                {/* Target Channels */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.channels.map(ch => (
                    <span
                      key={ch}
                      className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md uppercase"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onDeleteSchedule(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Remove from schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  {!isPublished ? (
                    <button
                      onClick={() => {
                        // Simulate dispatch
                        navigator.clipboard.writeText(item.caption);
                        alert(`Post dispatched! Marketing caption copied to clipboard.`);
                        onUpdateStatus(item.id, 'Published');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch Now</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Published</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-emerald-700" />
                <span>Schedule Marketing Post</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  value={selectedSku}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {products.map(p => (
                    <option key={p.SKU} value={p.SKU}>
                      {p.Name} ({p.SKU})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option value="08:30 AM">Morning Commute (08:30 AM)</option>
                    <option value="01:30 PM">Afternoon Fleet (01:30 PM)</option>
                    <option value="07:30 PM">Prime Evening (07:30 PM)</option>
                    <option value="10:00 PM">Late Night Drop (10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  {['whatsapp', 'instagram', 'facebook', 'telegram', 'twitter', 'linkedin'].map(ch => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`p-2 rounded-lg text-xs font-semibold border capitalize transition-all ${
                        selectedChannels.includes(ch)
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Post Caption & Order Link</label>
                <textarea
                  rows={3}
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
