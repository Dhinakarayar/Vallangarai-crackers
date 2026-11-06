import React, { useState } from 'react';
import { DELIVERABLE_FILES, generateAndDownloadProjectZip, CodeAssetFile } from '../services/sourceCodeAssets';
import {
  FolderCode,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  FileText,
  Boxes,
  Smartphone,
  Monitor,
  Database,
  CheckCircle2
} from 'lucide-react';

export const SourceCodeHubView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeAssetFile>(DELIVERABLE_FILES[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadProjectZip();
    } catch (e) {
      console.error(e);
      alert('Error creating ZIP file.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getFileIcon = (path: string) => {
    if (path.startsWith('desktop')) return <Monitor className="w-4 h-4 text-blue-400" />;
    if (path.startsWith('mobile')) return <Smartphone className="w-4 h-4 text-emerald-400" />;
    if (path.startsWith('database')) return <Database className="w-4 h-4 text-amber-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-5">
      {/* Hero Banner with ZIP Download Button */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Boxes className="w-3.5 h-3.5 text-indigo-400" />
              <span>Deliverables Hub & Source Code Center</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">100% Complete Project Source</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Desktop (.EXE) & Android (.APK) Source Code
          </h2>
          <p className="text-xs text-indigo-200/80 max-w-2xl mt-1">
            Browse, inspect, and download the full production codebases: Python (CustomTkinter) for Windows Desktop, Flutter for Android Mobile, SQLite database schema DDL, and build scripts.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs py-3 px-5 rounded-2xl flex items-center space-x-2 transition-all shadow-xl shadow-indigo-950/60 cursor-pointer shrink-0"
        >
          <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
          <span>{isDownloading ? 'Packaging Project ZIP...' : 'Download Complete Project ZIP'}</span>
        </button>
      </div>

      {/* Code Inspector Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Explorer Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col">
          <div className="px-3 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 mb-2">
            <span>Project Files ({DELIVERABLE_FILES.length})</span>
            <span className="text-[10px] text-slate-500 font-mono">ZIP Ready</span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[580px]">
            {DELIVERABLE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center space-x-2.5 transition-all ${
                    isSelected
                      ? 'bg-indigo-950/80 text-white border border-indigo-700/60 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="shrink-0">{getFileIcon(file.path)}</span>
                  <div className="truncate flex-1">
                    <div className="truncate font-mono">{file.path}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {file.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Build Cheatsheet */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 px-2">
            <div className="font-bold text-slate-300 flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Compilation Quick Commands:</span>
            </div>
            <div className="font-mono text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300 space-y-1">
              <div># Windows EXE:</div>
              <div className="text-amber-400">pip install -r requirements.txt</div>
              <div className="text-amber-400">pyinstaller --onefile main.py</div>
              <div className="pt-1"># Android APK:</div>
              <div className="text-emerald-400">flutter pub get</div>
              <div className="text-emerald-400">flutter build apk --release</div>
            </div>
          </div>
        </div>

        {/* Code Content Viewer (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {/* File Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span className="font-mono font-bold text-white text-xs">{selectedFile.path}</span>
              <span className="bg-slate-800 text-slate-400 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                {selectedFile.language}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Description bar */}
          <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-400">
            {selectedFile.description}
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 bg-slate-950 flex-1 overflow-x-auto max-h-[580px] font-mono text-[11px] leading-relaxed text-slate-300">
            <pre className="whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
