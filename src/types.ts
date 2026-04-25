/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subtitle {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

export type DropShadowDepth = 'none' | 'small' | 'medium' | 'large';

export interface StyleConfig {
  fontSize: number;
  dropShadow: DropShadowDepth;
}

export interface VideoMetadata {
  name: string;
  duration: number;
}
