export type PoolItem = {
  id: string;
  text: string;
  tags?: string[];
  note?: string;
};

export type Pool = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  items: PoolItem[];
};

export type PoolStore = {
  version: 1;
  pools: Pool[];
};
