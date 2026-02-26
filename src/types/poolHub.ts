export type PoolHubEntry = {
  id: string;
  creator?: string;
  creatorId?: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  category: string;
  languages: string[];
  license: string;
  heroImageUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
  downloads: number;
  createdAt: number;
  updatedAt: number;
  payload: import('./pools').Pool;
};
