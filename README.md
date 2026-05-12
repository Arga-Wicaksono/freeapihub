<div align="center">

<img src="https://raw.githubusercontent.com/Arga-Wicaksono/freeapihub/main/public/icon.svg" width="120" alt="API Hub Logo">

# Free API Hub

**The Developer's API Playground — Explore, test, and integrate 224 free public APIs directly from your browser.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-3ECF8E?style=for-the-badge&labelColor=0F0F0F)](https://free-api-hub.netlify.app)
[![GitHub Stars](https://img.shields.io/github/stars/Arga-Wicaksono/freeapihub?style=for-the-badge&label=Stars&labelColor=0F0F0F)](https://github.com/Arga-Wicaksono/freeapihub/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Arga-Wicaksono/freeapihub?style=for-the-badge&label=Forks&labelColor=0F0F0F)](https://github.com/Arga-Wicaksono/freeapihub/network/members)
[![License: MIT](https://img.shields.io/github/license/Arga-Wicaksono/freeapihub?style=for-the-badge&label=MIT&labelColor=0F0F0F)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs_Welcome-3ECF8E?style=for-the-badge&labelColor=0F0F0F)](https://github.com/Arga-Wicaksono/freeapihub/pulls)

[**Try it live**](https://free-api-hub.netlify.app) · [**Request an API**](https://github.com/Arga-Wicaksono/freeapihub/issues/new?labels=enhancement) · [**Report a Bug**](https://github.com/Arga-Wicaksono/freeapihub/issues/new)

<img src="https://raw.githubusercontent.com/Arga-Wicaksono/freeapihub/main/public/og-image.png" width="600" alt="API Hub Screenshot">

</div>

---

## Why API Hub?

Tired of hunting for free, working APIs across scattered lists and outdated directories? **API Hub** solves that problem. It's a single, beautifully designed interface where developers can **discover, test, and integrate** 224 hand-picked public APIs — no sign-up, no API keys, no setup required.

Every API in the catalog is verified: active endpoints, CORS-friendly, no authentication needed, and production-ready. Whether you're building a side project, prototyping an idea, or learning how REST APIs work, API Hub is your one-stop playground.

## Features

| Feature | Description |
|---------|-------------|
| **Guided Mode** | Curated Quick Picks for common use cases — no choice paralysis |
| **Explore All** | Full catalog with categories, search, auth, and rate limit filters |
| **AI Assistant** | Chat-based API discovery with code examples (cURL, JS, Python) |
| **Live Health Status** | Real-time uptime monitoring with green/red status indicators |
| **In-Browser Testing** | Send requests and inspect responses without leaving the page |
| **Smart Response Viewer** | JSON syntax highlight, image preview, video/audio, CSV table, HTML, XML |
| **Docs Button** | Official documentation link on every API card |
| **Favorites** | Save your most-used APIs with local storage persistence |
| **One-Click Copy** | Copy JSON responses or cURL commands with a single click |
| **CORS Proxy** | Built-in proxy selector for cross-origin requests |
| **Dark / Light Mode** | System-aware theme with manual toggle |
| **Keyboard Shortcuts** | `T` to test, `Esc` to close |
| **Machine-Readable Catalog** | `/apis.json` endpoint for AI agents and integrations |
| **PWA Ready** | Installable as a native app |
| **Submit APIs** | Community-driven growth via GitHub issues |

## Quick Start

### Live Demo

Visit **[free-api-hub.netlify.app](https://free-api-hub.netlify.app)** — zero installation, start testing APIs immediately.

### Local Development

```bash
# Clone the repository
git clone https://github.com/Arga-Wicaksono/freeapihub.git
cd freeapihub

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open `http://localhost:5173` in your browser.

## AI Assistant & Machine-Readable Data

### Interactive AI Chat

Use the built-in AI Assistant tab to discover APIs using natural language:
- *"What API can I use for weather data?"*
- *"Show me a fetch example for random dog images"*
- *"Compare free exchange rate APIs"*

### Static JSON Endpoint

```bash
curl https://free-api-hub.netlify.app/apis.json
```

```json
{
  "name": "API Hub",
  "version": "3.0.0",
  "total_apis": 224,
  "total_categories": 35,
  "apis": [
    {
      "id": 1,
      "name": "Cat Facts",
      "description": "Random fun facts about cats",
      "category": "Animals",
      "url": "https://catfact.ninja/fact",
      "method": "GET",
      "auth": "None",
      "rateLimit": "100/hr",
      "docsUrl": "https://catfact.ninja/"
    }
  ]
}
```

## API Categories

**224 APIs across 35 categories:**

| Category | Count | Popular APIs |
|----------|-------|--------------|
| Developer | 37 | Hacker News, NPM, GitHub, StackExchange, PyPI, LeetCode, DuckDuckGo |
| Entertainment | 16 | JokeAPI, Rick & Morty, Dad Jokes, Chuck Norris, TVmaze, Imgflip |
| Images | 13 | Dog CEO, TheCatAPI, Dicebear, Meme API, Robohash, Cataas |
| Geography | 12 | RestCountries, IPify, IPinfo, GeoNames, ViaCEP, Postcodes.io |
| Science | 11 | NASA APOD, SpaceX, USGS Earthquakes, GBIF, ISS Location |
| Games | 10 | Pokemon, Deck of Cards, Open Trivia, Minecraft, Magic: The Gathering |
| Finance | 10 | Frankfurter, ExchangeRate, SEC EDGAR, World Bank, IBAN Validator |
| Weather | 9 | Open-Meteo, Sunrise API, AQICN, wttr.in, Carbon Intensity |
| Crypto | 9 | CoinGecko, Binance, GeckoTerminal, BlockCypher, Kraken |
| Government | 8 | USA Spending, openFDA, Census, SEC EDGAR, Federal Register |
| Random | 7 | Random User, Agify, Genderize, Faker API, Yes No API |
| Animals | 6 | Cat Facts, Dog Facts, Dog CEO, RandomFox, TheCatAPI |
| Food | 6 | TheMealDB, Cocktail DB, Open Food Facts, Open Brewery DB |
| Academic | 5 | OpenAlex, Crossref, Open Library, DOAJ, Universities |
| Calendar | 4 | Nager.Date, TimeAPI, NYC Holidays, Singapore Holidays |
| Transportation | 4 | iRail, OpenSky, GeoJS, CityBikes |
| Language & Translation | 4 | Datamuse, Dictionary API, Quran, Bible API |
| Vehicles | 4 | NHTSA VPIC, Ergast F1, TheSportsDB |
| Religion | 4 | Quran, Hadith, Aladhan, Puasa Sunnah |
| Technology | 4 | Phone Specs, Node.js, Codetabs, StAPI |
| Health | 4 | Disease.sh, WHO GHO, Medicare, openFDA |
| Music | 3 | Lyrics OVH, Audius, Genrenator |
| News | 3 | HackerNews, Full Text RSS, Berita Indo |
| Art | 3 | Art Institute Chicago, Met Museum, Rijksmuseum |
| Sports | 3 | Ergast F1, TheSportsDB, Basketball |
| Mathematics | 3 | Calculator API, Numbers API, Is Even |
| Jobs | 3 | Remotive, Jobicy, ArbeitNow |
| Quotes & Inspiration | 3 | DummyJSON Quotes, ZenQuotes, Advice Slip |
| Movies & TV | 3 | OMDb, TVmaze, STAPI |
| Email & Phone | 3 | Guerrilla Mail, Mailcheck, NumVerify |
| Open Data | 3 | AG Grid, NYC Open Data, Data SG |
| Books & Literature | 2 | Open Library, PoetryDB |
| URL & QR Tools | 2 | QuickChart QR, Un-Shorten |
| Social Media | 2 | Mastodon, Codetabs |
| Data | 1 | Wikipedia API |

## Tech Stack

| Component | Technology |
|-----------|-------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Custom CSS (CSS Variables, Emerald Design System) |
| Code Splitting | React.lazy + Suspense |
| Deployment | Netlify |
| Type | Static Site (SPA) |
| License | MIT |

## Project Structure

```
freeapihub/
├── public/
│   ├── icon.svg              # SVG logo
│   ├── favicon.png           # Favicon
│   ├── icon-192.png          # PWA icon 192x192
│   ├── icon-512.png          # PWA icon 512x512
│   ├── og-image.png          # Social sharing preview
│   ├── apis.json             # Machine-readable API catalog
│   ├── manifest.json         # PWA manifest
│   ├── robots.txt            # SEO
│   ├── sitemap.xml           # SEO sitemap
│   └── _redirects            # Netlify SPA routing
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Main app
│   ├── App.css               # Styles
│   ├── types.ts              # TypeScript interfaces
│   ├── data/
│   │   ├── apis.ts           # API catalog (224 entries)
│   │   └── quickPicks.ts     # Guided mode cards
│   ├── components/
│   │   ├── TestPanel.tsx     # API testing modal
│   │   ├── AIChat.tsx        # AI Assistant
│   │   ├── HistoryPanel.tsx  # Response history
│   │   ├── SyntaxHighlight.tsx
│   │   └── CsvTable.tsx
│   ├── hooks/
│   │   ├── useApiStatus.ts   # Health checker
│   │   └── useFocusTrap.ts   # Accessibility
│   └── utils/
│       └── helpers.ts        # Utilities
├── scripts/
│   └── generate-apis-json.js # Build script
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── netlify.toml
└── LICENSE
```

## System Design

### High-Level Architecture

<img src="https://raw.githubusercontent.com/Arga-Wicaksono/freeapihub/main/high-level.svg" alt="High-Level Architecture" width="100%">

### Component Architecture

<img src="https://raw.githubusercontent.com/Arga-Wicaksono/freeapihub/main/components.svg" alt="Component Architecture" width="100%">

### API Request Flow

<img src="https://raw.githubusercontent.com/Arga-Wicaksono/freeapihub/main/sequence.svg" alt="API Request Flow Sequence Diagram" width="100%">

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `T` / `R` | Test selected API |
| `Esc` | Close panel / modal |

## Deploy to Netlify

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or connect your GitHub repo to Netlify for automatic deployments on every push.

## Contributing

Contributions are welcome!

1. **Submit a new API** — Use the [Submit API form](https://github.com/Arga-Wicaksono/freeapihub/issues/new?labels=enhancement) or click "+ Submit" on the site
2. **Report bugs** — [Open an issue](https://github.com/Arga-Wicaksono/freeapihub/issues/new)
3. **Fix issues** — Fork, branch, commit, [open a PR](https://github.com/Arga-Wicaksono/freeapihub/pulls)
4. **Improve docs** — README, code comments, etc.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with love for developers — If you find API Hub useful, please consider giving it a star on GitHub!</sub>
</div>
