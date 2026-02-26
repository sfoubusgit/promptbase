export type WorkingSetItemRef = {
  id: string;
  poolId: string;
  poolItemId: string;
  text: string;
  addedAt: number;
};

export type WorkingSet = {
  id: string;
  name: string;
  categoryBuckets: Record<string, WorkingSetItemRef[]>;
  createdAt: number;
  updatedAt: number;
};

export type WorkingSetStore = {
  version: 2;
  activeId: string | null;
  sets: WorkingSet[];
};
