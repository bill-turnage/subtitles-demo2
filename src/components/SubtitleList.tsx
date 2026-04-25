/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Subtitle } from '../types';
import { formatTime } from '../utils';

interface SubtitleListProps {
  subtitles: Subtitle[];
  currentTime: number;
}

export const SubtitleList: React.FC<SubtitleListProps> = ({ subtitles, currentTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIndex = subtitles.findIndex(s => currentTime >= s.startTime && currentTime <= s.endTime);
    if (activeIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, subtitles]);

  return (
    <div 
      ref={containerRef}
      className="bg-slate-950 h-full overflow-y-auto custom-scrollbar"
    >
      {subtitles.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-500 italic text-[11px] font-mono tracking-tighter">
          [ WAITING FOR TRANSLATION ENGINE ]
        </div>
      ) : (
        subtitles.map((sub, index) => {
          const isActive = currentTime >= sub.startTime && currentTime <= sub.endTime;
          return (
            <div 
              key={sub.id}
              className={`px-4 py-3 border-l-2 flex gap-3 transition-all ${
                isActive 
                ? 'bg-yellow-500/10 border-yellow-500' 
                : 'border-transparent opacity-60 hover:opacity-100 hover:bg-slate-900/80'
              }`}
            >
              <div className={`font-mono text-[10px] w-12 pt-0.5 flex-shrink-0 ${isActive ? 'text-yellow-400 font-black' : 'text-amber-500 font-bold'}`}>
                {formatTime(sub.startTime)}
              </div>
              <div className={`text-[12px] leading-relaxed tracking-tight ${isActive ? 'text-white font-bold' : 'text-slate-200'}`}>
                {sub.text}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

};
