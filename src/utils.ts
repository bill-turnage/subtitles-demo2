/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subtitle, StyleConfig } from "./types";
import { DROP_SHADOW_STYLES } from "./constants";

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateSRT(subtitles: Subtitle[]): string {
  return subtitles
    .map((sub, index) => {
      const start = formatSRTTime(sub.startTime);
      const end = formatSRTTime(sub.endTime);
      return `${index + 1}\n${start} --> ${end}\n${sub.text}\n`;
    })
    .join('\n');
}

function formatSRTTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function downloadFile(content: string | Blob, fileName: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: 'text/plain' }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Encodes video with burnt-in subtitles using Canvas and MediaRecorder.
 * Note: This is a client-side "recording" of the video.
 */
export async function exportBurntInVideo(
  videoElement: HTMLVideoElement,
  subtitles: Subtitle[],
  style: StyleConfig,
  onProgress: (progress: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const stream = canvas.captureStream(30); // 30 FPS
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);

  return new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));

    const duration = videoElement.duration;
    let currentTime = 0;
    const fps = 30;
    const interval = 1 / fps;

    videoElement.pause();
    videoElement.currentTime = 0;

    const recordFrame = () => {
      if (currentTime >= duration) {
        recorder.stop();
        return;
      }

      videoElement.currentTime = currentTime;
      
      // We need to wait for the seeked event usually, but for simplicity:
      videoElement.onseeked = () => {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Draw subtitles
        const activeSub = subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
        if (activeSub) {
          ctx.font = `${style.fontSize * (canvas.height / 720)}px Inter`; // Scale font size relative to 720p
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          
          const x = canvas.width / 2;
          const y = canvas.height - (canvas.height * 0.1);
          
          // Outline
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 4;
          ctx.strokeText(activeSub.text, x, y);
          
          // Shadow
          if (style.dropShadow !== 'none') {
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            const offset = style.dropShadow === 'small' ? 2 : style.dropShadow === 'medium' ? 4 : 6;
            ctx.shadowOffsetX = offset;
            ctx.shadowOffsetY = offset;
            ctx.shadowBlur = offset;
          }
          
          // Fill
          ctx.fillStyle = 'white';
          ctx.fillText(activeSub.text, x, y);
          
          // Reset shadow
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        }

        currentTime += interval;
        onProgress(Math.round((currentTime / duration) * 100));
        requestAnimationFrame(recordFrame);
      };
    };

    recorder.start();
    recordFrame();
  });
}
