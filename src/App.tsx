/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileVideo, 
  Settings2, 
  RefreshCcw, 
  Download, 
  Video, 
  FileText,
  ChevronRight,
  Globe,
  Sliders,
  Type,
  Layout,
  Upload,
  Loader2,
  Undo2
} from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { SubtitleList } from './components/SubtitleList';
import { Subtitle, StyleConfig, DropShadowDepth } from './types';
import { ISO_LANGUAGES } from './constants';
import { generateSubtitles } from './services/gemini';
import { generateSRT, downloadFile, exportBurntInVideo } from './utils';

export default function App() {
  // State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [sourceLang, setSourceLang] = useState('en');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [originalSubtitles, setOriginalSubtitles] = useState<Subtitle[]>([]);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    fontSize: 24,
    dropShadow: 'medium',
  });
  const [syncOffset, setSyncOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'video/mp4' || file.name.endsWith('.mkv'))) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setSubtitles([]);
      setOriginalSubtitles([]);
      setSyncOffset(0);
    }
  };

  const handleGenerate = async () => {
    if (!videoFile) return;
    setIsGenerating(true);
    setGenProgress(0);
    try {
      const generated = await generateSubtitles(videoFile, sourceLang, (p) => setGenProgress(p));
      setSubtitles(generated);
      setOriginalSubtitles(generated);
    } catch (error) {
      alert("Failed to generate subtitles. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applySync = () => {
    const shifted = originalSubtitles.map(s => ({
      ...s,
      startTime: Math.max(0, s.startTime + syncOffset),
      endTime: Math.max(0, s.endTime + syncOffset)
    }));
    setSubtitles(shifted);
  };

  const resetSync = () => {
    setSyncOffset(0);
    setSubtitles(originalSubtitles);
  };

  const handleExportSRT = () => {
    const srt = generateSRT(subtitles);
    const fileName = videoFile?.name.replace(/\.[^/.]+$/, "") + ".srt";
    downloadFile(srt, fileName);
  };

  const handleExportVideo = async () => {
    const videoElement = document.querySelector('video');
    if (!videoElement || !videoFile) return;

    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await exportBurntInVideo(videoElement, subtitles, styleConfig, (p) => setExportProgress(p));
      const fileName = videoFile.name.replace(/\.[^/.]+$/, "") + "_trans.mp4";
      downloadFile(blob, fileName);
    } catch (error) {
      alert("Failed to export video.");
    } finally {
      setIsExporting(false);
      setShowExportOptions(false);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-slate-925 text-slate-50 font-sans flex flex-col overflow-hidden p-1">
      {/* Header */}
      <header className="h-8 bg-slate-900 border border-slate-700 rounded-t flex items-center justify-between px-3 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center font-bold text-[9px] text-black">
            <Video size={10} />
          </div>
          <h1 className="text-[9px] font-bold tracking-tight uppercase text-slate-100">SUBTITLE PRO</h1>
          <span className="text-[8px] bg-slate-800 text-slate-200 px-1 py-0.5 rounded border border-slate-600 ml-1 uppercase font-bold tracking-tighter">FLASH AI</span>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="bg-slate-700 hover:bg-slate-600 text-[9px] text-white font-bold uppercase px-2 py-0.5 rounded border border-slate-500 flex items-center gap-2 transition-colors"
          >
            {isExporting ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
            <span>Export</span>
          </button>

          <AnimatePresence>
            {showExportOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-slate-850 border border-slate-600 rounded shadow-2xl z-50 p-1 overflow-hidden"
              >
                <button 
                  onClick={handleExportVideo}
                  disabled={isExporting}
                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-slate-700 rounded transition-colors text-slate-100"
                >
                  <Video size={14} className="text-yellow-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase">Burnt-in Video</span>
                    <span className="text-[9px] text-slate-400">Permanent subtitles (.mp4)</span>
                  </div>
                </button>
                <button 
                  onClick={handleExportSRT}
                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-slate-700 rounded transition-colors text-slate-100"
                >
                  <FileText size={14} className="text-yellow-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase">SRT Export</span>
                    <span className="text-[9px] text-slate-400">SubRip file (.srt)</span>
                  </div>
                </button>
                
                {isExporting && (
                  <div className="px-2 py-1 border-t border-slate-700 mt-1">
                    <div className="text-[9px] text-slate-300 mb-1 flex justify-between font-bold">
                      <span>RENDERING...</span>
                      <span>{exportProgress}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Unified Sidebar */}
        <aside className="w-[190px] bg-slate-850 border border-slate-700 p-2.5 flex flex-col gap-4 shrink-0 z-10 overflow-y-auto custom-scrollbar rounded-bl">
          {/* Source Section */}
          <section className="space-y-2">
            <label className="text-[8px] uppercase font-black text-slate-200 block tracking-wider opacity-70">Source Media</label>
            <div className="relative">
              <input
                type="file"
                accept="video/mp4,.mkv"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
              />
              <label 
                htmlFor="video-upload"
                className="block border border-dashed border-slate-500 rounded p-2 text-center cursor-pointer hover:border-yellow-500 bg-slate-900/50 transition-all group"
              >
                {videoFile ? (
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-50 font-medium truncate">{videoFile.name}</p>
                    <span className="text-[7px] text-slate-400 font-mono">{(videoFile.size / (1024 * 1024)).toFixed(1)}MB</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload size={12} className="mx-auto text-slate-300 group-hover:text-yellow-400" />
                    <p className="text-[8px] text-slate-300 font-bold uppercase tracking-tight">Load Video</p>
                  </div>
                )}
              </label>
            </div>
          </section>

          {/* Language Section */}
          <section className="space-y-1.5">
            <label className="text-[8px] uppercase font-black text-slate-200 block tracking-wider opacity-70">Language</label>
            <div className="relative">
              <Globe size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-[9px] rounded p-1.5 pl-6 appearance-none outline-none focus:border-yellow-500 transition-colors cursor-pointer text-slate-100"
              >
                {ISO_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.code.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Styling Section */}
          <section className="space-y-3 pt-1 border-t border-slate-700/50">
            <label className="text-[8px] uppercase font-black text-slate-200 block tracking-wider opacity-70">Styling</label>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <span className="text-[8px] text-slate-200 font-bold uppercase">Size</span>
                <span className="text-[8px] font-mono text-yellow-400 font-black">{styleConfig.fontSize}</span>
              </div>
              <div className="px-0.5 pb-2">
                <input
                  type="range"
                  min={12}
                  max={64}
                  value={styleConfig.fontSize}
                  onChange={(e) => setStyleConfig({ ...styleConfig, fontSize: parseInt(e.target.value) })}
                  className="w-full accent-yellow-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer border border-slate-700/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="grid grid-cols-4 gap-1">
                {(['none', 'small', 'medium', 'large'] as DropShadowDepth[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setStyleConfig({ ...styleConfig, dropShadow: level })}
                    className={`py-1 text-[6.5px] font-black uppercase rounded border transition-all ${
                      styleConfig.dropShadow === level 
                      ? 'bg-yellow-500 border-yellow-400 text-black' 
                      : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Sync Section */}
          <section className="space-y-2 pt-1 border-t border-slate-700/50">
            <label className="text-[8px] uppercase font-black text-slate-200 block tracking-wider opacity-70">Sync</label>
            <div className="bg-slate-900 p-2 rounded border border-slate-600">
              <div className={`text-center text-xs font-mono mb-1 font-black ${syncOffset === 0 ? 'text-slate-400' : syncOffset > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {syncOffset > 0 ? '+' : ''}{syncOffset.toFixed(1)}s
              </div>
              
              <div className="relative h-5 flex flex-col justify-center px-1 mb-1.5">
                <div className="absolute inset-x-1 flex justify-between items-center h-full pointer-events-none px-0.5">
                  {Array.from({ length: 41 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`bg-slate-600 ${i % 10 === 0 ? 'h-4 w-[1px]' : i % 5 === 0 ? 'h-3 w-[0.5px]' : 'h-2 w-[0.5px]'}`}
                    />
                  ))}
                </div>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  step={0.1}
                  value={syncOffset}
                  onChange={(e) => setSyncOffset(parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 h-1 bg-transparent rounded-full appearance-none cursor-pointer relative z-10"
                />
              </div>

              <div className="flex gap-1.5 mt-2">
                <button 
                  onClick={applySync}
                  className="w-[70%] bg-slate-800 hover:bg-slate-700 text-slate-100 text-[8px] font-black uppercase py-2 rounded border border-slate-600 transition-all active:scale-95 tracking-widest"
                >
                  Sync Subs
                </button>
                <button 
                  onClick={resetSync}
                  className="w-[30%] bg-slate-900 hover:bg-slate-800 text-yellow-400 text-[8px] font-black uppercase py-2 rounded border border-slate-600 transition-all active:scale-95 tracking-widest"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="mt-auto pt-4 border-t border-slate-700">
            <button
              onClick={handleGenerate}
              disabled={!videoFile || isGenerating}
              className={`w-full py-3.5 rounded font-black text-[10px] uppercase tracking-widest relative overflow-hidden flex flex-col items-center justify-center transition-all ${
                isGenerating || !videoFile 
                ? 'bg-slate-800 text-slate-600 border border-slate-700' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="z-10 flex items-center gap-1.5">
                    <Loader2 size={10} className="animate-spin text-black" />
                    {genProgress}%
                  </span>
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-black/40 transition-all duration-300"
                    style={{ width: `${genProgress}%` }}
                  />
                </>
              ) : (
                <span className="z-10 flex items-center gap-1.5">
                  <RefreshCcw size={10} />
                  Generate
                </span>
              )}
            </button>
            <div className="mt-1 text-center">
              <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest opacity-60">
                GEMINI 1.5 FLASH
              </p>
            </div>
          </div>
        </aside>

        {/* Display Area: Video & Subtitles */}
        <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
          <div className="flex-1 flex flex-col p-1.5 gap-2 overflow-hidden max-w-5xl mx-auto w-full">
            {/* Player Container */}
            <div className="relative shrink flex items-center justify-center bg-black rounded border border-slate-700 shadow-2xl overflow-hidden aspect-video max-h-[45%] w-full">
              {videoSrc ? (
                <VideoPlayer
                  src={videoSrc}
                  subtitles={subtitles}
                  style={styleConfig}
                  onTimeUpdate={setCurrentTime}
                  onDurationChange={setDuration}
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-500">
                  <FileVideo size={20} className="opacity-40" />
                  <p className="text-[8px] font-mono font-black tracking-[0.4em] opacity-60 uppercase text-slate-300">Signal Missing</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            {videoSrc && (
              <div className="flex justify-center gap-4 text-slate-400 font-mono text-[7px] font-black uppercase tracking-[0.2em] shrink-0">
                <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-600 text-yellow-500">SPACE</kbd> PLAY</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-600 text-yellow-500">←/→</kbd> SEEK</span>
              </div>
            )}

            {/* Subtitle Inspector */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900/20 border border-slate-700/50 rounded-t-lg overflow-hidden shadow-2xl">
              <div className="bg-slate-850 px-2.5 py-1 border-b border-slate-700 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <label className="text-[8px] uppercase font-black text-slate-100 tracking-widest">Subtitle Stream</label>
                  <span className="bg-yellow-500 text-black text-[7px] font-black px-1 rounded uppercase tracking-tighter">Live</span>
                </div>
                <div className="text-[7px] font-mono text-yellow-500 font-black uppercase tracking-widest">{subtitles.length} Events</div>
              </div>
              <div className="flex-1 h-full overflow-hidden relative">
                <SubtitleList 
                  subtitles={subtitles}
                  currentTime={currentTime}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #eab308;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 0 8px rgba(234,179,8,0.4);
        }
        input[type="range"]:hover::-webkit-slider-thumb {
          background: #fde047;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

