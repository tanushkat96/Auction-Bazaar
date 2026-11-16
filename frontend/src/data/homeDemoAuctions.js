const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

export const demoLiveAuctions = [
  {
    id: "demo-live-watch",
    auctionId: "demo-live-watch",
    title: "Vintage chronograph watch",
    description: "A classic timepiece with a story to tell.",
    startTime: new Date(now - 3 * hour).toISOString(),
    endTime: new Date(now + 5 * hour).toISOString(),
    startPrice: 180,
    currentPrice: 265,
    ownerId: "demo-seller",
    isDemo: true,
  },
  {
    id: "demo-live-camera",
    auctionId: "demo-live-camera",
    title: "35mm film camera",
    description: "A collector favorite, ready for its next owner.",
    startTime: new Date(now - 2 * hour).toISOString(),
    endTime: new Date(now + 9 * hour).toISOString(),
    startPrice: 90,
    currentPrice: 145,
    ownerId: "demo-seller",
    isDemo: true,
  },
  {
    id: "demo-live-vase",
    auctionId: "demo-live-vase",
    title: "Handcrafted ceramic vase",
    description: "One-of-a-kind studio pottery in earthy tones.",
    startTime: new Date(now - hour).toISOString(),
    endTime: new Date(now + 14 * hour).toISOString(),
    startPrice: 45,
    currentPrice: 72,
    ownerId: "demo-seller",
    isDemo: true,
  },
];

export const demoUpcomingAuctions = [
  {
    id: "demo-upcoming-print",
    title: "Limited edition art print",
    description: "Signed print from an independent artist.",
    startTime: new Date(now + day).toISOString(),
    endTime: new Date(now + 2 * day).toISOString(),
    startPrice: 60,
    isDemo: true,
  },
  {
    id: "demo-upcoming-records",
    title: "Rare jazz vinyl collection",
    description: "A curated set of five classic records.",
    startTime: new Date(now + 2 * day).toISOString(),
    endTime: new Date(now + 3 * day).toISOString(),
    startPrice: 120,
    isDemo: true,
  },
];

export const demoPastAuctions = [
  {
    id: "demo-past-lamp",
    title: "Mid-century brass table lamp",
    currentPrice: 210,
    winnerName: "Mira K.",
    isDemo: true,
  },
  {
    id: "demo-past-book",
    title: "First edition illustrated book",
    currentPrice: 340,
    winnerName: "Arjun R.",
    isDemo: true,
  },
];
