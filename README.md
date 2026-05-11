<div align="center">

<img src="https://api-hu.netlify.app/icon.svg" width="120" alt="API Hub Logo">

# API Hub

**The Developer's API Playground — Explore, test, and integrate 300+ free public APIs directly from your browser.**

[![Live Demo](https://img.shields.io/badge/%F0%9F%8C%90-Live_Demo-3ECF8E?style=for-the-badge&labelColor=0F0F0F)](https://api-hu.netlify.app)
[![GitHub Stars](https://img.shields.io/github/stars/Arga-Wicaksono/api-hub?style=for-the-badge&label=Stars&labelColor=0F0F0F)](https://github.com/Arga-Wicaksono/api-hub/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Arga-Wicaksono/api-hub?style=for-the-badge&label=Forks&labelColor=0F0F0F)](https://github.com/Arga-Wicaksono/api-hub/network/members)
[![License: MIT](https://img.shields.io/github/license/Arga-Wicaksono/api-hub?style=for-the-badge&label=MIT&labelColor=0F0F0F)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-3ECF8E?style=for-the-badge&labelColor=0F0F0F)](https://github.com/Arga-Wicaksono/api-hub/pulls)
[![Netlify](https://img.shields.io/netlify/a4a6f4b6-5c2a-4f6d-8b9e-8e0b1a2c3d4e?style=for-the-badge&label=Netlify&labelColor=0F0F0F)](https://api-hu.netlify.app)
[![Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=api-hub&theme=dark)](https://www.producthunt.com/posts/api-hub)

[**Try it live →**](https://api-hu.netlify.app) · [**Request an API →**](https://github.com/Arga-Wicaksono/api-hub/issues/new?labels=enhancement&template=feature_request.md) · [**Report a Bug →**](https://github.com/Arga-Wicaksono/api-hub/issues/new)

<!-- Replace the link below with an actual screenshot/GIF of your app for maximum impact -->
<img src="https://api-hu.netlify.app/og-image.png" width="600" alt="API Hub Screenshot">

</div>

---

## Why API Hub?

Tired of hunting for free, working APIs across scattered lists and outdated directories? **API Hub** solves that problem. It's a single, beautifully designed interface where developers can **discover, test, and integrate** 300+ hand-picked public APIs — no sign-up, no API keys, no setup required.

Every API in the catalog is verified: active endpoints, CORS-friendly, no authentication needed, and production-ready. Whether you're building a side project, prototyping an idea, or learning how REST APIs work, API Hub is your one-stop playground.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Find APIs instantly by name, description, or category |
| 🤖 **AI Assistant** | Chat-based API discovery with code examples (cURL, JS, Python) |
| 📊 **Live Health Status** | Real-time uptime monitoring with green/red status indicators |
| 🧪 **In-Browser Testing** | Send requests and inspect responses without leaving the page |
| 🎨 **Smart Response Viewer** | JSON syntax highlight, image preview, video/audio player, CSV table, HTML preview, PDF viewer |
| 🏷️ **34 Categories** | Developer, Images, Entertainment, Science, Government, Games, Crypto, Weather, and more |
| 🔽 **Advanced Filters** | Filter by auth type, rate limit, category, or search query |
| ⭐ **Favorites** | Save your most-used APIs with local storage persistence |
| 📋 **One-Click Copy** | Copy JSON responses or cURL commands with a single click |
| 🔀 **CORS Proxy** | Built-in proxy selector for cross-origin requests |
| 🌗 **Dark / Light Mode** | System-aware theme with manual toggle, persisted across sessions |
| ⌨️ **Keyboard Shortcuts** | `T` to test, `Esc` to close |
| 📡 **Machine-Readable Catalog** | `/apis.json` endpoint for AI agents, CLI tools, and integrations |
| 📱 **PWA Ready** | Installable as a native app with full manifest support |
| 📝 **Submit APIs** | Community-driven growth — submit new APIs via GitHub issues |

## 🚀 Quick Start

### Live Demo

Visit **[api-hu.netlify.app](https://api-hu.netlify.app)** — zero installation, start testing APIs immediately.

### Local Development

```bash
# Clone the repository
git clone https://github.com/Arga-Wicaksono/api-hub.git
cd api-hub

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` in your browser.

## 🤖 AI Assistant & Machine-Readable Data

API Hub provides two ways for AI agents and developer tools to access the catalog:

### Interactive AI Chat

Use the built-in AI Assistant tab to discover APIs using natural language:
- *"What API can I use for weather data?"*
- *"Show me a fetch example for random dog images"*
- *"Compare free exchange rate APIs"*
- *"Which APIs have unlimited rate limits?"*

### Static JSON Endpoint

The complete API catalog is available as a machine-readable JSON file for programmatic access:

```bash
curl https://api-hu.netlify.app/apis.json
```

```json
{
  "name": "API Hub",
  "version": "3.0.0",
  "description": "Curated collection of 302+ free public APIs for developers",
  "total_apis": 302,
  "total_categories": 34,
  "generated_at": "2025-05-08T00:00:00.000Z",
  "categories": ["Animals", "Entertainment", "Science", ...],
  "apis": [
    {
      "id": 1,
      "name": "Cat Facts",
      "description": "Random cat facts",
      "category": "Animals",
      "url": "https://catfact.ninja/fact",
      "method": "GET",
      "auth": "None",
      "rateLimit": "100/hr"
    }
  ]
}
```

This makes API Hub a **discoverable API registry** that any AI agent, CLI tool, or integration pipeline can consume.

## 📁 API Categories

**302 APIs across 34 categories:**

| Category | Count | Popular APIs |
|----------|-------|--------------|
| 👨‍💻 Developer | 46 | Hacker News, NPM, GitHub, StackExchange, PyPI, LeetCode, DuckDuckGo |
| 🖼️ Images | 20 | Dog CEO, TheCatAPI, Lorem Picsum, Meme API, Dicebear, RandomFox, Pexels |
| 🎮 Entertainment | 20 | JokeAPI, xkcd, Rick & Morty, OMDb, Dad Jokes, Chuck Norris, TVMaze |
| 🌍 Geography | 19 | RestCountries, IPify, IPinfo, Universities, Geocoding, GeoJS |
| 🏛️ Government | 18 | USA Facts, OpenFDA, SEC EDGAR, Data.gov, Interpol, Regulations |
| 🔬 Science | 16 | NASA APOD, SpaceX, USGS Earthquakes, OpenAlex, PubMed, Open Notify |
| 🎲 Games | 12 | Pokemon, Deck of Cards, Open Trivia, Minecraft, Lichess, Bored API |
| ₿ Crypto | 11 | CoinCap, CoinGecko, Binance, BlockCypher, CoinDesk BPI, Mempool |
| 🌤️ Weather | 10 | Open-Meteo, Air Quality, Sunrise API, OWM, Pirate Weather |
| 🎲 Random | 9 | Random User, Agify, Genderize, Faker API, Bored API, Quotable |
| 📰 News | 8 | Reddit, HackerNews, GNews, Chronicling America, Lobsters |
| 🎵 Music | 8 | iTunes, Lyrics OVH, Audius, MusicBrainz, Genius, Deezer |
| ⚽ Sports | 7 | NBA Stats, Football Data, F1, Ergast, TheSportsDB |
| 📊 Open Data | 7 | Data USA, Census, World Bank, UK Police, NYC Open Data |
| 🍕 Food | 7 | TheMealDB, Cocktail DB, Open Food Facts, Edamam, Spoonacular |
| 💰 Finance | 7 | Frankfurter, ExchangeRate, IBAN Validator, Fixer IO, CBR |
| 📚 Academic | 7 | OpenAlex, Google Books, PubMed, Crossref, arXiv, Wikipedia |
| 🚌 Transportation | 6 | GTFS, IP Taxi, Metrobits, Navitia, OTP, Rome2rio |
| 💬 Quotes & Inspiration | 6 | They Said So, Quotable, ZenQuotes, Advice Slip, DummyJSON |
| 🌐 Language & Translation | 6 | MyMemory, LibreTranslate, Lingua, Fun Translations |
| 🏥 Health | 6 | Disease.sh, COVID History, COVID Countries, OpenFDA, NIH |
| 🔗 URL & QR Tools | 5 | CleanURI, QR Server, MicroQR, Datamatrix, Free QR |
| 🐕 Animals | 5 | Cat Facts, Dog Facts, Dog CEO, Shibe, Fish API |
| 🧮 Mathematics | 4 | Numbers API, MathJS, Fractions, Factomatic |
| 📧 Email & Phone | 4 | Abstract Email, NumVerify, Abstract Phone, Temp Mail |
| 🧪 Data | 4 | JSONPlaceholder, ReqRes, WorldTimeAPI, Placeholder |
| 🎨 Art | 4 | Art Institute Chicago, Met Museum, Lorem Picsum, Emoji API |
| 🚗 Vehicles | 3 | Mercedes, Porsche, BMW OpenAPI |
| 📱 Social Media | 3 | Reshuffle, SimLinks, Genderize |
| 🎬 Movies & TV | 3 | OMDb, TVMaze, STAPI |
| 💼 Jobs | 3 | JSearch, Arbol, Jobicy |
| 📅 Calendar | 3 | Nager.Date, Calendarific, Finnish Holidays |
| 📖 Books & Literature | 3 | Open Library, Gutendex, Wolne Lektury |
| 🏠 Real Estate | 2 | Realtor, Zillow |

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Custom CSS (CSS Variables, Emerald Design System) |
| Code Splitting | React.lazy + Suspense |
| Deployment | Netlify |
| Type | Static Site (SPA) |
| License | MIT |

## 📦 Project Structure

```
api-hub/
├── public/
│   ├── icon.svg              # SVG logo (scalable)
│   ├── favicon.png           # 128x128 favicon
│   ├── icon-512.png          # 512x512 PWA icon
│   ├── og-image.png          # Social sharing preview (1200x630)
│   ├── apis.json             # Machine-readable API catalog
│   ├── manifest.json         # PWA manifest
│   ├── robots.txt            # SEO robots
│   ├── sitemap.xml           # SEO sitemap
│   └── _redirects            # Netlify SPA routing
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main app (views, routing, state)
│   ├── App.css               # Component styles (Emerald design system)
│   ├── types.ts              # TypeScript interfaces
│   ├── data/
│   │   └── apis.ts           # API catalog (302 entries)
│   ├── components/
│   │   ├── TestPanel.tsx     # API testing modal
│   │   ├── SyntaxHighlight.tsx # JSON syntax highlighter
│   │   ├── CsvTable.tsx      # CSV data table
│   │   └── AIChat.tsx        # AI Assistant chat
│   ├── hooks/
│   │   └── useApiStatus.ts   # API health checker hook
│   └── utils/
│       └── helpers.ts        # Utility functions
├── scripts/
│   └── generate-apis-json.js # Build script for /apis.json
├── index.html                # HTML entry with full SEO meta
├── vite.config.ts            # Vite configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── netlify.toml              # Netlify deployment config
└── LICENSE                   # MIT License
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `T` | Test selected API |
| `Esc` | Close panel / modal |

## ☁️ Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or connect your GitHub repo to Netlify for automatic deployments on every push.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Submit a new API** — Use the [Submit API form](https://github.com/Arga-Wicaksono/api-hub/issues/new?labels=enhancement) or click "+ Submit" on the site
2. **Report bugs** — [Open an issue](https://github.com/Arga-Wicaksono/api-hub/issues/new)
3. **Fix issues** — Fork, branch, commit, [open a PR](https://github.com/Arga-Wicaksono/api-hub/pulls)
4. **Improve docs** — README, code comments, etc.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with 💚 for developers — If you find API Hub useful, please consider giving it a ⭐ on GitHub!</sub>
</div>
