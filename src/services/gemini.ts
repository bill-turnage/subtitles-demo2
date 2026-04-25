/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Subtitle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateSubtitles(
  file: File,
  sourceLang: string,
  onProgress: (progress: number) => void
): Promise<Subtitle[]> {
  try {
    onProgress(10);
    
    // For transcription, we can send the file directly if it's not too huge.
    // Given the constraints and typical use, we'll convert to base64.
    const base64Data = await fileToBase64(file);
    onProgress(30);

    const prompt = `
      Transcribe and translate the following video audio from ${sourceLang} to English.
      Return the result as a JSON array of objects with the following structure:
      [{ "startTime": number, "endTime": number, "text": "string" }]
      Ensure the timings are accurate to the speech in the video.
      The text should be natural-sounding English subtitles.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: file.type, data: base64Data } }
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    onProgress(90);
    const result = JSON.parse(response.text || "[]") as any[];
    
    onProgress(100);
    return result.map((s, i) => ({
      ...s,
      id: `sub-${i}`
    }));
  } catch (error) {
    console.error("Error generating subtitles:", error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
