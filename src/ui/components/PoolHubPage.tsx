import { useEffect, useMemo, useState } from 'react';
import type { Pool, PoolHubEntry, WorkingSet, WorkingSetHubEntry } from '../../types';
import {
  addHubEntry,
  addHubComment,
  getUserRating,
  listHubComments,
  listHubEntries,
  setUserRating,
  updateHubComment,
  deleteHubComment,
  flagHubEntry,
  exportHubStore,
  importHubStore,
  resetHubStore,
  removeHubEntry,
} from '../../engine/poolHubStore';
import { exportPoolPayload, importPoolPayload, listPools } from '../../engine/poolStore';
import {
  addWorkingSetHubComment,
  addWorkingSetHubEntry,
  deleteWorkingSetHubComment,
  exportWorkingSetHubStore,
  flagWorkingSetHubEntry,
  getWorkingSetUserRating,
  importWorkingSetHubStore,
  listWorkingSetHubComments,
  listWorkingSetHubEntries,
  removeWorkingSetHubEntry,
  resetWorkingSetHubStore,
  setWorkingSetUserRating,
  updateWorkingSetHubComment,
} from '../../engine/workingSetHubStore';
import {
  exportWorkingSetPayload,
  importWorkingSetPayload,
  listWorkingSets,
  setActiveWorkingSetId,
} from '../../engine/workingSetStore';
import { Modal } from './Modal';
import './PoolHubPage.css';

type SortMode = 'trending' | 'newest' | 'top' | 'downloads';
type HubMode = 'pools' | 'working-sets';

type UploadFormState = {
  creator: string;
  title: string;
  summary: string;
  description: string;
  tags: string;
  category: string;
  language: string;
  license: string;
  heroImageUrl: string;
  jsonInput: string;
};

type WorkingSetUploadState = {
  creator: string;
  title: string;
  summary: string;
  description: string;
  tags: string;
  category: string;
  language: string;
  license: string;
  heroImageUrl: string;
  jsonInput: string;
};

const DEFAULT_UPLOAD_STATE: UploadFormState = {
  creator: '',
  title: '',
  summary: '',
  description: '',
  tags: '',
  category: 'Photography',
  language: 'en',
  license: 'CC-BY',
  heroImageUrl: '',
  jsonInput: '',
};

const DEFAULT_WS_UPLOAD_STATE: WorkingSetUploadState = {
  creator: '',
  title: '',
  summary: '',
  description: '',
  tags: '',
  category: 'Concept',
  language: 'en',
  license: 'CC-BY',
  heroImageUrl: '',
  jsonInput: '',
};

const scoreTrending = (entry: { downloads: number; ratingAvg: number; ratingCount: number }) =>
  entry.downloads * 0.7 + entry.ratingAvg * 200 + entry.ratingCount * 2;

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const parsePoolPayload = (raw: string, fallbackName: string): Pool => {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error('Invalid JSON.');
  }

  const candidate = parsed?.pool ?? parsed;
  if (!candidate || !Array.isArray(candidate.items)) {
    throw new Error('Pool JSON must include an items array.');
  }

  const name = typeof candidate.name === 'string' && candidate.name.trim()
    ? candidate.name.trim()
    : fallbackName.trim();

  if (!name) {
    throw new Error('Pool name is required.');
  }

  const now = Date.now();
  const poolId = createId('hub_pool');
  const items = candidate.items
    .map((item: any, index: number) => {
      if (!item || typeof item.text !== 'string') return null;
      const text = item.text.trim();
      if (!text) return null;
      return {
        id: item.id && typeof item.id === 'string' ? item.id : `${poolId}_item_${index + 1}`,
        text,
        tags: Array.isArray(item.tags) ? item.tags.filter((tag: any) => typeof tag === 'string') : undefined,
      };
    })
    .filter(Boolean) as Pool['items'];

  if (items.length === 0) {
    throw new Error('Pool items cannot be empty.');
  }

  return {
    id: poolId,
    name,
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : now,
    updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : now,
    items,
  };
};

const parseWorkingSetPayload = (raw: string, fallbackName: string): WorkingSet => {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error('Invalid JSON.');
  }

  const candidate = parsed?.workingSet ?? parsed;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Working Set JSON is invalid.');
  }

  const name = typeof candidate.name === 'string' && candidate.name.trim()
    ? candidate.name.trim()
    : fallbackName.trim();

  if (!name) {
    throw new Error('Working Set name is required.');
  }

  const buckets = candidate.categoryBuckets;
  if (!buckets || typeof buckets !== 'object') {
    throw new Error('Working Set JSON must include categoryBuckets.');
  }

  const now = Date.now();
  const workingSetId = createId('hub_working_set');
  const categoryBuckets: WorkingSet['categoryBuckets'] = {};
  Object.entries(buckets).forEach(([categoryId, items]) => {
    if (!Array.isArray(items)) return;
    categoryBuckets[categoryId] = items
      .map((item: any, index: number) => {
        if (!item || typeof item.text !== 'string') return null;
        const text = item.text.trim();
        if (!text) return null;
        return {
          id: item.id && typeof item.id === 'string' ? item.id : `${workingSetId}_${categoryId}_${index + 1}`,
          poolId: item.poolId && typeof item.poolId === 'string' ? item.poolId : `${workingSetId}_pool_${categoryId}`,
          poolItemId: item.poolItemId && typeof item.poolItemId === 'string' ? item.poolItemId : `${workingSetId}_item_${index + 1}`,
          text,
          addedAt: typeof item.addedAt === 'number' ? item.addedAt : now,
        };
      })
      .filter(Boolean) as WorkingSet['categoryBuckets'][string];
  });

  return {
    id: workingSetId,
    name,
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : now,
    updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : now,
    categoryBuckets,
  };
};

type PoolHubPageProps = {
  onGoToUserPools?: () => void;
  isLoggedIn?: boolean;
  onRequestLogin?: () => void;
  userName?: string | null;
  userId?: string | null;
};

