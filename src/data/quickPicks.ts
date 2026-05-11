// Quick Picks: curated use-case cards for Guided Mode
// Based on Barry Schwartz "Paradox of Choice" — fewer choices = more action

export interface QuickPick {
  icon: string
  title: string
  description: string
  /** Category name to filter (primary method — always works) */
  category: string
  /** Optional secondary categories to merge */
  categories?: string[]
  /** Optional: hand-picked API IDs to prioritize (sorted first, then fill from category) */
  pinIds?: number[]
}

export const quickPicks: QuickPick[] = [
  {
    icon: '🌤️',
    title: 'Build a Weather App',
    description: 'Forecasts, air quality, and real-time weather data',
    category: 'Weather',
    pinIds: [33, 35, 37, 208],
  },
  {
    icon: '💰',
    title: 'Crypto Dashboard',
    description: 'Real-time prices from CoinGecko, Binance, and more',
    category: 'Crypto',
    pinIds: [67, 68, 71, 72],
  },
  {
    icon: '📊',
    title: 'Finance & Currency',
    description: 'Exchange rates, investment regulation, and market info',
    category: 'Finance',
    pinIds: [76, 77, 82, 217],
  },
  {
    icon: '🎨',
    title: 'Images & Placeholders',
    description: 'Random photos, avatars, memes, and generators',
    category: 'Images',
    pinIds: [84, 87, 88, 92, 93],
  },
  {
    icon: '🌍',
    title: 'IP & Location',
    description: 'Geolocation, country data, and mapping info',
    category: 'Geography',
    pinIds: [24, 31, 34, 27],
  },
  {
    icon: '🚀',
    title: 'Science & Space',
    description: 'Earthquakes, SpaceX launches, ISS tracking, and astronomy',
    category: 'Science',
    pinIds: [38, 39, 192, 206],
  },
  {
    icon: '🎮',
    title: 'Gaming & Trivia',
    description: 'Pokemon data, chess puzzles, and trivia questions',
    category: 'Games',
    pinIds: [44, 46, 48, 50],
  },
  {
    icon: '📰',
    title: 'News & Articles',
    description: 'Hacker News, RSS extraction, and aggregated news',
    category: 'News',
    pinIds: [132, 133, 134],
  },
  {
    icon: '🕌',
    title: 'Religion & Prayer',
    description: 'Quran, hadith collections, and daily prayer times',
    category: 'Religion',
    pinIds: [184, 185, 186, 231],
  },
  {
    icon: '📱',
    title: 'Tech & Reference',
    description: 'Phone specs, books, and public data APIs',
    category: 'Technology',
    categories: ['Books & Literature'],
    pinIds: [187, 232, 233, 234],
  },
]

// Editor's Choice: recommended API IDs per category
// Only the single best API per category gets this badge
export const editorChoiceIds: Set<number> = new Set([
  2,    // Animals: Dog Facts
  3,    // Entertainment: JokeAPI
  23,   // Random: Faker
  24,   // Geography: RestCountries
  35,   // Weather: Open-Meteo
  44,   // Games: Pokemon
  51,   // Food: TheMealDB
  57,   // Music: Lyrics OVH
  59,   // Crypto: CoinGecko
  76,   // Finance: Frankfurter
  97,   // Academic: OpenAlex
  100,  // Developer: Hacker News
  136,  // Health: Disease.sh
  141,  // Calendar: Nager.Date
  155,  // Sports: Ergast F1
  160,  // Mathematics: Calculator API
  164,  // Language & Translation: Datamuse
  170,  // URL & QR Tools: QuickChart QR
  174,  // Quotes & Inspiration: DummyJSON Quotes
  171,  // Vehicles: NHTSA VPIC
  132,  // News: HackerNews Top
  184,  // Religion: Quran API
  192,  // Science: NASA APOD
])

// Max APIs shown per category in Guided Mode
export const GUIDED_MODE_LIMIT = 12
