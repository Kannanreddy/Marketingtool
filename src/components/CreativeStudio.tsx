import { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Calendar, 
  QrCode, 
  Sliders, 
  Eye, 
  RefreshCw,
  Sparkles,
  Send,
  MessageSquare,
  Share2
} from 'lucide-react';
import { Product, StoreSettings, BannerConfig, BannerAspectRatio } from '../types';
import { PALETTES, STYLES, THEMES, PATTERNS } from '../data/initialData';
import { renderBannerToCanvas } from '../utils/bannerRenderer';

interface CreativeStudioProps {
  products: Product[];
  selectedSku: string;
  onSelectSku: (sku: string) => void;
  settings: StoreSettings;
  onSchedulePost: (item: {
    sku: string;
    productName: string;
    caption: string;
    aspectRatio: BannerAspectRatio;
    style: string;
    palette: string;
  }) => void;
}

export default function CreativeStudio({
  products,
  selectedSku,
  onSelectSku,
  settings,
  onSchedulePost
}: CreativeStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeProduct = products.find(p => p.SKU === selectedSku) || products[0] || null;

  const [config, setConfig] = useState<BannerConfig>({
    aspectRatio: '1:1',
    style: 'automotive',
    palette: 'emerald',
    theme: 'performance',
    pattern: 'grid',
    showQrCode: true,
    showContactBar: true,
    badgeText: '100% GENUINE CERTIFIED 🛡️'
  });

  const orderUrl = activeProduct ? `${window.location.origin}/?p=${activeProduct.SKU}` : window.location.origin;

  // Re-render banner on state changes
  useEffect(() => {
    if (!canvasRef.current || !activeProduct) return;
    renderBannerToCanvas(canvasRef.current, activeProduct, settings, config, orderUrl);
  }, [activeProduct, config, settings, orderUrl]);

  // Generate marketing caption
  const generateCaption = () => {
    if (!activeProduct) return '';
    const themeObj = THEMES.find(t => t.id === config.theme);
    const themeName = themeObj ? themeObj.name : 'Exclusive Offer';

    return `🔥 ${themeName} | ${activeProduct.Name}
💰 Special Offer: ${activeProduct.DiscountPrice} (M.R.P: ${activeProduct.Price})
⚡ Viscosity: ${activeProduct.viscosity || '20W-40'} | Pack Size: ${activeProduct.size || '1L'}
🛡️ 100% Genuine Certified Lubricant | Smooth Clutch & Extreme Engine Protection

📦 Cash on Delivery & Fast Express Doorstep Delivery Across India!

👉 Place your order directly on our private portal:
${orderUrl}

💬 Need assistance or bulk orders? WhatsApp us at: https://wa.me/${settings.WhatsAppNumber}?text=${encodeURIComponent(`Hi, I want to order ${activeProduct.Name}`)}

#${(activeProduct.viscosity || 'engineoil').replace(/[^a-zA-Z0-9]/g, '')} #RaceolLubricants #BikeMaintenance #AutomotiveCare #EngineOil #MotorcycleLife`;
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current || !activeProduct) return;
    const a = document.createElement('a');
    a.download = `${activeProduct.SKU}_${config.aspectRatio.replace(':', 'x')}_banner.png`;
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyOrderLink = () => {
    navigator.clipboard.writeText(orderUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    if (!activeProduct) return;
    const caption = generateCaption();
    const encodedCaption = encodeURIComponent(caption);
    const encodedUrl = encodeURIComponent(orderUrl);

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedCaption}`;
        break;
      case 'whatsapp_status':
        url = `https://api.whatsapp.com/send?text=${encodedCaption}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedCaption}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedCaption}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedCaption}`;
        break;
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedCaption}`;
        break;
      case 'reddit':
        url = `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(activeProduct.Name)}`;
        break;
      case 'threads':
        url = `https://threads.net/intent/post?text=${encodedCaption}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(activeProduct.Name)}&body=${encodedCaption}`;
        break;
      default:
        handleCopyCaption();
        alert(`Caption copied to clipboard! Opening ${platform}...`);
        url = `https://${platform}.com`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleScheduleClick = () => {
    if (!activeProduct) return;
    onSchedulePost({
      sku: activeProduct.SKU,
      productName: activeProduct.Name,
      caption: generateCaption(),
      aspectRatio: config.aspectRatio,
      style: config.style,
      palette: config.palette
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Column 1: Controls (4 cols on lg) */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-800" />
              <span>Banner Design Controls</span>
            </h3>
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {config.aspectRatio}
            </span>
          </div>

          {/* Product Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Feature Product</label>
            <select
              id="studioProductSelect"
              value={selectedSku}
              onChange={(e) => onSelectSku(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
            >
              {products.map(p => (
                <option key={p.SKU} value={p.SKU}>
                  {p.Name} ({p.SKU}) - {p.DiscountPrice}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Format & Dimension</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '1:1', label: '1:1 Square', sub: 'IG / WhatsApp' },
                { id: '9:16', label: '9:16 Story', sub: 'Reels / Status' },
                { id: '16:9', label: '16:9 Wide', sub: 'FB / Twitter' },
                { id: '4:5', label: '4:5 Portrait', sub: 'High Impact' },
                { id: 'A4', label: 'A4 Print', sub: 'Flyer / PDF' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setConfig({ ...config, aspectRatio: r.id as BannerAspectRatio })}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    config.aspectRatio === r.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{r.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Palette (20+) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Color Palette (20+)</label>
            <select
              value={config.palette}
              onChange={(e) => setConfig({ ...config, palette: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
            >
              {Object.entries(PALETTES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Style & Theme (20+) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Style (20+)</label>
              <select
                value={config.style}
                onChange={(e) => setConfig({ ...config, style: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
              >
                {STYLES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Promo Theme (20+)</label>
              <select
                value={config.theme}
                onChange={(e) => {
                  const themeItem = THEMES.find(t => t.id === e.target.value);
                  setConfig({ 
                    ...config, 
                    theme: e.target.value,
                    badgeText: themeItem ? themeItem.name : config.badgeText
                  });
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
              >
                {THEMES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pattern (20+) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Background Pattern (20+)</label>
            <select
              value={config.pattern}
              onChange={(e) => setConfig({ ...config, pattern: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
            >
              {PATTERNS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.showQrCode}
                onChange={(e) => setConfig({ ...config, showQrCode: e.target.checked })}
                className="rounded text-emerald-800 focus:ring-emerald-500"
              />
              <span>Include Dynamic Order QR</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.showContactBar}
                onChange={(e) => setConfig({ ...config, showContactBar: e.target.checked })}
                className="rounded text-emerald-800 focus:ring-emerald-500"
              />
              <span>WhatsApp Contact Bar</span>
            </label>
          </div>

          {/* Main Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              id="btnDownloadBannerPNG"
              onClick={handleDownloadPNG}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>

            <button
              id="btnScheduleThisPost"
              onClick={handleScheduleClick}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Schedule in Marketing Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Column 2: Live Canvas Stage (5 cols on lg) */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col items-center justify-center shadow-lg relative min-h-[500px]">
          <div className="absolute top-3 left-4 text-xs font-mono text-emerald-400/80 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Interactive Banner Preview</span>
          </div>

          <div className="max-w-full max-h-[520px] overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              id="studioCanvas"
              className="max-h-[480px] max-w-full rounded-lg shadow-2xl border border-white/10"
            />
          </div>

          <div className="mt-4 text-center">
            <div className="text-xs text-slate-300 font-medium">
              Links to: <span className="font-mono text-amber-400">{orderUrl}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              QR Code automatically links customer directly to this product's private order page.
            </p>
          </div>
        </div>
      </div>

      {/* Column 3: 20+ Social Hub & Captions (3 cols on lg) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export to Channels</span>
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              20+ Platforms
            </span>
          </div>

          {/* Quick Caption Copy */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-semibold">Auto-Generated Caption</span>
              <button
                onClick={handleCopyCaption}
                className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={generateCaption()}
              className="w-full p-2.5 text-[11px] font-sans bg-slate-50 border border-slate-200 rounded-lg text-slate-700 resize-none outline-none leading-relaxed"
            />
          </div>

          {/* Social Channels Buttons Grid */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            <button
              onClick={() => handleSocialShare('whatsapp')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-semibold text-xs transition-colors"
            >
              <span>WhatsApp Chat</span>
              <Send className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('whatsapp_status')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#128C7E]/10 text-[#0d6157] hover:bg-[#128C7E]/20 font-semibold text-xs transition-colors"
            >
              <span>WhatsApp Status</span>
              <MessageSquare className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('facebook')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 font-semibold text-xs transition-colors"
            >
              <span>Facebook Feed & Groups</span>
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('instagram')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-600 hover:from-purple-500/20 hover:to-pink-500/20 font-semibold text-xs transition-colors"
            >
              <span>Instagram Post / Story</span>
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('twitter')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 font-semibold text-xs transition-colors"
            >
              <span>X (Twitter) Broadcast</span>
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('telegram')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#229ED9]/10 text-[#1b7fae] hover:bg-[#229ED9]/20 font-semibold text-xs transition-colors"
            >
              <span>Telegram Channel</span>
              <Send className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('linkedin')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 font-semibold text-xs transition-colors"
            >
              <span>LinkedIn Business</span>
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('pinterest')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#BD081C]/10 text-[#BD081C] hover:bg-[#BD081C]/20 font-semibold text-xs transition-colors"
            >
              <span>Pinterest Pin</span>
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('threads')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/10 text-slate-800 hover:bg-slate-800/20 font-semibold text-xs transition-colors"
            >
              <span>Threads</span>
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('reddit')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20 font-semibold text-xs transition-colors"
            >
              <span>Reddit Communities</span>
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleSocialShare('email')}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-200/60 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
            >
              <span>Email Newsletter</span>
              <Share2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
