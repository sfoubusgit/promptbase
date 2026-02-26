import { useEffect, useMemo, useState } from 'react';
import type { Pool, PoolItem, WorkingSet } from '../../types';
import { listPools } from '../../engine/poolStore';
import {
  addWorkingSetHubEntry,
  listWorkingSetHubEntries,
} from '../../engine/workingSetHubStore';
import { exportWorkingSetPayload } from '../../engine/workingSetStore';
import { Modal } from './Modal';
import './WorkingSetsPage.css';

type WorkingSetsPageProps = {
  workingSets: WorkingSet[];
  activeWorkingSetId: string | null;
  categoryOrder: string[];
  onCreateWorkingSet: (name: string) => WorkingSet | null;
  onRenameWorkingSet: (id: string, name: string) => void;
  onDeleteWorkingSet: (id: string) => void;
  onSetActiveWorkingSet: (id: string | null) => void;
  onAddWorkingSetItem: (setId: string, categoryId: string, poolId: string, item: PoolItem) => void;
  onRemoveWorkingSetItem: (setId: string, categoryId: string, itemId: string) => void;
  onClearWorkingSetCategory: (setId: string, categoryId: string) => void;
};

const formatCategoryLabel = (categoryId: string) =>
  categoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export function WorkingSetsPage({
  workingSets,
  activeWorkingSetId,
  categoryOrder,
  onCreateWorkingSet,
  onRenameWorkingSet,
  onDeleteWorkingSet,
  onSetActiveWorkingSet,
  onAddWorkingSetItem,
  onRemoveWorkingSetItem,
  onClearWorkingSetCategory,
}: WorkingSetsPageProps) {
  const [pools, setPools] = useState<Pool[]>(() => listPools());
  const [selectedSetId, setSelectedSetId] = useState<string | null>(workingSets[0]?.id ?? null);
  const [newSetName, setNewSetName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [poolId, setPoolId] = useState<string | null>(pools[0]?.id ?? null);
  const [categoryId, setCategoryId] = useState<string>(categoryOrder[0] ?? 'subject');
  const [itemFilter, setItemFilter] = useState('');
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    title: '',
    summary: '',
    description: '',
    category: 'General',
    tags: '',
    language: 'en',
    license: 'CC-BY',
    heroImageUrl: '',
  });
  const [confirmRights, setConfirmRights] = useState(false);
  const [confirmPrivacy, setConfirmPrivacy] = useState(false);

  useEffect(() => {
    if (selectedSetId && workingSets.some(set => set.id === selectedSetId)) return;
    setSelectedSetId(workingSets[0]?.id ?? null);
  }, [selectedSetId, workingSets]);

  useEffect(() => {
    const target = workingSets.find(set => set.id === selectedSetId);
    setRenameValue(target?.name ?? '');
  }, [selectedSetId, workingSets]);

  useEffect(() => {
    if (poolId && pools.some(pool => pool.id === poolId)) return;
    setPoolId(pools[0]?.id ?? null);
  }, [poolId, pools]);

  const selectedSet = workingSets.find(set => set.id === selectedSetId) ?? null;
  const selectedPool = pools.find(pool => pool.id === poolId) ?? null;
  const isActiveSet = selectedSet?.id === activeWorkingSetId;

  const filteredItems = useMemo(() => {
    if (!selectedPool) return [];
    const trimmed = itemFilter.trim().toLowerCase();
    if (!trimmed) return selectedPool.items;
    return selectedPool.items.filter(item => item.text.toLowerCase().includes(trimmed));
  }, [selectedPool, itemFilter]);

  const handleCreate = () => {
    const trimmed = newSetName.trim();
    if (!trimmed) {
      setPageMessage('Enter a name for the working set.');
      return;
    }
    const created = onCreateWorkingSet(trimmed);
    if (created) {
      setSelectedSetId(created.id);
      setNewSetName('');
      setPageMessage(`Created "${created.name}".`);
    }
  };

  const handleRename = () => {
    if (!selectedSet) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    onRenameWorkingSet(selectedSet.id, trimmed);
    setPageMessage('Working set renamed.');
  };

  const handleDelete = () => {
    if (!selectedSet) return;
    onDeleteWorkingSet(selectedSet.id);
    setPageMessage('Working set deleted.');
  };

  const handlePublish = () => {
    if (!selectedSet) return;
    setPublishError(null);
    setPublishMessage(null);
    setPublishForm({
      title: selectedSet.name,
      summary: '',
      description: '',
      category: 'General',
      tags: '',
      language: 'en',
      license: 'CC-BY',
      heroImageUrl: '',
    });
    setConfirmRights(false);
    setConfirmPrivacy(false);
    setIsPublishOpen(true);
  };

  const handleConfirmPublish = () => {
    if (!selectedSet) return;
    const title = publishForm.title.trim();
    const summary = publishForm.summary.trim();
    const description = publishForm.description.trim();
    const category = publishForm.category.trim();
    const tags = publishForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    const language = publishForm.language.trim() || 'en';
    const license = publishForm.license.trim() || 'CC-BY';

    if (!title || !summary || !description || !category || tags.length === 0) {
      setPublishError('Please complete title, summary, description, category, and at least one tag.');
      return;
    }
    if (!confirmRights || !confirmPrivacy) {
      setPublishError('Please confirm the publishing checks.');
      return;
    }

    try {
      const payload = exportWorkingSetPayload(selectedSet.id);
      const existing = listWorkingSetHubEntries().some(entry =>
        entry.title.toLowerCase() === title.toLowerCase()
      );
      if (existing) {
        setPublishError('A Working Set with this title already exists in the Hub.');
        return;
      }
      const now = Date.now();
      addWorkingSetHubEntry({
        id: `hub_ws_${now}_${Math.random().toString(36).slice(2, 6)}`,
        creator: 'You',
        title,
        summary,
        description,
        tags,
        category,
        languages: [language],
        license,
        heroImageUrl: publishForm.heroImageUrl.trim() || null,
        ratingAvg: 0,
        ratingCount: 0,
        downloads: 0,
        createdAt: now,
        updatedAt: now,
        payload: payload.workingSet,
      });
      setPublishMessage('Working Set published to Pool Hub.');
      setPublishError(null);
      setIsPublishOpen(false);
    } catch (err: any) {
      setPublishError(err?.message ?? 'Failed to publish Working Set.');
    }
  };

  const handleAddItem = (item: PoolItem) => {
    if (!selectedSet || !selectedPool) {
      setPageMessage('Select a working set and pool first.');
      return;
    }
    onAddWorkingSetItem(selectedSet.id, categoryId, selectedPool.id, item);
    setPageMessage(`Added to ${formatCategoryLabel(categoryId)}.`);
  };

  const handleActivate = () => {
    if (!selectedSet) return;
    onSetActiveWorkingSet(selectedSet.id);
    setPageMessage(`"${selectedSet.name}" is now active.`);
  };

  const handleRefreshPools = () => {
    setPools(listPools());
    setPageMessage('Pools refreshed.');
  };

  return (
    <div className="working-sets-page">
      <header className="working-sets-header">
        <div>
          <h1>Working Sets</h1>
          <p>Create structured sets of prompt elements and activate them inside the Builder.</p>
        </div>
        <div className="working-sets-create">
          <input
            type="text"
            value={newSetName}
            onChange={event => setNewSetName(event.target.value)}
            placeholder="New working set name"
          />
          <button type="button" onClick={handleCreate}>
            Create
          </button>
        </div>
      </header>

      {pageMessage && <div className="working-sets-message">{pageMessage}</div>}

      <div className="working-sets-layout">
        <section className="working-sets-panel working-sets-panel-list">
          <div className="working-sets-panel-title">
            <h2>Your Sets</h2>
            <button type="button" className="working-sets-refresh" onClick={handleRefreshPools}>
              Refresh Pools
            </button>
          </div>
          <div className="working-sets-list">
            {workingSets.length === 0 ? (
              <div className="working-sets-empty">No working sets yet.</div>
            ) : (
              workingSets.map(set => (
                <button
                  key={set.id}
                  type="button"
                  className={`working-sets-list-item ${set.id === selectedSetId ? 'active' : ''}`}
                  onClick={() => setSelectedSetId(set.id)}
                >
                  <div className="working-sets-list-name">{set.name}</div>
                  <div className="working-sets-list-meta">
                    {Object.values(set.categoryBuckets).reduce((sum, items) => sum + items.length, 0)} items
                  </div>
                  {set.id === activeWorkingSetId && <span className="working-sets-active-pill">Active</span>}
                </button>
              ))
            )}
          </div>
        </section>

        <section className="working-sets-panel working-sets-panel-detail">
          {selectedSet ? (
            <>
              <div className="working-sets-detail-header">
                <div className="working-sets-detail-title">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={event => setRenameValue(event.target.value)}
                  />
                  <button type="button" onClick={handleRename}>
                    Rename
                  </button>
                </div>
                <div className="working-sets-detail-actions">
                  <button type="button" onClick={handleActivate} disabled={isActiveSet}>
                    {isActiveSet ? 'Active' : 'Activate'}
                  </button>
                  {isActiveSet && (
                    <button type="button" onClick={() => onSetActiveWorkingSet(null)}>
                      Deactivate (Base Set)
                    </button>
                  )}
                  <button type="button" className="working-sets-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="working-sets-publish-row">
                <div className="working-sets-publish-info">
                  Share this working set with the community marketplace.
                </div>
                <button type="button" className="working-sets-publish" onClick={handlePublish}>
                  Publish to Hub
                </button>
              </div>
              {publishMessage && <div className="working-sets-message">{publishMessage}</div>}
              {publishError && <div className="working-sets-error">{publishError}</div>}

              <div className="working-sets-add">
                {pools.length === 0 ? (
                  <div className="working-sets-empty">No pools available. Create a pool in User Pools first.</div>
                ) : (
                  <>
                    <div className="working-sets-add-row">
                      <label>
                        Pool
                        <select
                          value={poolId ?? ''}
                          onChange={event => setPoolId(event.target.value || null)}
                        >
                          {pools.map(pool => (
                            <option key={pool.id} value={pool.id}>
                              {pool.name} ({pool.items.length})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Category
                        <select
                          value={categoryId}
                          onChange={event => setCategoryId(event.target.value)}
                        >
                          {categoryOrder.map(cat => (
                            <option key={cat} value={cat}>
                              {formatCategoryLabel(cat)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Search items
                        <input
                          type="text"
                          value={itemFilter}
                          onChange={event => setItemFilter(event.target.value)}
                          placeholder="Filter pool items"
                        />
                      </label>
                    </div>
                    <div className="working-sets-item-grid">
                      {filteredItems.length === 0 ? (
                        <div className="working-sets-empty">No items found.</div>
                      ) : (
                        filteredItems.map(item => (
                          <div key={item.id} className="working-sets-item-row">
                            <div>
                              <div className="working-sets-item-text">{item.text}</div>
                              {item.tags && item.tags.length > 0 && (
                                <div className="working-sets-item-tags">{item.tags.join(', ')}</div>
                              )}
                            </div>
                            <button type="button" onClick={() => handleAddItem(item)}>
                              Add
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="working-sets-categories">
                {categoryOrder.map(cat => {
                  const bucket = selectedSet.categoryBuckets[cat] ?? [];
                  return (
                    <div key={cat} className="working-sets-category">
                      <div className="working-sets-category-header">
                        <h3>{formatCategoryLabel(cat)}</h3>
                        <div className="working-sets-category-actions">
                          <span>{bucket.length} items</span>
                          <button
                            type="button"
                            className="working-sets-clear"
                            onClick={() => onClearWorkingSetCategory(selectedSet.id, cat)}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      {bucket.length === 0 ? (
                        <div className="working-sets-empty">No elements yet.</div>
                      ) : (
                        <div className="working-sets-category-list">
                          {bucket.map(item => (
                            <div key={item.id} className="working-sets-category-item">
                              <span>{item.text}</span>
                              <button
                                type="button"
                                onClick={() => onRemoveWorkingSetItem(selectedSet.id, cat, item.id)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="working-sets-empty">Select a working set to edit it.</div>
          )}
        </section>
      </div>
      <Modal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        title="Publish Working Set"
        className="working-sets-publish-modal"
      >
        <div className="working-sets-publish-form">
          <div className="working-sets-publish-grid">
            <label>
              Title
              <input
                type="text"
                value={publishForm.title}
                onChange={event => setPublishForm(prev => ({ ...prev, title: event.target.value }))}
                placeholder="Working Set title"
              />
            </label>
            <label>
              Summary
              <input
                type="text"
                value={publishForm.summary}
                onChange={event => setPublishForm(prev => ({ ...prev, summary: event.target.value }))}
                placeholder="Short one-liner"
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={publishForm.category}
                onChange={event => setPublishForm(prev => ({ ...prev, category: event.target.value }))}
                placeholder="General"
              />
            </label>
            <label>
              Language
              <input
                type="text"
                value={publishForm.language}
                onChange={event => setPublishForm(prev => ({ ...prev, language: event.target.value }))}
                placeholder="en"
              />
            </label>
            <label>
              License
              <input
                type="text"
                value={publishForm.license}
                onChange={event => setPublishForm(prev => ({ ...prev, license: event.target.value }))}
                placeholder="CC-BY"
              />
            </label>
            <label>
              Tags (comma)
              <input
                type="text"
                value={publishForm.tags}
                onChange={event => setPublishForm(prev => ({ ...prev, tags: event.target.value }))}
                placeholder="portrait, cinematic"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              rows={4}
              value={publishForm.description}
              onChange={event => setPublishForm(prev => ({ ...prev, description: event.target.value }))}
              placeholder="Describe the working set and best use cases"
            />
          </label>
          <label>
            Hero Image URL (optional)
            <input
              type="text"
              value={publishForm.heroImageUrl}
              onChange={event => setPublishForm(prev => ({ ...prev, heroImageUrl: event.target.value }))}
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
                  setPublishForm(prev => ({ ...prev, heroImageUrl: result }));
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <div className="working-sets-publish-checks">
            <label>
              <input
                type="checkbox"
                checked={confirmRights}
                onChange={event => setConfirmRights(event.target.checked)}
              />
              I confirm I have rights to publish this Working Set.
            </label>
            <label>
              <input
                type="checkbox"
                checked={confirmPrivacy}
                onChange={event => setConfirmPrivacy(event.target.checked)}
              />
              This Working Set does not include personal or sensitive data.
            </label>
          </div>
          {publishError && <div className="working-sets-error">{publishError}</div>}
          <div className="working-sets-publish-actions">
            <button type="button" className="working-sets-secondary" onClick={() => setIsPublishOpen(false)}>
              Cancel
            </button>
            <button type="button" className="working-sets-publish" onClick={handleConfirmPublish}>
              Publish to Hub
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
