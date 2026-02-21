import { useMemo, useState, useEffect } from 'react';
import type { Pool, PoolItem } from '../../types';
import {
  addItemToPool,
  createPool,
  deletePool,
  deletePoolItem,
  exportPoolPayload,
  importPoolPayload,
  listPools,
  renamePool,
  updatePoolItem,
} from '../../engine/poolStore';
import { PromptPreview } from './PromptPreview';
import { PromptLibrary } from './PromptLibrary';
import { Modal } from './Modal';
import './UserPoolsPage.css';

type UserPoolsPageProps = {
  onAddToPrompt?: (text: string) => void;
  onRandomizePoolItems?: (items: string[]) => void;
  prompt?: any | null;
  customAdditions?: string[];
  onClearPrompt?: () => void;
  onUndoClearPrompt?: () => void;
  canUndoClearPrompt?: boolean;
  freeformPrompt?: string;
  onFreeformPromptChange?: (value: string) => void;
};

export function UserPoolsPage({
  onAddToPrompt,
  onRandomizePoolItems,
  prompt,
  customAdditions = [],
  onClearPrompt,
  onUndoClearPrompt,
  canUndoClearPrompt = false,
  freeformPrompt = '',
  onFreeformPromptChange,
}: UserPoolsPageProps) {
  const [pools, setPools] = useState<Pool[]>(() => listPools());
  const [activePoolId, setActivePoolId] = useState<string | null>(pools[0]?.id ?? null);
  const [newPoolName, setNewPoolName] = useState('');
  const [editingPoolId, setEditingPoolId] = useState<string | null>(null);
  const [editingPoolName, setEditingPoolName] = useState('');
  const [poolError, setPoolError] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [newItemTags, setNewItemTags] = useState('');
  const [newItemNote, setNewItemNote] = useState('');
  const [itemError, setItemError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [editingItemTags, setEditingItemTags] = useState('');
  const [editingItemNote, setEditingItemNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [poolJson, setPoolJson] = useState('');
  const [poolJsonMessage, setPoolJsonMessage] = useState<string | null>(null);
  const [poolJsonError, setPoolJsonError] = useState<string | null>(null);
  const [isRandomizerOpen, setIsRandomizerOpen] = useState(false);
  const [randomizerError, setRandomizerError] = useState<string | null>(null);
  const [randomizerPoolSelection, setRandomizerPoolSelection] = useState<Map<string, boolean>>(new Map());
  const [randomizerCountPerPool, setRandomizerCountPerPool] = useState(2);
  const [randomizerAllowDuplicates, setRandomizerAllowDuplicates] = useState(false);
  const [randomizerTagMode, setRandomizerTagMode] = useState<'any' | 'only' | 'prefer'>('any');
  const [randomizerTagInput, setRandomizerTagInput] = useState('');

  const activePool = useMemo(
    () => pools.find(pool => pool.id === activePoolId) ?? null,
    [pools, activePoolId]
  );

  const filteredItems = useMemo(() => {
    if (!activePool) return [];
    const term = searchTerm.trim().toLowerCase();
    const tagTerm = tagFilter.trim().toLowerCase();
    return activePool.items.filter(item => {
      const textMatch = term ? item.text.toLowerCase().includes(term) : true;
      const tags = item.tags || [];
      const tagMatch = tagTerm ? tags.some(tag => tag.toLowerCase().includes(tagTerm)) : true;
      return textMatch && tagMatch;
    });
  }, [activePool, searchTerm, tagFilter]);

  const refreshPools = () => {
    const next = listPools();
    setPools(next);
    if (next.length === 0) {
      setActivePoolId(null);
    } else if (!next.find(pool => pool.id === activePoolId)) {
      setActivePoolId(next[0].id);
    }
  };

  useEffect(() => {
    setRandomizerPoolSelection(prev => {
      const next = new Map(prev);
      pools.forEach(pool => {
        if (!next.has(pool.id)) {
          next.set(pool.id, true);
        }
      });
      return next;
    });
  }, [pools]);

  const handleCreatePool = () => {
    setPoolError(null);
    try {
      const created = createPool(newPoolName);
      setNewPoolName('');
      refreshPools();
      setActivePoolId(created.id);
    } catch (err: any) {
      setPoolError(err?.message ?? 'Failed to create pool.');
    }
  };

  const handleDeletePool = (poolId: string) => {
    deletePool(poolId);
    refreshPools();
  };

  const handleStartRename = (pool: Pool) => {
    setEditingPoolId(pool.id);
    setEditingPoolName(pool.name);
  };

  const handleRenamePool = (poolId: string) => {
    setPoolError(null);
    try {
      renamePool(poolId, editingPoolName);
      setEditingPoolId(null);
      setEditingPoolName('');
      refreshPools();
    } catch (err: any) {
      setPoolError(err?.message ?? 'Failed to rename pool.');
    }
  };

  const parseTags = (raw: string) =>
    raw
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

  const handleAddItem = () => {
    if (!activePool) {
      setItemError('Select a pool first.');
      return;
    }
    setItemError(null);
    try {
      addItemToPool(activePool.id, newItemText, parseTags(newItemTags), newItemNote);
      setNewItemText('');
      setNewItemTags('');
      setNewItemNote('');
      refreshPools();
    } catch (err: any) {
      setItemError(err?.message ?? 'Failed to add item.');
    }
  };

  const parseBulkLine = (line: string): { text: string; tags?: string[] } | null => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const [textPart, tagPart] = trimmed.split('|').map(part => part.trim());
    if (!textPart) return null;
    const tags = tagPart ? parseTags(tagPart) : undefined;
    return { text: textPart, tags };
  };

  const handleBulkAdd = () => {
    if (!activePool) {
      setBulkError('Select a pool first.');
      return;
    }
    setBulkError(null);
    const lines = bulkText.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      setBulkError('Bulk input is empty.');
      return;
    }
    try {
      lines.forEach(line => {
        const parsed = parseBulkLine(line);
        if (parsed) {
          addItemToPool(activePool.id, parsed.text, parsed.tags);
        }
      });
      setBulkText('');
      refreshPools();
    } catch (err: any) {
      setBulkError(err?.message ?? 'Failed to bulk add items.');
    }
  };

  const handleExportPoolJson = () => {
    if (!activePool) {
      setPoolJsonError('Select a pool first.');
      return;
    }
    try {
      const payload = exportPoolPayload(activePool.id);
      setPoolJson(JSON.stringify(payload, null, 2));
      setPoolJsonMessage('Exported pool JSON.');
      setPoolJsonError(null);
    } catch (err: any) {
      setPoolJsonError(err?.message ?? 'Failed to export pool.');
    }
  };

  const handleImportPoolJson = () => {
    try {
      const parsed = JSON.parse(poolJson);
      const imported = importPoolPayload(parsed, 'replace');
      setPoolJsonMessage(`Imported pool "${imported.name}".`);
      setPoolJsonError(null);
      refreshPools();
      setActivePoolId(imported.id);
    } catch (err: any) {
      setPoolJsonError(err?.message ?? 'Invalid pool JSON.');
    }
  };

  const handleDownloadPoolJson = () => {
    if (!activePool) {
      setPoolJsonError('Select a pool first.');
      return;
    }
    try {
      const payload = exportPoolPayload(activePool.id);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = activePool.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      link.download = `${safeName || 'pool'}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setPoolJsonMessage('Downloaded pool JSON.');
      setPoolJsonError(null);
    } catch (err: any) {
      setPoolJsonError(err?.message ?? 'Failed to download pool.');
    }
  };

  const handleStartEditItem = (item: PoolItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
    setEditingItemTags((item.tags || []).join(', '));
    setEditingItemNote(item.note ?? '');
  };

  const handleSaveItem = (poolId: string, item: PoolItem) => {
    setItemError(null);
    try {
      const updated: PoolItem = {
        ...item,
        text: editingItemText.trim(),
        tags: parseTags(editingItemTags),
        note: editingItemNote.trim() || undefined,
      };
      updatePoolItem(poolId, updated);
      setEditingItemId(null);
      setEditingItemText('');
      setEditingItemTags('');
      setEditingItemNote('');
      refreshPools();
    } catch (err: any) {
      setItemError(err?.message ?? 'Failed to update item.');
    }
  };

  const toggleRandomizerPool = (poolId: string) => {
    setRandomizerPoolSelection(prev => {
      const next = new Map(prev);
      next.set(poolId, !(prev.get(poolId) ?? true));
      return next;
    });
  };

  const parseRandomizerTags = () =>
    randomizerTagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

  const pickRandomItems = () => {
    if (!onRandomizePoolItems) return;
    setRandomizerError(null);

    const selectedPools = pools.filter(pool => randomizerPoolSelection.get(pool.id));
    if (selectedPools.length === 0) {
      setRandomizerError('Select at least one pool.');
      return;
    }

    const requestedCount = Math.max(1, Math.min(50, randomizerCountPerPool));
    const filterTags = parseRandomizerTags().map(tag => tag.toLowerCase());
    const hasTagFilter = filterTags.length > 0 && randomizerTagMode !== 'any';
    const usedItemIds = new Set<string>();
    const output: string[] = [];

    const matchesTags = (item: PoolItem) => {
      const tags = item.tags || [];
      if (filterTags.length === 0) return true;
      return tags.some(tag => filterTags.includes(tag.toLowerCase()));
    };

    const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

    selectedPools.forEach(pool => {
      let candidates = pool.items;
      if (hasTagFilter && randomizerTagMode === 'only') {
        candidates = candidates.filter(matchesTags);
      }

      if (candidates.length === 0) {
        return;
      }

      let tagged: PoolItem[] = [];
      let fallback: PoolItem[] = [];
      if (hasTagFilter && randomizerTagMode === 'prefer') {
        tagged = candidates.filter(matchesTags);
        fallback = candidates.filter(item => !matchesTags(item));
      } else {
        tagged = candidates;
      }

      const selection: PoolItem[] = [];
      const takeFrom = (source: PoolItem[]) => {
        const shuffled = shuffle(source);
        for (const item of shuffled) {
          if (selection.length >= requestedCount) break;
          if (!randomizerAllowDuplicates && usedItemIds.has(item.id)) {
            continue;
          }
          selection.push(item);
          usedItemIds.add(item.id);
        }
      };

      takeFrom(tagged);
      if (selection.length < requestedCount && hasTagFilter && randomizerTagMode === 'prefer') {
        takeFrom(fallback);
      }

      selection.forEach(item => output.push(item.text));
    });

    if (output.length === 0) {
      setRandomizerError('No items matched the current settings.');
      return;
    }

    onRandomizePoolItems(output);
    setIsRandomizerOpen(false);
  };

  const handleClearRandomizerOutput = () => {
    if (!onRandomizePoolItems) return;
    onRandomizePoolItems([]);
  };

  return (
    <div className="user-pools-page">
      <header className="user-pools-header">
        <div>
          <h2>User Pools</h2>
          <p>Create and manage your own prompt element pools.</p>
        </div>
      </header>

      <div className="user-pools-guide">
        <div>
          <strong>Quick start:</strong> Create a pool → add items → click “Add to Prompt”.
        </div>
      </div>

      <div className="user-pools-layout">
        <section className="user-pools-panel user-pools-panel-main">
          <div className="user-pools-panel-header">
            <h3>Pools</h3>
            <button type="button" onClick={() => setIsRandomizerOpen(true)}>
              Randomize
            </button>
          </div>
          <div className="user-pools-create">
            <input
              type="text"
              placeholder="Pool name"
              value={newPoolName}
              onChange={event => setNewPoolName(event.target.value)}
            />
            <button type="button" onClick={handleCreatePool}>
              Create
            </button>
          </div>
          {poolError && <div className="user-pools-error">{poolError}</div>}
          <div className="user-pools-list">
            {pools.length === 0 ? (
              <div className="user-pools-empty">No pools yet. Create one above.</div>
            ) : (
              pools.map(pool => (
                <div
                  key={pool.id}
                  className={`user-pools-row ${pool.id === activePoolId ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="user-pools-row-main"
                    onClick={() => setActivePoolId(pool.id)}
                  >
                    <div className="user-pools-row-name">{pool.name}</div>
                    <div className="user-pools-row-meta">
                      {pool.items.length} items • {new Date(pool.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <div className="user-pools-row-actions">
                    {editingPoolId === pool.id ? (
                      <>
                        <input
                          type="text"
                          value={editingPoolName}
                          onChange={event => setEditingPoolName(event.target.value)}
                        />
                        <button type="button" onClick={() => handleRenamePool(pool.id)}>
                          Save
                        </button>
                        <button type="button" onClick={() => setEditingPoolId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => handleStartRename(pool)}>
                          Rename
                        </button>
                        <button type="button" onClick={() => handleDeletePool(pool.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="user-pools-panel user-pools-panel-main">
          <div className="user-pools-panel-header">
            <h3>Pool Items</h3>
            {activePool && <span className="user-pools-active-name">{activePool.name}</span>}
          </div>
          {!activePool ? (
            <div className="user-pools-empty">Select a pool to view and add items.</div>
          ) : (
            <>
              <div className="user-pools-helper">
                Add items as reusable prompt fragments. Use tags to organize.
              </div>
              <div className="user-pools-filters">
                <input
                  type="text"
                  placeholder="Search items"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                />
                <input
                  type="text"
                  placeholder="Filter by tag"
                  value={tagFilter}
                  onChange={event => setTagFilter(event.target.value)}
                />
              </div>
              <div className="user-pools-items-create">
                <input
                  type="text"
                  placeholder="Item text"
                  value={newItemText}
                  onChange={event => setNewItemText(event.target.value)}
                />
                <input
                  type="text"
                  placeholder="Tags (comma)"
                  value={newItemTags}
                  onChange={event => setNewItemTags(event.target.value)}
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={newItemNote}
                  onChange={event => setNewItemNote(event.target.value)}
                />
                <button type="button" onClick={handleAddItem}>
                  Add Item
                </button>
              </div>
              <div className="user-pools-bulk">
                <div className="user-pools-helper">
                  Bulk add: one item per line. Optional tags after “|”.
                </div>
                <textarea
                  rows={4}
                  placeholder="Bulk add: one item per line. Optional tags after | (e.g., big tree | nature, forest)"
                  value={bulkText}
                  onChange={event => setBulkText(event.target.value)}
                />
                <button type="button" onClick={handleBulkAdd}>
                  Bulk Add
                </button>
                {bulkError && <div className="user-pools-error">{bulkError}</div>}
              </div>
              <details className="user-pools-advanced">
                <summary>Import / Export</summary>
                <div className="user-pools-json">
                  <textarea
                    rows={5}
                    placeholder="Pool JSON import/export"
                    value={poolJson}
                    onChange={event => setPoolJson(event.target.value)}
                  />
                  <div className="user-pools-json-actions">
                    <button type="button" onClick={handleExportPoolJson}>
                      Export Pool
                    </button>
                    <button type="button" onClick={handleImportPoolJson}>
                      Import Pool
                    </button>
                    <button type="button" onClick={handleDownloadPoolJson}>
                      Download Pool
                    </button>
                  </div>
                  {poolJsonError && <div className="user-pools-error">{poolJsonError}</div>}
                  {poolJsonMessage && <div className="user-pools-message">{poolJsonMessage}</div>}
                </div>
              </details>
              {itemError && <div className="user-pools-error">{itemError}</div>}
              <div className="user-pools-items">
                {activePool.items.length === 0 ? (
                  <div className="user-pools-empty">No items yet.</div>
                ) : filteredItems.length === 0 ? (
                  <div className="user-pools-empty">No items match your search or tag filter.</div>
                ) : (
                  filteredItems.map(item => (
                    <div key={item.id} className="user-pools-item">
                      <div className="user-pools-item-content">
                        {editingItemId === item.id ? (
                          <>
                            <input
                              type="text"
                              value={editingItemText}
                              onChange={event => setEditingItemText(event.target.value)}
                            />
                            <input
                              type="text"
                              value={editingItemTags}
                              onChange={event => setEditingItemTags(event.target.value)}
                            />
                            <input
                              type="text"
                              value={editingItemNote}
                              onChange={event => setEditingItemNote(event.target.value)}
                            />
                          </>
                        ) : (
                          <>
                            <div className="user-pools-item-text">{item.text}</div>
                            {item.tags && item.tags.length > 0 && (
                              <div className="user-pools-item-tags">{item.tags.join(', ')}</div>
                            )}
                            {item.note && <div className="user-pools-item-note">{item.note}</div>}
                          </>
                        )}
                      </div>
                      <div className="user-pools-item-actions">
                        {editingItemId === item.id ? (
                          <>
                            <button type="button" onClick={() => handleSaveItem(activePool.id, item)}>
                              Save
                            </button>
                            <button type="button" onClick={() => setEditingItemId(null)}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => onAddToPrompt?.(item.text)}>
                              Add to Prompt
                            </button>
                            <button type="button" onClick={() => handleStartEditItem(item)}>
                              Edit
                            </button>
                            <button type="button" onClick={() => deletePoolItem(activePool.id, item.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
        <aside className="user-pools-panel user-pools-panel-sidebar">
          <div className="user-pools-panel-header">
            <h3>Main Prompt</h3>
          </div>
          <div className="freeform-prompt-panel">
            <div className="freeform-prompt-header">
              <h3>Freeform Prompt</h3>
              <span>Type anything</span>
            </div>
            <textarea
              rows={4}
              placeholder="Write a full prompt here..."
              value={freeformPrompt}
              onChange={event => onFreeformPromptChange?.(event.target.value)}
            />
          </div>
          <PromptPreview
            prompt={prompt ?? null}
            customAdditions={customAdditions}
            freeformPrompt={freeformPrompt}
            onClear={onClearPrompt}
            onUndoClear={onUndoClearPrompt}
            canUndoClear={canUndoClearPrompt}
          />
          <PromptLibrary
            prompt={prompt ?? null}
            customAdditions={customAdditions}
            onAddToPrompt={onAddToPrompt}
          />
        </aside>
      </div>

      <Modal
        isOpen={isRandomizerOpen}
        onClose={() => setIsRandomizerOpen(false)}
        title="Randomize From User Pools"
        className="user-pools-randomizer-modal"
      >
        <div className="user-pools-randomizer">
          <div className="user-pools-randomizer-section">
            <div className="user-pools-randomizer-label">Pools to include</div>
            {pools.length === 0 ? (
              <div className="user-pools-empty">No pools available.</div>
            ) : (
              <div className="user-pools-randomizer-pools">
                {pools.map(pool => (
                  <label key={pool.id} className="user-pools-randomizer-pool">
                    <input
                      type="checkbox"
                      checked={randomizerPoolSelection.get(pool.id) ?? false}
                      onChange={() => toggleRandomizerPool(pool.id)}
                    />
                    <span>{pool.name}</span>
                    <span className="user-pools-randomizer-pool-count">{pool.items.length}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="user-pools-randomizer-row">
            <label className="user-pools-randomizer-field">
              Items per pool
              <input
                type="number"
                min="1"
                max="50"
                value={randomizerCountPerPool}
                onChange={event => setRandomizerCountPerPool(parseInt(event.target.value) || 1)}
              />
            </label>
            <label className="user-pools-randomizer-toggle">
              <input
                type="checkbox"
                checked={randomizerAllowDuplicates}
                onChange={event => setRandomizerAllowDuplicates(event.target.checked)}
              />
              Allow duplicates across pools
            </label>
          </div>

          <div className="user-pools-randomizer-section">
            <div className="user-pools-randomizer-label">Tag filter</div>
            <div className="user-pools-randomizer-row">
              <label className="user-pools-randomizer-field">
                Mode
                <select
                  value={randomizerTagMode}
                  onChange={event => setRandomizerTagMode(event.target.value as 'any' | 'only' | 'prefer')}
                >
                  <option value="any">Any tags</option>
                  <option value="only">Only tagged</option>
                  <option value="prefer">Prefer tagged</option>
                </select>
              </label>
              <label className="user-pools-randomizer-field">
                Tags (comma)
                <input
                  type="text"
                  placeholder="portrait, cinematic"
                  value={randomizerTagInput}
                  onChange={event => setRandomizerTagInput(event.target.value)}
                />
              </label>
            </div>
          </div>

          {randomizerError && <div className="user-pools-error">{randomizerError}</div>}

          <div className="user-pools-randomizer-actions">
            <button type="button" onClick={pickRandomItems}>
              Generate Random Prompt
            </button>
            <button type="button" onClick={pickRandomItems}>
              Re-roll
            </button>
            <button type="button" onClick={handleClearRandomizerOutput}>
              Clear Random Selections
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
