import { useMemo, useState } from 'react';
import type { WorkingSet } from '../../types';
import './WorkingSetBuilder.css';

type WorkingSetBuilderProps = {
  workingSet: WorkingSet;
  categoryOrder: string[];
  onAddItem: (text: string) => void;
};

const formatCategoryLabel = (categoryId: string) =>
  categoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export function WorkingSetBuilder({ workingSet, categoryOrder, onAddItem }: WorkingSetBuilderProps) {
  const [filter, setFilter] = useState('');
  const trimmed = filter.trim().toLowerCase();

  const filteredBuckets = useMemo(() => {
    if (!trimmed) return workingSet.categoryBuckets;
    const next: Record<string, typeof workingSet.categoryBuckets[string]> = {};
    Object.entries(workingSet.categoryBuckets).forEach(([categoryId, items]) => {
      const filtered = items.filter(item => item.text.toLowerCase().includes(trimmed));
      if (filtered.length > 0) {
        next[categoryId] = filtered;
      }
    });
    return next;
  }, [workingSet.categoryBuckets, trimmed]);

  return (
    <div className="question-card working-set-builder-card">
      <div className="question-card-header">
        <div className="question-card-step">Working Set Active</div>
      </div>
      <div className="question-card-content working-set-builder">
        <h2 className="question-card-title">{workingSet.name}</h2>
        <p className="question-card-description">
          Only elements from this working set are shown. Click an element to add it to your prompt.
        </p>
        <label className="working-set-builder-filter">
          Search
          <input
            type="text"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            placeholder="Filter elements"
          />
        </label>
        <div className="working-set-builder-grid">
          {categoryOrder.map(categoryId => {
            const items = (trimmed ? filteredBuckets[categoryId] : workingSet.categoryBuckets[categoryId]) ?? [];
            if (trimmed && !filteredBuckets[categoryId]) {
              return null;
            }
            return (
              <section key={categoryId} className="working-set-builder-category">
                <div className="working-set-builder-category-header">
                  <h3>{formatCategoryLabel(categoryId)}</h3>
                  <span>{items.length} items</span>
                </div>
                {items.length === 0 ? (
                  <div className="working-set-builder-empty">No elements yet.</div>
                ) : (
                  <div className="question-card-options working-set-builder-list">
                    {items.map(item => (
                      <button
                        type="button"
                        key={item.id}
                        className="attribute-item working-set-builder-item"
                        onClick={() => onAddItem(item.text)}
                      >
                        <span className="attribute-label">{item.text}</span>
                        <span className="working-set-builder-item-action">Add</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
