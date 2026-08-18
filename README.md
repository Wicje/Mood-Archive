# Mood Archive ── Personal Aesthetic & Vibe Vault ✨

> Distraction-free aesthetic reference archive. Tag images by emotion & aesthetic, extract dynamic color palettes, calculate AI visual similarity vectors, and curate reference moodboards by vibe.

![Mood Archive](https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Multi-Dimensional Tagging**: Categorize references by **Emotion** (*Cyber-noir*, *Nostalgic*, *Serene*, *Melancholic*, *Euphoric*, *Cozy*, *Solitude*, *Wanderlust*, *Ethereal*, *Anxious*) and **Aesthetic** (*Cyberpunk*, *Dark Academia*, *Cottagecore*, *Minimalist*, *Film Grain*, *Wabi-Sabi*, *Vaporwave*, *Brutalist*, *Surrealism*).
- **Vibe Palette Studio**: Extract 5-color palettes live from photography using client-side HTML5 Canvas pixel quantization. Export tokens to **CSS Variables**, **Tailwind CSS**, and **Figma Tokens JSON**.
- **Interactive Freeform Moodboard Canvas**: Drag, scale, rotate (-15° to +15° slants), layer z-depth, and attach sticky text notes on a freeform composition canvas.
- **AI Visual Vector Engine**: Compute lighting warmth vectors ($\text{Warmth} = \frac{R + 0.5G - B}{255}$), luminance, and Euclidean vector distance matching for instant visual recommendations.
- **Pinterest & Web Bulk Importer**: Paste image links or board URLs to batch import photos into your local vault with auto-palette extraction.
- **Procedural Soundscape Synthesizer**: Web Audio API ambient audio generator featuring 5 procedural soundscapes (*Midnight Rain*, *Vinyl Warmth*, *Deep Space Drone*, *Twilight Ocean*, *Hearth Fire*).
- **Global i18n Localization**: Built-in translation support for 6 languages: English, Japanese (日本語), French (Français), German (Deutsch), Spanish (Español), and Korean (한국어).
- **Offline & Local-First**: Powered by **IndexedDB (`MoodArchiveDB`)** and LocalStorage for high-capacity local photo storage without server limits.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
# Clone repository
git clone https://github.com/Wicje/Mood-Archive.git
cd Mood-Archive

# Install dependencies
npm install

# Launch local development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Build Production Bundle

```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS + Google Fonts (*Cormorant Garamond*, *Plus Jakarta Sans*)
- **Icons**: Lucide React
- **Color Quantization**: HTML5 Canvas + Colord
- **Audio Synthesis**: Web Audio API (Native procedural noise oscillators)
- **Local Persistence**: IndexedDB + LocalStorage

---

## 📄 License

MIT License © 2026 Mood Archive Team. Free & Open Source.
