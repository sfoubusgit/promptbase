/**
 * Category Sidebar Component
 * 
 * Responsibilities:
 * - Display category structure (tree view)
 * - Show expand/collapse controls
 * - Indicate which categories have selections
 * - Highlight current category
 * - Handle category navigation
 * - Display logo
 * 
 * Must NOT:
 * - Determine which categories are available
 * - Compute which categories have selections
 * - Store category structure internally
 * - Validate navigation targets
 */

import { useState } from 'react';
import './CategorySidebar.css';

/**
 * Category item structure for display
 */
interface CategoryItem {
  label: string;
  nodeId?: string;
  subcategories?: CategoryItem[];
}

/**
 * Category map structure
 */
interface CategoryMap {
  [categoryId: string]: CategoryItem[];
}

interface CategorySidebarProps {
  /** Category structure to display */
  categoryMap: CategoryMap;
  
  /** Current node ID for highlighting */
  currentNodeId: string;
  
  /** Map of selections to determine which categories have selections */
  selections: Map<string, { isEnabled: boolean; customExtension: string | null }>;
  
  /** Handler for category navigation */
  onJumpToCategory: (nodeId: string) => void;
}

/**
 * Helper to get display name for category
 */
const getCategoryDisplayName = (categoryId: string): string => {
  const names: Record<string, string> = {
    character: "Character",
    physical: "Physical",
    hair: "Hair",
    face: "Face",
    environment: "Environment",
    style: "Style",
    camera: "Camera",
    effects: "Effects",
    "anatomy-details": "Anatomy Details",
    subject: "Subject",
    lighting: "Lighting",
    quality: "Quality",
    "post-processing": "Post-Processing",
    actions: "Actions"
  };
  return names[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};

/**
 * Collect all node IDs from a category item (including subcategories)
 */
const collectNodeIds = (items: CategoryItem[]): string[] => {
  const nodeIds: string[] = [];
  items.forEach(item => {
    if (item.nodeId) {
      nodeIds.push(item.nodeId);
    }
    if (item.subcategories) {
      nodeIds.push(...collectNodeIds(item.subcategories));
    }
  });
  return nodeIds;
};

/**
 * Category Sidebar Component
 * 
 * Displays category tree and allows navigation to categories.
 */
export function CategorySidebar({
  categoryMap,
  currentNodeId,
  selections,
  onJumpToCategory,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Check if a category has selections
  const hasCommitted = (nodeIds: string[]): boolean => {
    return nodeIds.some(nodeId => {
      // Check if any selection attribute ID starts with or matches this node
      return Array.from(selections.keys()).some(selectionId => {
        // Match by checking if selection ID contains node ID or vice versa
        return selectionId.includes(nodeId) || nodeId.includes(selectionId);
      });
    });
  };

  // Check if current node belongs to a category
  const isCategoryActive = (items: CategoryItem[]): boolean => {
    if (!currentNodeId) return false;
    const nodeIds = collectNodeIds(items);
    return nodeIds.includes(currentNodeId);
  };

  // Check if a specific node is active
  const isNodeActive = (nodeId: string): boolean => {
    return currentNodeId === nodeId;
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryKey)) {
        newSet.delete(subcategoryKey);
      } else {
        newSet.add(subcategoryKey);
      }
      return newSet;
    });
  };

  // Check if a category item has committed selections
  const itemHasCommitted = (item: CategoryItem): boolean => {
    const nodeIds: string[] = [];
    if (item.nodeId) {
      nodeIds.push(item.nodeId);
    }
    if (item.subcategories) {
      item.subcategories.forEach(sub => {
        if (sub.nodeId) {
          nodeIds.push(sub.nodeId);
        }
        if (sub.subcategories) {
          sub.subcategories.forEach(nested => {
            if (nested.nodeId) {
              nodeIds.push(nested.nodeId);
            }
          });
        }
      });
    }
    return nodeIds.length > 0 && hasCommitted(nodeIds);
  };

  return (
    <div className="category-sidebar">
      <div className="category-sidebar-logo">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="logo-text">
          <span className="logo-text-main">SD Prompt</span>
          <span className="logo-text-sub">Generator</span>
        </div>
      </div>
      <div className="category-sidebar-content">
        <div className="category-sidebar-header">
          <div className="category-sidebar-divider"></div>
        </div>
        <div className="category-sidebar-list">
          <div className="category-sidebar-title-wrapper">
            <h3 className="category-sidebar-title">Categories</h3>
          </div>
          {Object.entries(categoryMap).map(([categoryId, items]) => {
            const allNodeIds = collectNodeIds(items);
            const visited = hasCommitted(allNodeIds);
            const active = isCategoryActive(items);
            const firstNode = items[0]?.nodeId || items[0]?.subcategories?.[0]?.nodeId;
            const isExpanded = expandedCategories.has(categoryId);

            return (
              <div key={categoryId} className="category-group">
                <div
                  className={`category-item ${visited ? "visited" : ""} ${active ? "active" : ""}`}
                  onClick={() => firstNode && onJumpToCategory(firstNode)}
                  title={`Jump to ${getCategoryDisplayName(categoryId)}`}
                >
                  <div className="category-item-main">
                    <span className="category-item-label">
                      {getCategoryDisplayName(categoryId)}
                    </span>
                    {visited && <span className="dot-indicator" title="Has committed selections" />}
                  </div>
                  <button
                    className={`category-expand-button ${isExpanded ? "expanded" : ""}`}
                    onClick={(e) => toggleCategory(categoryId, e)}
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {isExpanded && (
                  <div className="category-dropdown">
                    {items.map((item, index) => {
                      const itemKey = `${categoryId}-${index}`;
                      const hasSubcategories = item.subcategories && item.subcategories.length > 0;
                      const isSubcategoryExpanded = expandedSubcategories.has(itemKey);
                      const itemNodeIds = item.nodeId ? [item.nodeId] : [];
                      if (item.subcategories) {
                        item.subcategories.forEach(sub => {
                          if (sub.nodeId) itemNodeIds.push(sub.nodeId);
                          if (sub.subcategories) {
                            sub.subcategories.forEach(nested => {
                              if (nested.nodeId) itemNodeIds.push(nested.nodeId);
                            });
                          }
                        });
                      }
                      const itemVisited = itemNodeIds.length > 0 && hasCommitted(itemNodeIds);
                      const itemActive = item.nodeId ? isNodeActive(item.nodeId) : false;

                      return (
                        <div key={itemKey} className="category-subcategory-group">
                          <div
                            className={`category-dropdown-item ${itemActive ? "active" : ""} ${itemVisited ? "visited" : ""} ${hasSubcategories ? "has-subcategories" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('[CategorySidebar] Item clicked:', item.label, 'nodeId:', item.nodeId, 'hasSubcategories:', hasSubcategories);
                              // If item has a nodeId, navigate to it (this is a subcategory)
                              if (item.nodeId) {
                                console.log('[CategorySidebar] Navigating to:', item.nodeId);
                                onJumpToCategory(item.nodeId);
                              } else if (hasSubcategories) {
                                // If item has subcategories but no nodeId, toggle expansion
                                console.log('[CategorySidebar] Toggling subcategory expansion');
                                toggleSubcategory(itemKey, e);
                              } else {
                                console.warn('[CategorySidebar] Item has no nodeId and no subcategories:', item);
                              }
                            }}
                            title={item.label}
                          >
                            <div className="category-dropdown-item-main">
                              <span className="category-dropdown-label">
                                {item.label}
                              </span>
                              {itemVisited && <span className="dot-indicator" title="Has committed selections" />}
                            </div>
                            {hasSubcategories && (
                              <button
                                className={`category-expand-button ${isSubcategoryExpanded ? "expanded" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubcategory(itemKey, e);
                                }}
                                title={isSubcategoryExpanded ? "Collapse" : "Expand"}
                              >
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            )}
                          </div>
                          {hasSubcategories && isSubcategoryExpanded && (
                            <div className="category-subcategory-dropdown">
                              {item.subcategories!.map((subItem, subIndex) => {
                                const subItemKey = `${itemKey}-${subIndex}`;
                                const subActive = subItem.nodeId ? isNodeActive(subItem.nodeId) : false;
                                const subNodeIds: string[] = [];
                                if (subItem.nodeId) subNodeIds.push(subItem.nodeId);
                                if (subItem.subcategories) {
                                  subItem.subcategories.forEach(nested => {
                                    if (nested.nodeId) subNodeIds.push(nested.nodeId);
                                  });
                                }
                                const subVisited = subNodeIds.length > 0 && hasCommitted(subNodeIds);
                                
                                return (
                                  <div
                                    key={subItemKey}
                                    className={`category-subcategory-item ${subActive ? "active" : ""} ${subVisited ? "visited" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (subItem.nodeId) {
                                        onJumpToCategory(subItem.nodeId);
                                      }
                                    }}
                                    title={subItem.label}
                                  >
                                    <span className="category-subcategory-label">
                                      {subItem.label}
                                    </span>
                                    {subVisited && <span className="dot-indicator" title="Has committed selections" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