export function PoolHubPage({
  onGoToUserPools,
  isLoggedIn = false,
  onRequestLogin,
  userName,
  userId,
}: PoolHubPageProps) {
  const [hubMode, setHubMode] = useState<HubMode>('pools');
  const [entries, setEntries] = useState<PoolHubEntry[]>(() => listHubEntries());
  const [workingSetEntries, setWorkingSetEntries] = useState<WorkingSetHubEntry[]>(() => listWorkingSetHubEntries());
  const [selectedId, setSelectedId] = useState<string>(entries[0]?.id ?? '');
  const [selectedWorkingSetId, setSelectedWorkingSetId] = useState<string>(workingSetEntries[0]?.id ?? '');
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('trending');
  const [minRating, setMinRating] = useState(0);
  const [showAllItems, setShowAllItems] = useState(false);
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWorkingSetUploadOpen, setIsWorkingSetUploadOpen] = useState(false);
  const [showMyUploads, setShowMyUploads] = useState(false);
  const [uploadState, setUploadState] = useState<UploadFormState>(DEFAULT_UPLOAD_STATE);
  const [workingSetUploadState, setWorkingSetUploadState] = useState<WorkingSetUploadState>(DEFAULT_WS_UPLOAD_STATE);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<Pool | null>(null);
  const [workingSetUploadPreview, setWorkingSetUploadPreview] = useState<WorkingSet | null>(null);
  const [adminJson, setAdminJson] = useState('');
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [userPools, setUserPools] = useState(() => listPools());
  const [userWorkingSets, setUserWorkingSets] = useState(() => listWorkingSets());
  const [selectedUserPoolId, setSelectedUserPoolId] = useState<string>(
    () => listPools()[0]?.id ?? ''
  );
  const [selectedUserWorkingSetId, setSelectedUserWorkingSetId] = useState<string>(
    () => listWorkingSets()[0]?.id ?? ''
  );
  const [userRating, setUserRatingState] = useState<number | null>(null);
  const [workingSetUserRating, setWorkingSetUserRatingState] = useState<number | null>(null);
  const [comments, setComments] = useState(() =>
    entries[0]?.id ? listHubComments(entries[0].id) : []
  );
  const [workingSetComments, setWorkingSetComments] = useState(() =>
    workingSetEntries[0]?.id ? listWorkingSetHubComments(workingSetEntries[0].id) : []
  );
  const [creatorStats, setCreatorStats] = useState({ uploads: 0, totalDownloads: 0, avgRating: 0 });
  const [workingSetCreatorStats, setWorkingSetCreatorStats] = useState({ uploads: 0, totalDownloads: 0, avgRating: 0 });
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    if (hubMode === 'working-sets') {
      setSelectedWorkingSetId(workingSetEntries[0]?.id ?? '');
      setUserWorkingSets(listWorkingSets());
    } else {
      setSelectedId(entries[0]?.id ?? '');
      setUserPools(listPools());
    }
    setShowAllItems(false);
    setAddMessage(null);
  }, [hubMode, entries, workingSetEntries]);

  const categories = useMemo(() => {
    const source = hubMode === 'working-sets' ? workingSetEntries : entries;
    return Array.from(new Set(source.map(entry => entry.category))).sort();
  }, [entries, workingSetEntries, hubMode]);

  const languages = useMemo(() => {
    const source = hubMode === 'working-sets' ? workingSetEntries : entries;
    return Array.from(new Set(source.flatMap(entry => entry.languages))).sort();
  }, [entries, workingSetEntries, hubMode]);

  const filteredEntries = useMemo(() => {
    const activeEntries = hubMode === 'working-sets' ? workingSetEntries : entries;
    const term = searchTerm.trim().toLowerCase();
    const tagTerm = tagFilter.trim().toLowerCase();
    const tagParts = tagTerm
      ? tagTerm.split(',').map(part => part.trim()).filter(Boolean)
      : [];

    const filtered = activeEntries.filter(entry => {
      const matchesTerm = term
        ? [entry.title, entry.summary, entry.description, entry.tags.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(term)
        : true;
      const matchesTag = tagParts.length > 0
        ? tagParts.every(part => entry.tags.some(tag => tag.toLowerCase().includes(part)))
        : true;
      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
      const matchesLanguage =
        languageFilter === 'all' || entry.languages.includes(languageFilter);
      const matchesRating = entry.ratingAvg >= minRating;
      const matchesOwnership = !showMyUploads || (Boolean(userId)
        ? entry.creatorId === userId
        : Boolean(userName) && entry.creator === userName);
      return (
        matchesTerm &&
        matchesTag &&
        matchesCategory &&
        matchesLanguage &&
        matchesRating &&
        matchesOwnership
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortMode === 'newest') return b.updatedAt - a.updatedAt;
      if (sortMode === 'top') {
        if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg;
        return b.ratingCount - a.ratingCount;
      }
      if (sortMode === 'downloads') return b.downloads - a.downloads;
      return scoreTrending(b) - scoreTrending(a);
    });

    return sorted;
  }, [entries, workingSetEntries, hubMode, searchTerm, tagFilter, categoryFilter, languageFilter, sortMode, showMyUploads, userName, userId, minRating]);

  const selectedEntry = useMemo(() => {
    if (hubMode === 'working-sets') {
      const match = filteredEntries.find(entry => entry.id === selectedWorkingSetId);
      if (match) return match;
      return filteredEntries[0] ?? null;
    }
    const match = filteredEntries.find(entry => entry.id === selectedId);
    if (match) return match;
    return filteredEntries[0] ?? null;
  }, [filteredEntries, selectedId, selectedWorkingSetId, hubMode]);

  useEffect(() => {
    if (!selectedEntry) {
      setUserRatingState(null);
      setWorkingSetUserRatingState(null);
      setComments([]);
      setWorkingSetComments([]);
      setCreatorStats({ uploads: 0, totalDownloads: 0, avgRating: 0 });
      setWorkingSetCreatorStats({ uploads: 0, totalDownloads: 0, avgRating: 0 });
      return;
    }
    if (hubMode === 'working-sets') {
      if (userId) {
        setWorkingSetUserRatingState(getWorkingSetUserRating(selectedEntry.id, userId));
      } else {
        setWorkingSetUserRatingState(null);
      }
      setWorkingSetComments(listWorkingSetHubComments(selectedEntry.id));
      if (selectedEntry.creator) {
        const creatorEntries = workingSetEntries.filter(entry =>
          entry.creatorId ? entry.creatorId === selectedEntry.creatorId : entry.creator === selectedEntry.creator
        );
        const uploads = creatorEntries.length;
        const totalDownloads = creatorEntries.reduce((sum, entry) => sum + entry.downloads, 0);
        const avgRating = uploads === 0
          ? 0
          : creatorEntries.reduce((sum, entry) => sum + entry.ratingAvg, 0) / uploads;
        setWorkingSetCreatorStats({ uploads, totalDownloads, avgRating });
      } else {
        setWorkingSetCreatorStats({ uploads: 0, totalDownloads: 0, avgRating: 0 });
      }
    } else {
      if (userId) {
        setUserRatingState(getUserRating(selectedEntry.id, userId));
      } else {
        setUserRatingState(null);
      }
      setComments(listHubComments(selectedEntry.id));
      if (selectedEntry.creator) {
        const creatorEntries = entries.filter(entry =>
          entry.creatorId ? entry.creatorId === selectedEntry.creatorId : entry.creator === selectedEntry.creator
        );
        const uploads = creatorEntries.length;
        const totalDownloads = creatorEntries.reduce((sum, entry) => sum + entry.downloads, 0);
        const avgRating = uploads === 0
          ? 0
          : creatorEntries.reduce((sum, entry) => sum + entry.ratingAvg, 0) / uploads;
        setCreatorStats({ uploads, totalDownloads, avgRating });
      } else {
        setCreatorStats({ uploads: 0, totalDownloads: 0, avgRating: 0 });
      }
    }
    setCommentError(null);
    setCommentBody('');
  }, [selectedEntry?.id, userId, entries, workingSetEntries, hubMode]);

  const handleAddToActive = () => {
    if (!isLoggedIn) {
      setAuthNotice(hubMode === 'working-sets' ? 'Log in to add Working Sets.' : 'Log in to add pools to User Pools.');
      onRequestLogin?.();
      return;
    }
    if (!selectedEntry) return;
    if (hubMode === 'working-sets') {
      const confirmed = window.confirm('Add this Working Set to your Working Sets? Existing sets with the same name will merge.');
      if (!confirmed) return;
      const imported = importWorkingSetPayload({ version: 2, workingSet: selectedEntry.payload as WorkingSet }, 'merge');
      setActiveWorkingSetId(imported.id);
      setAddMessage('Added to Working Sets (merged).');
      setUserWorkingSets(listWorkingSets());
      return;
    }
    const confirmed = window.confirm('Add this pool to User Pools? Existing pools with the same name will merge.');
    if (!confirmed) return;
    importPoolPayload({ version: 1, pool: selectedEntry.payload as Pool }, 'merge');
    setAddMessage('Added to User Pools (merged).');
  };

  const handleRate = (rating: number) => {
    if (!isLoggedIn) {
      setAuthNotice(hubMode === 'working-sets' ? 'Log in to rate Working Sets.' : 'Log in to rate pools.');
      onRequestLogin?.();
      return;
    }
    if (!selectedEntry) return;
    if (!userId) return;
    if (hubMode === 'working-sets') {
      const next = setWorkingSetUserRating(selectedEntry.id, userId, rating);
      setWorkingSetEntries(next);
      setWorkingSetUserRatingState(rating);
      return;
    }
    const next = setUserRating(selectedEntry.id, userId, rating);
    setEntries(next);
    setUserRatingState(rating);
  };

  const handleAddComment = () => {
    if (!isLoggedIn) {
      setAuthNotice('Log in to comment.');
      onRequestLogin?.();
      return;
    }
    if (!selectedEntry) return;
    const trimmed = commentBody.trim();
    if (!trimmed) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    const authorLabel = commentAuthor.trim() || userName || 'Anonymous';
    if (hubMode === 'working-sets') {
      addWorkingSetHubComment(selectedEntry.id, authorLabel, trimmed, userId ?? undefined);
      setWorkingSetComments(listWorkingSetHubComments(selectedEntry.id));
    } else {
      addHubComment(selectedEntry.id, authorLabel, trimmed, userId ?? undefined);
      setComments(listHubComments(selectedEntry.id));
    }
    setCommentBody('');
    setCommentError(null);
  };

  const handleEditComment = (commentId: string, body: string) => {
    if (!userId) return;
    if (hubMode === 'working-sets') {
      updateWorkingSetHubComment(commentId, userId, body);
      setWorkingSetComments(listWorkingSetHubComments(selectedEntry?.id ?? ''));
    } else {
      updateHubComment(commentId, userId, body);
      setComments(listHubComments(selectedEntry?.id ?? ''));
    }
    setEditingCommentId(null);
    setEditingCommentBody('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!userId) return;
    if (hubMode === 'working-sets') {
      deleteWorkingSetHubComment(commentId, userId);
      setWorkingSetComments(listWorkingSetHubComments(selectedEntry?.id ?? ''));
    } else {
      deleteHubComment(commentId, userId);
      setComments(listHubComments(selectedEntry?.id ?? ''));
    }
  };

  const handleReport = () => {
    if (!selectedEntry) return;
    const reason = reportReason.trim() || 'Report';
    if (hubMode === 'working-sets') {
      flagWorkingSetHubEntry(selectedEntry.id, reason);
    } else {
      flagHubEntry(selectedEntry.id, reason);
    }
    setReportReason('');
  };

  const handleDeletePool = () => {
    if (!selectedEntry || !userId) return;
    if (selectedEntry.creatorId !== userId) return;
    const confirmed = window.confirm(
      hubMode === 'working-sets'
        ? 'Delete this Working Set from the Hub? This cannot be undone.'
        : 'Delete this pool from the Hub? This cannot be undone.'
    );
    if (!confirmed) return;
    if (hubMode === 'working-sets') {
      const next = removeWorkingSetHubEntry(selectedEntry.id);
      setWorkingSetEntries(next);
      setSelectedWorkingSetId(next[0]?.id ?? '');
      setAddMessage('Working Set removed from Hub.');
      return;
    }
    const next = removeHubEntry(selectedEntry.id);
    setEntries(next);
    setSelectedId(next[0]?.id ?? '');
    setAddMessage('Pool removed from Hub.');
  };

  const handleExportHub = () => {
    try {
      const payload = hubMode === 'working-sets' ? exportWorkingSetHubStore() : exportHubStore();
      setAdminJson(JSON.stringify(payload, null, 2));
      setAdminMessage('Exported Hub data.');
      setAdminError(null);
    } catch (err: any) {
      setAdminError(err?.message ?? 'Failed to export Hub data.');
    }
  };

  const handleImportHub = () => {
    try {
      const parsed = JSON.parse(adminJson);
      if (hubMode === 'working-sets') {
        importWorkingSetHubStore(parsed);
        setWorkingSetEntries(listWorkingSetHubEntries());
      } else {
        importHubStore(parsed);
        setEntries(listHubEntries());
      }
      setAdminMessage('Imported Hub data.');
      setAdminError(null);
    } catch (err: any) {
      setAdminError(err?.message ?? 'Failed to import Hub data.');
    }
  };

  const handleResetHub = () => {
    const confirmed = window.confirm('Reset Hub data to defaults? This will erase local Hub edits.');
    if (!confirmed) return;
    if (hubMode === 'working-sets') {
      const next = resetWorkingSetHubStore();
      setWorkingSetEntries(next);
    } else {
      const next = resetHubStore();
      setEntries(next);
    }
    setAdminMessage('Hub data reset.');
    setAdminError(null);
  };

  const handleDownloadPool = () => {
    if (!selectedEntry) return;
    const payload = hubMode === 'working-sets'
      ? { version: 2, workingSet: selectedEntry.payload }
      : { version: 1, pool: selectedEntry.payload };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = selectedEntry.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    link.download = `${safeName || (hubMode === 'working-sets' ? 'working-set' : 'pool')}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    setUploadError(null);
    setUploadSuccess(null);
    if (hubMode === 'working-sets') {
      try {
        const workingSet = parseWorkingSetPayload(workingSetUploadState.jsonInput, workingSetUploadState.title);
        if (!workingSetUploadState.title.trim()) {
          throw new Error('Title is required.');
        }
        const trimmedTitle = workingSetUploadState.title.trim() || workingSet.name;
        const existing = workingSetEntries.some(entry => entry.title.toLowerCase() === trimmedTitle.toLowerCase());
        if (existing) {
          throw new Error('A Working Set with this title already exists.');
        }
        const now = Date.now();
        const entry: WorkingSetHubEntry = {
          id: createId('hub_ws'),
          creator: workingSetUploadState.creator.trim() || userName || undefined,
          creatorId: userId || undefined,
          title: trimmedTitle,
          summary: workingSetUploadState.summary.trim() || 'New community working set upload.',
          description: workingSetUploadState.description.trim() || 'No description provided.',
          tags: workingSetUploadState.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean),
          category: workingSetUploadState.category || 'General',
          languages: [workingSetUploadState.language || 'en'],
          license: workingSetUploadState.license || 'CC-BY',
          heroImageUrl: workingSetUploadState.heroImageUrl.trim() || null,
          ratingAvg: 0,
          ratingCount: 0,
          downloads: 0,
          createdAt: now,
          updatedAt: now,
          payload: workingSet,
        };
        const next = addWorkingSetHubEntry(entry);
        setWorkingSetEntries(next);
        setSelectedWorkingSetId(entry.id);
        setUploadSuccess('Working Set uploaded to the Hub (saved locally).');
        setWorkingSetUploadState(DEFAULT_WS_UPLOAD_STATE);
        setWorkingSetUploadPreview(null);
        setIsWorkingSetUploadOpen(false);
      } catch (err: any) {
        setUploadError(err?.message ?? 'Failed to upload Working Set.');
      }
      return;
    }
    try {
      const pool = parsePoolPayload(uploadState.jsonInput, uploadState.title);
      if (!uploadState.title.trim()) {
        throw new Error('Title is required.');
      }
      const trimmedTitle = uploadState.title.trim() || pool.name;
      const existing = entries.some(entry => entry.title.toLowerCase() === trimmedTitle.toLowerCase());
      if (existing) {
        throw new Error('A pool with this title already exists.');
      }
      const now = Date.now();
      const entry: PoolHubEntry = {
        id: createId('hub_entry'),
        creator: uploadState.creator.trim() || userName || undefined,
        creatorId: userId || undefined,
        title: trimmedTitle,
        summary: uploadState.summary.trim() || 'New community pool upload.',
        description: uploadState.description.trim() || 'No description provided.',
        tags: uploadState.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        category: uploadState.category || 'General',
        languages: [uploadState.language || 'en'],
        license: uploadState.license || 'CC-BY',
        heroImageUrl: uploadState.heroImageUrl.trim() || null,
        ratingAvg: 0,
        ratingCount: 0,
        downloads: 0,
        createdAt: now,
        updatedAt: now,
        payload: pool,
      };

      const next = addHubEntry(entry);
      setEntries(next);
      setSelectedId(entry.id);
      setUploadSuccess('Pool uploaded to the Hub (saved locally).');
      setUploadState(DEFAULT_UPLOAD_STATE);
      setUploadPreview(null);
      setIsUploadOpen(false);
    } catch (err: any) {
      setUploadError(err?.message ?? 'Failed to upload pool.');
    }
  };

  const handleUploadFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (hubMode === 'working-sets') {
        setWorkingSetUploadState(prev => ({ ...prev, jsonInput: result }));
        try {
          const previewSet = parseWorkingSetPayload(result, workingSetUploadState.title);
          setWorkingSetUploadPreview(previewSet);
        } catch {
          setWorkingSetUploadPreview(null);
        }
        return;
      }
      setUploadState(prev => ({ ...prev, jsonInput: result }));
      try {
        const previewPool = parsePoolPayload(result, uploadState.title);
        setUploadPreview(previewPool);
      } catch {
        setUploadPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportFromUserPools = () => {
    setUploadError(null);
    if (hubMode === 'working-sets') {
      if (!selectedUserWorkingSetId) {
        setUploadError('Select a Working Set first.');
        return;
      }
      try {
        const payload = exportWorkingSetPayload(selectedUserWorkingSetId);
        const setName = payload.workingSet.name;
        setWorkingSetUploadState(prev => ({
          ...prev,
          title: prev.title.trim() ? prev.title : setName,
          summary: prev.summary.trim() ? prev.summary : 'Imported from Working Sets.',
          jsonInput: JSON.stringify(payload, null, 2),
        }));
        setWorkingSetUploadPreview(payload.workingSet);
      } catch (err: any) {
        setUploadError(err?.message ?? 'Failed to import from Working Sets.');
      }
      return;
    }
    if (!selectedUserPoolId) {
      setUploadError('Select a User Pool first.');
      return;
    }
    try {
      const payload = exportPoolPayload(selectedUserPoolId);
      const poolName = payload.pool.name;
      setUploadState(prev => ({
        ...prev,
        title: prev.title.trim() ? prev.title : poolName,
        summary: prev.summary.trim() ? prev.summary : 'Imported from User Pools.',
        jsonInput: JSON.stringify(payload, null, 2),
      }));
      setUploadPreview(payload.pool);
    } catch (err: any) {
      setUploadError(err?.message ?? 'Failed to import from User Pools.');
    }
  };

  const visibleItems = useMemo(() => {
    if (!selectedEntry) return [];
    if (hubMode === 'working-sets') {
      const allItems = Object.values((selectedEntry.payload as WorkingSet).categoryBuckets ?? {}).flat();
      return showAllItems ? allItems : allItems.slice(0, 8);
    }
    const items = (selectedEntry.payload as Pool).items;
    return showAllItems ? items : items.slice(0, 8);
  }, [selectedEntry, showAllItems, hubMode]);

  return (
    <div className="pool-hub-page">
      <header className="pool-hub-header">
        <div>
          <h2>Pool Hub</h2>
          <p>Discover, download, and activate pools and working sets from the community.</p>
        </div>
        <div className="pool-hub-header-actions">
          <div className="pool-hub-mode-toggle">
            <button
              type="button"
              className={hubMode === 'pools' ? 'active' : ''}
              onClick={() => setHubMode('pools')}
            >
              Pools
            </button>
            <button
              type="button"
              className={hubMode === 'working-sets' ? 'active' : ''}
              onClick={() => setHubMode('working-sets')}
            >
              Working Sets
            </button>
          </div>
          {isLoggedIn && userName && (
            <div className="pool-hub-user-badge">Logged in as {userName}</div>
          )}
          <button
            type="button"
            className="pool-hub-primary"
            onClick={() => {
              if (!isLoggedIn) {
                setAuthNotice(hubMode === 'working-sets' ? 'Log in to upload Working Sets.' : 'Log in to upload pools.');
                onRequestLogin?.();
                return;
              }
              setUploadError(null);
              setUploadSuccess(null);
              if (hubMode === 'working-sets') {
                setWorkingSetUploadState(DEFAULT_WS_UPLOAD_STATE);
                setIsWorkingSetUploadOpen(true);
              } else {
                setUploadState(DEFAULT_UPLOAD_STATE);
                setIsUploadOpen(true);
              }
            }}
            disabled={!isLoggedIn}
          >
            {hubMode === 'working-sets' ? 'Upload Working Set' : 'Upload Pool'}
          </button>
        </div>
      </header>

      {authNotice && <div className="pool-hub-auth-notice">{authNotice}</div>}
      {uploadSuccess && <div className="pool-hub-message">{uploadSuccess}</div>}

      <div className="pool-hub-toolbar">
        <input
          type="text"
          placeholder={hubMode === 'working-sets' ? 'Search working sets' : 'Search pools'}
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by tag"
          value={tagFilter}
          onChange={event => setTagFilter(event.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={event => setCategoryFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={languageFilter}
          onChange={event => setLanguageFilter(event.target.value)}
        >
          <option value="all">All languages</option>
          {languages.map(language => (
            <option key={language} value={language}>
              {language.toUpperCase()}
            </option>
          ))}
        </select>
        <select value={sortMode} onChange={event => setSortMode(event.target.value as SortMode)}>
          <option value="trending">Trending</option>
          <option value="newest">Newest</option>
          <option value="top">Top Rated</option>
          <option value="downloads">Most Downloads</option>
        </select>
        <label className="pool-hub-range">
          <span>Min rating</span>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={minRating}
            onChange={event => setMinRating(parseFloat(event.target.value))}
          />
          <span>{minRating.toFixed(1)}</span>
        </label>
        <label className="pool-hub-toggle">
          <input
            type="checkbox"
            checked={showMyUploads}
            onChange={event => setShowMyUploads(event.target.checked)}
            disabled={!userName}
          />
          My uploads
        </label>
      </div>

      <div className="pool-hub-layout">
        <section className="pool-hub-panel pool-hub-panel-grid">
          <div className="pool-hub-grid">
            {filteredEntries.length === 0 ? (
              <div className="pool-hub-empty">
                {showMyUploads
                  ? `No uploads yet. Upload a ${hubMode === 'working-sets' ? 'working set' : 'pool'} to see it here.`
                  : `No ${hubMode === 'working-sets' ? 'working sets' : 'pools'} match your filters.`}
              </div>
            ) : (
              filteredEntries.map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  className={`pool-hub-card ${entry.id === selectedEntry?.id ? 'active' : ''}`}
                  onClick={() => {
                    if (hubMode === 'working-sets') {
                      setSelectedWorkingSetId(entry.id);
                    } else {
                      setSelectedId(entry.id);
                    }
                    setAddMessage(null);
                    setShowAllItems(false);
                  }}
                >
                  <div className="pool-hub-card-hero" />
                  <div className="pool-hub-card-body">
                    <div className="pool-hub-card-title">{entry.title}</div>
                    <div className="pool-hub-card-summary">{entry.summary}</div>
                    {entry.creator && (
                      <div className="pool-hub-card-creator">
                        by {entry.creator}
                        {((userId && entry.creatorId === userId) || (!userId && userName && entry.creator === userName)) && (
                          <span className="pool-hub-owner-badge">Your upload</span>
                        )}
                      </div>
                    )}
                    <div className="pool-hub-card-meta">
                      <span>{entry.category}</span>
                      <span>{entry.ratingAvg.toFixed(1)} / 5</span>
                      <span>{entry.downloads} downloads</span>
                    </div>
                    <div className="pool-hub-card-tags">
                      {entry.tags.slice(0, 4).map(tag => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <aside className="pool-hub-panel pool-hub-panel-detail">
          {!selectedEntry ? (
            <div className="pool-hub-empty">
              Select a {hubMode === 'working-sets' ? 'working set' : 'pool'} to view details.
            </div>
          ) : (
            <>
              <div className="pool-hub-detail-hero">
                <div>
                  <div className="pool-hub-detail-title">{selectedEntry.title}</div>
                  <div className="pool-hub-detail-summary">{selectedEntry.summary}</div>
                </div>
                <div className="pool-hub-detail-actions">
                  <button
                    type="button"
                    className="pool-hub-primary"
                    onClick={handleAddToActive}
                    disabled={!isLoggedIn}
                  >
                    Add to Active
                  </button>
                  <button type="button" className="pool-hub-secondary" onClick={handleDownloadPool}>
                    Download JSON
                  </button>
                  {hubMode === 'pools' && onGoToUserPools && (
                    <button type="button" className="pool-hub-secondary" onClick={onGoToUserPools}>
                      View in User Pools
                    </button>
                  )}
                  {userId && selectedEntry.creatorId === userId && (
                    <button type="button" className="pool-hub-danger" onClick={handleDeletePool}>
                      Delete from Hub
                    </button>
                  )}
                </div>
              </div>
              {addMessage && (
                <div className="pool-hub-message">
                  <span>{addMessage}</span>
                  {hubMode === 'pools' && onGoToUserPools && (
                    <button
                      type="button"
                      className="pool-hub-message-link"
                      onClick={onGoToUserPools}
                    >
                      Open User Pools
                    </button>
                  )}
                </div>
              )}
              <div className="pool-hub-detail-meta">
                {selectedEntry.creator && <span>By {selectedEntry.creator}</span>}
                {((userId && selectedEntry.creatorId === userId) || (!userId && userName && selectedEntry.creator === userName)) && (
                  <span className="pool-hub-owner-badge">Your upload</span>
                )}
                <span>{selectedEntry.category}</span>
                <span>{selectedEntry.languages.join(', ').toUpperCase()}</span>
                <span>{selectedEntry.license}</span>
                <span>{selectedEntry.ratingAvg.toFixed(1)} ({selectedEntry.ratingCount})</span>
              </div>
              <p className="pool-hub-detail-description">{selectedEntry.description}</p>
              {selectedEntry.creator && (
                <div className="pool-hub-creator-card">
                  <div className="pool-hub-creator-title">{selectedEntry.creator}</div>
                  <div className="pool-hub-creator-meta">
                    <span>{(hubMode === 'working-sets' ? workingSetCreatorStats : creatorStats).uploads} uploads</span>
                    <span>{(hubMode === 'working-sets' ? workingSetCreatorStats : creatorStats).totalDownloads} downloads</span>
                    <span>Avg {(hubMode === 'working-sets' ? workingSetCreatorStats : creatorStats).avgRating.toFixed(1)} rating</span>
                  </div>
                </div>
              )}
              <div className="pool-hub-detail-split">
                <div className="pool-hub-version-card">
                  <div className="pool-hub-section-title">Version & Changelog</div>
                  <div className="pool-hub-muted">v1.0.0 • Initial release</div>
                  <div className="pool-hub-muted">Next: add variants and prompt sets.</div>
                </div>
                <div className="pool-hub-report-card">
                  <div className="pool-hub-section-title">Report</div>
                  <div className="pool-hub-muted">
                    See something off? Flag this {hubMode === 'working-sets' ? 'working set' : 'pool'}.
                  </div>
                  <input
                    type="text"
                    value={reportReason}
                    onChange={event => setReportReason(event.target.value)}
                    placeholder="Reason (optional)"
                  />
                  <button type="button" className="pool-hub-secondary" onClick={handleReport}>
                    {hubMode === 'working-sets' ? 'Report working set' : 'Report pool'}
                  </button>
                </div>
              </div>
              <div className="pool-hub-rating">
                <div className="pool-hub-rating-label">Your rating</div>
                <div className="pool-hub-rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`pool-hub-star ${
                        (hubMode === 'working-sets' ? workingSetUserRating : userRating) &&
                        (hubMode === 'working-sets' ? workingSetUserRating : userRating)! >= star
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleRate(star)}
                      disabled={!isLoggedIn}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="pool-hub-rating-meta">
                  Avg {selectedEntry.ratingAvg.toFixed(1)} ({selectedEntry.ratingCount})
                </div>
              </div>
              <div className="pool-hub-comments">
                <div className="pool-hub-comments-header">
                  Comments ({hubMode === 'working-sets' ? workingSetComments.length : comments.length})
                </div>
                <div className="pool-hub-comments-form">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={commentAuthor}
                    onChange={event => setCommentAuthor(event.target.value)}
                    disabled={!isLoggedIn}
                  />
                  <textarea
                    rows={3}
                    placeholder="Write a comment"
                    value={commentBody}
                    onChange={event => setCommentBody(event.target.value)}
                    disabled={!isLoggedIn}
                  />
                  {commentError && <div className="pool-hub-error">{commentError}</div>}
                  <div className="pool-hub-comments-actions">
                    <button type="button" className="pool-hub-secondary" onClick={() => {
                      setCommentBody('');
                      setCommentError(null);
                    }} disabled={!isLoggedIn}>
                      Clear
                    </button>
                    <button
                      type="button"
                      className="pool-hub-primary"
                      onClick={handleAddComment}
                      disabled={!isLoggedIn}
                    >
                      Post Comment
                    </button>
                  </div>
                  {!isLoggedIn && (
                    <div className="pool-hub-auth-hint">
                      Log in to post comments and ratings.
                    </div>
                  )}
                </div>
                <div className="pool-hub-comments-list">
                  {(hubMode === 'working-sets' ? workingSetComments : comments).length === 0 ? (
                    <div className="pool-hub-empty">No comments yet.</div>
                  ) : (
                    (hubMode === 'working-sets' ? workingSetComments : comments).map(comment => (
                      <div key={comment.id} className="pool-hub-comment">
                        <div className="pool-hub-comment-head">
                          <span className="pool-hub-comment-author">
                            {comment.authorId && comment.authorId === userId ? 'You' : comment.author}
                          </span>
                          <span className="pool-hub-comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {editingCommentId === comment.id ? (
                          <>
                            <textarea
                              rows={3}
                              value={editingCommentBody}
                              onChange={event => setEditingCommentBody(event.target.value)}
                            />
                            <div className="pool-hub-comments-actions">
                              <button
                                type="button"
                                className="pool-hub-secondary"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentBody('');
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="pool-hub-primary"
                                onClick={() => handleEditComment(comment.id, editingCommentBody)}
                              >
                                Save
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="pool-hub-comment-body">{comment.body}</div>
                        )}
                        {comment.authorId && comment.authorId === userId && editingCommentId !== comment.id && (
                          <div className="pool-hub-comments-actions">
                            <button
                              type="button"
                              className="pool-hub-secondary"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentBody(comment.body);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="pool-hub-secondary"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="pool-hub-detail-items">
                <div className="pool-hub-detail-items-header">
                  <span>
                    Items (
                    {hubMode === 'working-sets'
                      ? Object.values((selectedEntry.payload as WorkingSet).categoryBuckets ?? {}).reduce(
                          (sum, list) => sum + list.length,
                          0
                        )
                      : (selectedEntry.payload as Pool).items.length}
                    )
                  </span>
                  <button
                    type="button"
                    className="pool-hub-link"
                    onClick={() => setShowAllItems(prev => !prev)}
                  >
                    {showAllItems ? 'Show less' : 'Show all'}
                  </button>
                </div>
                {hubMode === 'working-sets' ? (
                  <div className="pool-hub-detail-items-grouped">
                    {Object.entries((selectedEntry.payload as WorkingSet).categoryBuckets ?? {}).map(
                      ([categoryId, items]) => {
                        const shownItems = showAllItems ? items : items.slice(0, 4);
                        return (
                          <div key={categoryId} className="pool-hub-item-group">
                            <div className="pool-hub-item-group-title">
                              {categoryId.replace(/-/g, ' ')}
                              <span>{items.length}</span>
                            </div>
                            <div className="pool-hub-detail-items-list">
                              {shownItems.map(item => (
                                <div key={item.id} className="pool-hub-item">
                                  <div className="pool-hub-item-text">{item.text}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="pool-hub-detail-items-list">
                    {visibleItems.map(item => (
                      <div key={item.id} className="pool-hub-item">
                        <div className="pool-hub-item-text">{item.text}</div>
                        {'tags' in item && item.tags && item.tags.length > 0 && (
                          <div className="pool-hub-item-tags">{item.tags.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

      </div>

      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Pool to Hub"
        className="pool-hub-upload-modal"
      >
        <div className="pool-hub-upload-form">
          <div className="pool-hub-upload-grid">
            <label>
              Creator
              <input
                type="text"
                value={uploadState.creator}
                onChange={event => setUploadState(prev => ({ ...prev, creator: event.target.value }))}
                placeholder="Studio Name"
              />
            </label>
            <label>
              Title
              <input
                type="text"
                value={uploadState.title}
                onChange={event => setUploadState(prev => ({ ...prev, title: event.target.value }))}
                placeholder="Cinematic Portrait Studio"
              />
            </label>
            <label>
              Summary
              <input
                type="text"
                value={uploadState.summary}
                onChange={event => setUploadState(prev => ({ ...prev, summary: event.target.value }))}
                placeholder="Short one-liner"
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={uploadState.category}
                onChange={event => setUploadState(prev => ({ ...prev, category: event.target.value }))}
                placeholder="Photography"
              />
            </label>
            <label>
              Language
              <input
                type="text"
                value={uploadState.language}
                onChange={event => setUploadState(prev => ({ ...prev, language: event.target.value }))}
                placeholder="en"
              />
            </label>
            <label>
              License
              <input
                type="text"
                value={uploadState.license}
                onChange={event => setUploadState(prev => ({ ...prev, license: event.target.value }))}
                placeholder="CC-BY"
              />
            </label>
            <label>
              Tags (comma)
              <input
                type="text"
                value={uploadState.tags}
                onChange={event => setUploadState(prev => ({ ...prev, tags: event.target.value }))}
                placeholder="portrait, cinematic"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              rows={4}
              value={uploadState.description}
              onChange={event => setUploadState(prev => ({ ...prev, description: event.target.value }))}
              placeholder="Describe the pool and best use cases"
            />
          </label>
          <label>
            Hero Image URL (optional)
            <input
              type="text"
              value={uploadState.heroImageUrl}
              onChange={event => setUploadState(prev => ({ ...prev, heroImageUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>
          <label>
            Upload Hero Image
            <input
              type="file"
              accept="image/*"
              onChange={event => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const result = typeof reader.result === 'string' ? reader.result : '';
                  setUploadState(prev => ({ ...prev, heroImageUrl: result }));
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <label>
            Pool JSON
            <textarea
              rows={6}
              value={uploadState.jsonInput}
              onChange={event => {
                const next = event.target.value;
                setUploadState(prev => ({ ...prev, jsonInput: next }));
                if (!next.trim()) {
                  setUploadPreview(null);
                  return;
                }
                try {
                  const previewPool = parsePoolPayload(next, uploadState.title);
                  setUploadPreview(previewPool);
                } catch {
                  setUploadPreview(null);
                }
              }}
              placeholder="Paste the exported pool JSON here"
            />
          </label>
          {uploadPreview && (
            <div className="pool-hub-upload-preview">
              <div className="pool-hub-section-title">Preview</div>
              <div className="pool-hub-muted">{uploadPreview.name}</div>
              <div className="pool-hub-muted">{uploadPreview.items.length} items</div>
            </div>
          )}
          <div className="pool-hub-upload-file">
            <input
              type="file"
              accept="application/json"
              onChange={event => handleUploadFile(event.target.files?.[0] ?? null)}
            />
            <span>Upload a .json file from disk.</span>
          </div>
          <div className="pool-hub-upload-import">
            <label>
              Import from User Pools
              <div className="pool-hub-upload-import-row">
                <select
                  value={selectedUserPoolId}
                  onChange={event => setSelectedUserPoolId(event.target.value)}
                >
                  {userPools.length === 0 ? (
                    <option value="">No user pools available</option>
                  ) : (
                    userPools.map(pool => (
                      <option key={pool.id} value={pool.id}>
                        {pool.name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  className="pool-hub-secondary"
                  onClick={handleImportFromUserPools}
                  disabled={userPools.length === 0}
                >
                  Load Pool
                </button>
              </div>
            </label>
          </div>
          {uploadError && <div className="pool-hub-error">{uploadError}</div>}
          <div className="pool-hub-upload-actions">
            <button type="button" className="pool-hub-secondary" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </button>
            <button type="button" className="pool-hub-primary" onClick={handleUpload}>
              Upload to Hub
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isWorkingSetUploadOpen}
        onClose={() => setIsWorkingSetUploadOpen(false)}
        title="Upload Working Set to Hub"
        className="pool-hub-upload-modal"
      >
        <div className="pool-hub-upload-form">
          <div className="pool-hub-upload-grid">
            <label>
              Creator
              <input
                type="text"
                value={workingSetUploadState.creator}
                onChange={event => setWorkingSetUploadState(prev => ({ ...prev, creator: event.target.value }))}
                placeholder="Studio Name"
              />
            </label>
            <label>
              Title
              <input
                type="text"
                value={workingSetUploadState.title}
                onChange={event => setWorkingSetUploadState(prev => ({ ...prev, title: event.target.value }))}
                placeholder="Cinematic Portrait Set"
              />
            </label>
            <label>
              Summary
              <input
                type="text"
                value={workingSetUploadState.summary}
                onChange={event => setWorkingSetUploadState(prev => ({ ...prev, summary: event.target.value }))}
                placeholder="Short one-liner"
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={workingSetUploadState.category}
                onChange={event => setWorkingSetUploadState(prev => ({ ...prev, category: event.target.value }))}
                placeholder="Concept"
              />
            </label>
            <label>
              Language
              <input
                type="text"
                value={workingSetUploadState.language}
                onChange={event => setWorkingSetUploadState(prev => ({ ...prev, language: event.target.value }))}
                placeholder="en"
              />
            </label>
            <label>
              License
              <input
                type="text"
                value={workingSetUploadState.license}
                onChange={event => setWorkingSetUploadState(prev => ({ ...prev, license: event.target.value }))}
                placeholder="CC-BY"
              />
            </label>
            <label>
              Tags (comma)
              <input
                type="text"
                value={workingSetUploadState.tags}
                onChange={event => setWorkingSetUploadState(prev => ({ ...prev, tags: event.target.value }))}
                placeholder="portrait, cinematic"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              rows={4}
              value={workingSetUploadState.description}
              onChange={event => setWorkingSetUploadState(prev => ({ ...prev, description: event.target.value }))}
              placeholder="Describe the working set and best use cases"
            />
          </label>
          <label>
            Hero Image URL (optional)
            <input
              type="text"
              value={workingSetUploadState.heroImageUrl}
              onChange={event => setWorkingSetUploadState(prev => ({ ...prev, heroImageUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>
          <label>
            Upload Hero Image
            <input
              type="file"
              accept="image/*"
              onChange={event => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const result = typeof reader.result === 'string' ? reader.result : '';
                  setWorkingSetUploadState(prev => ({ ...prev, heroImageUrl: result }));
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <label>
            Working Set JSON
            <textarea
              rows={6}
              value={workingSetUploadState.jsonInput}
              onChange={event => {
                const next = event.target.value;
                setWorkingSetUploadState(prev => ({ ...prev, jsonInput: next }));
                if (!next.trim()) {
                  setWorkingSetUploadPreview(null);
                  return;
                }
                try {
                  const previewSet = parseWorkingSetPayload(next, workingSetUploadState.title);
                  setWorkingSetUploadPreview(previewSet);
                } catch {
                  setWorkingSetUploadPreview(null);
                }
              }}
              placeholder="Paste the exported working set JSON here"
            />
          </label>
          {workingSetUploadPreview && (
            <div className="pool-hub-upload-preview">
              <div className="pool-hub-section-title">Preview</div>
              <div className="pool-hub-muted">{workingSetUploadPreview.name}</div>
              <div className="pool-hub-muted">
                {Object.values(workingSetUploadPreview.categoryBuckets).reduce((sum, list) => sum + list.length, 0)} items
              </div>
            </div>
          )}
          <div className="pool-hub-upload-file">
            <input
              type="file"
              accept="application/json"
              onChange={event => handleUploadFile(event.target.files?.[0] ?? null)}
            />
            <span>Upload a .json file from disk.</span>
          </div>
          <div className="pool-hub-upload-import">
            <label>
              Import from Working Sets
              <div className="pool-hub-upload-import-row">
                <select
                  value={selectedUserWorkingSetId}
                  onChange={event => setSelectedUserWorkingSetId(event.target.value)}
                >
                  {userWorkingSets.length === 0 ? (
                    <option value="">No working sets available</option>
                  ) : (
                    userWorkingSets.map(set => (
                      <option key={set.id} value={set.id}>
                        {set.name}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  className="pool-hub-secondary"
                  onClick={handleImportFromUserPools}
                  disabled={userWorkingSets.length === 0}
                >
                  Load Working Set
                </button>
              </div>
            </label>
          </div>
          {uploadError && <div className="pool-hub-error">{uploadError}</div>}
          <div className="pool-hub-upload-actions">
            <button type="button" className="pool-hub-secondary" onClick={() => setIsWorkingSetUploadOpen(false)}>
              Cancel
            </button>
            <button type="button" className="pool-hub-primary" onClick={handleUpload}>
              Upload to Hub
            </button>
          </div>
        </div>
      </Modal>

      <details className="pool-hub-admin">
        <summary>Hub Data Tools</summary>
        <div className="pool-hub-admin-body">
          <textarea
            rows={6}
            placeholder="Hub store JSON"
            value={adminJson}
            onChange={event => setAdminJson(event.target.value)}
          />
          <div className="pool-hub-admin-actions">
            <button type="button" className="pool-hub-secondary" onClick={handleExportHub}>
              Export Hub
            </button>
            <button type="button" className="pool-hub-secondary" onClick={handleImportHub}>
              Import Hub
            </button>
            <button type="button" className="pool-hub-secondary" onClick={handleResetHub}>
              Reset Hub
            </button>
          </div>
          {adminMessage && <div className="pool-hub-message">{adminMessage}</div>}
          {adminError && <div className="pool-hub-error">{adminError}</div>}
        </div>
      </details>
    </div>
  );
}
