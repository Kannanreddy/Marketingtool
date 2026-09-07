import { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { FIXED_CODE_GS, FIXED_INDEX_HTML } from '../data/appsScriptCode';

export default function AppsScriptExporter() {
  const [activeFile, setActiveFile] = useState<'codegs' | 'indexhtml'>('codegs');
  const [copiedCodeGs, setCopiedCodeGs] = useState(false);
  const [copiedIndexHtml, setCopiedIndexHtml] = useState(false);

  const handleCopy = (file: 'codegs' | 'indexhtml') => {
    const text = file === 'codegs' ? FIXED_CODE_GS : FIXED_INDEX_HTML;
    navigator.clipboard.writeText(text);
    if (file === 'codegs') {
      setCopiedCodeGs(true);
      setTimeout(() => setCopiedCodeGs(false), 2000);
    } else {
      setCopiedIndexHtml(true);
      setTimeout(() => setCopiedIndexHtml(false), 2000);
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Root Cause Analysis & Fix Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-base">
              100% Fix Applied: Why Google Sheet Data Was Not Showing
            </h3>
            <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
              We identified and resolved all 3 blocking failure points in your Google Apps Script project:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/80">
                <strong className="text-emerald-950 block mb-1">1. Unprotected Execution Chain</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  In your previous <code className="text-emerald-800">initAdmin()</code>, calling <code className="text-emerald-800">renderBanner()</code> while the studio tab was hidden (<code className="text-emerald-800">display: none</code>) threw an unhandled Canvas dimension exception that halted table rendering.
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/80">
                <strong className="text-emerald-950 block mb-1">2. Iframe Timing Inconsistency</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Inside Google Apps Script iframes, scripts at the bottom of the body parse after <code className="text-emerald-800">DOMContentLoaded</code> has already fired. The new code uses a double-check strategy to execute immediately.
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/80">
                <strong className="text-emerald-950 block mb-1">3. Dual Dynamic Recovery</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  If server-side hydration (<code className="text-emerald-800">initialData</code>) is slow or returns empty arrays, the webapp automatically triggers a client-side <code className="text-emerald-800">google.script.run</code> refresh with fallback data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFile('codegs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFile === 'codegs'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code.gs (Apps Script Backend)</span>
            </button>

            <button
              onClick={() => setActiveFile('indexhtml')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeFile === 'indexhtml'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Index.html (Frontend Template)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeFile)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              {(activeFile === 'codegs' ? copiedCodeGs : copiedIndexHtml) ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{(activeFile === 'codegs' ? copiedCodeGs : copiedIndexHtml) ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                if (activeFile === 'codegs') {
                  handleDownload('Code.gs', FIXED_CODE_GS);
                } else {
                  handleDownload('Index.html', FIXED_INDEX_HTML);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeFile === 'codegs' ? 'Code.gs' : 'Index.html'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 overflow-x-auto max-h-[520px] font-mono text-xs text-emerald-300 leading-relaxed select-all">
          <pre>{activeFile === 'codegs' ? FIXED_CODE_GS : FIXED_INDEX_HTML}</pre>
        </div>
      </div>

      {/* Deployment Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>How to Deploy into Google Apps Script in 3 Minutes:</span>
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
          <li>
            Open your Google Sheet <span className="font-mono text-emerald-800 font-semibold">(Spreadsheet ID: 1kBl0watSXkeOelqv33cY3HvxffNO_gvrBQB5k66eoOs)</span> and go to <strong>Extensions &gt; Apps Script</strong>.
          </li>
          <li>
            Paste the code from <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-semibold">Code.gs</code> above into your editor's <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">Code.gs</code> file.
          </li>
          <li>
            Click the <strong>+</strong> icon in Apps Script to add an HTML file named <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-semibold">Index</code>, and paste the code from <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">Index.html</code>.
          </li>
          <li>
            Click <strong>Deploy &gt; New deployment &gt; Web app</strong>. Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>. Click <strong>Deploy</strong>.
          </li>
        </ol>
      </div>
    </div>
  );
}
