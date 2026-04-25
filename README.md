# Subtitle Pro: AI-Powered Captioning Studio

Welcome to **Subtitle Pro**, a professional-grade, high-density video subtitling and translation suite. Designed for precision and speed, Subtitle Pro leverages the latest Gemini 1.5 Flash AI to provide near-instant transcription and translation, allowing creators to bridge language gaps with high-fidelity, burnt-in captioning.

---

## 1. Setup and Installation

### Prerequisites
- **Node.js**: Version 18.x or higher.
- **Package Manager**: npm or yarn.
- **Gemini API Key**: Requires a valid `GEMINI_API_KEY` in your environment variables.

### Installation Steps
1. **Clone the Repository** (or download the source):
   ```bash
   git clone <repository-url>
   cd subtitle-maker
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   *Key dependencies include: `react`, `framer-motion`, `lucide-react`, `@google/genai`, and `tailwindcss`.*

3. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## 2. Full Feature List & Configuration

### AI Transcription & Translation
- **Gemini 1.5 Flash Engine**: Ultra-fast audio analysis for accurate time-stamping.
- **Multilingual Support**: Choose from dozens of source languages (Spanish, French, Japanese, etc.) for automatic translation into English.
- **One-Click Generation**: Transform raw video into a timed subtitle stream in seconds.

### Professional Styling Studio
- **High-Density Interface**: Every pixel is optimized for productivity, featuring a compact, information-rich layout.
- **Text Scaling**: Fluid font size adjustment from 12px to 64px.
- **Shadow Depth Control**: Toggle between *None, Small, Medium, and Large* drop shadows to ensure readability against any background.
- **Real-Time Preview**: Styles apply instantly to the video player overlay.

### Precision Synchronization Tools
- **Global Shift**: Shift the entire subtitle track by ±20 seconds using a precision-tuned slider with micro-tick markers.
- **Interactive Transcript**: Clickable, auto-scrolling subtitle list that stays in sync with video playback.
- **Keyboard Shortcuts**: [Space] for Play/Pause and [←/→] for 10s seeking.

### Export Capabilities
- **SRT Export**: Download a standard `.srt` SideRip file for use in third-party players (VLC, YouTube).
- **Burnt-In Video**: (Experimental) Render the video with permanent, styled subtitles directly in the browser.

---

## 3. Change Log

### [v1.2.0] - current prompt cycle
- **Layout Overhaul**: Shrunk application height to fit within compact viewports.
- **Sidebar Compaction**: Redesigned left panel to be 20% narrower for better display focus.
- **Merged Controls**: Combined the synchronization slider and tick marks into a single row to save vertical space.
- **UI Scaling**: Adjusted all "dim" elements (sliders, ticks, secondary text) to be 25% brighter for improved legibility.
- **Style Fixes**: Updated font size slider to be fully visible with a circular thumb control.
- **Button Mapping**: Renamed 'Apply Timing Shift' to 'Sync Subs' and added a adjacent 'Reset' button (70/30 split).

### [v1.1.0]
- **Theme Shift**: Migrated from "Midnight" to a high-density "Slate & Yellow" theme.
- **Translation Engine**: Resolved API 400 errors by migrating to the stable `gemini-1.5-flash` model endpoint.
- **Burnt-In Styling**: Enhanced subtitle overlay with optional background blurs and high-contrast stroke.

### [v1.0.0]
- **Initial Release**: Basic transcription, SRT export, and video playback support.

---

*Developed with precision by the AI Coding Agent inside Google AI Studio.*
