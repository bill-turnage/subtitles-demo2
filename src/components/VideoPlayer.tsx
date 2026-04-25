/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Subtitle, StyleConfig } from '../types';
import { formatTime } from '../utils';
import { DROP_SHADOW_STYLES } from '../constants';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  subtitles: Subtitle[];
  style: StyleConfig;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  subtitles,
  style,
  onTimeUpdate,
  onDurationChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime -= 10;
          break;
        case 'ArrowRight':
          videoRef.current.currentTime += 10;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      onDurationChange(dur);
    }
  };

  const activeSubtitle = subtitles.find(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  const shadowStyle = DROP_SHADOW_STYLES[style.dropShadow];

  return (
    <div className="relative group bg-black w-full h-full flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="max-w-full max-h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Subtitle Overlay */}
      {activeSubtitle && (
        <div 
          className="absolute bottom-[10%] left-0 right-0 text-center px-8 pointer-events-none transition-all duration-200 select-none"
          style={{
            fontSize: `${style.fontSize}px`,
            color: '#ffffff',
            fontWeight: 700,
            textShadow: shadowStyle !== 'none' ? `${shadowStyle}, 0 0 8px rgba(0,0,0,0.8)` : '0 0 8px rgba(0,0,0,0.8)',
            WebkitTextStroke: '1.5px black',
            lineHeight: 1.2,
          }}
        >
          <span className="bg-black/20 px-4 py-1 rounded backdrop-blur-[2px]">
            {activeSubtitle.text}
          </span>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end pointer-events-none p-3">
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded p-2 flex flex-col gap-1.5 pointer-events-auto shadow-2xl">
          {/* Progress Bar */}
          <div className="relative h-1 w-full bg-slate-600 rounded-full overflow-hidden group/progress cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = parseFloat(e.target.value);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-75"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-yellow-400 min-w-[32px] font-black">
                {formatTime(currentTime)}
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                  className="text-slate-200 hover:text-yellow-400 transition-colors p-1"
                  title="Back 10s"
                >
                  <RotateCcw size={14} />
                </button>
                <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform p-1">
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
                <button 
                  onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                  className="text-slate-200 hover:text-yellow-400 transition-colors p-1"
                  title="Forward 10s"
                >
                  <RotateCw size={14} />
                </button>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-300 font-bold" title="Remaining">
              -{formatTime(duration - currentTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};
