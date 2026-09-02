export type Img = { url?: string; alt?: string; credit?: string };

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
  images?: { obverse?: Img; reverse?: Img };
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
