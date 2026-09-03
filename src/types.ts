export type Img = { url?: string; alt?: string; credit?: string };

export type SourceQuote = { text: string; attribution: string; note?: string };
export type Reference = { key: string; label: string; url: string; kind: string; note?: string; verified: boolean };
export type DeepDive = {
  howToRead?: string;
  whoIsOnIt?: string;
  theYear?: string;
  inTheSources: SourceQuote[];
  metalAndMaking?: string;
  whyItMatters?: string;
  cautions?: string;
  reviewed: boolean;
};

export type Coin = {
  id: string;
  order: number;
  status: "owned" | "wishlist";
  name: string;
  authority?: string;
  date?: string;
  dateSort?: number;
  denomination?: string;
  metal?: string;
  mint?: string;
  weightG?: number;
  diameterMm?: number;
  reference?: string;
  grade?: string;
  tags: string[];
  story?: { hook?: string; body?: string };
  ambitious?: boolean;
  images?: { obverse?: Img; reverse?: Img };
  header?: Img;
  deepDive?: DeepDive;
  references?: Reference[];
  certification?: { service: string; grade?: string };
};

export type World = {
  id: string;
  name: string;
  tagline?: string;
  era?: { from: string; to: string };
  regions: string[];
  order: number;
  intro?: string;
  cover?: Img;
  coins: Coin[];
};

export type Bundle = {
  generatedAt: string;
  stats: { worlds: number; owned: number; wishlist: number };
  worlds: World[];
};
