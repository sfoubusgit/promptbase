/**
 * Random Prompt Generator Component
 * 
 * Responsibilities:
 * - Display collapsible category/subcategory tree
 * - Allow users to select categories for randomization
 * - Generate random attribute selections
 * - Integrate with engine to apply random selections
 * 
 * Must NOT:
 * - Duplicate engine logic
 * - Store domain rules
 * - Modify prompt directly
 */

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AttributeDefinition, AttributeSelection } from '../../types';
import { QuestionNode } from '../../data/loadQuestionNodes';
import { CategoryItem, CATEGORY_MAP } from '../../data/categoryMap';
import './RandomPromptGenerator.css';

interface RandomPromptGeneratorProps {
  attributeDefinitions: AttributeDefinition[];
  questionNodes: QuestionNode[];
  onRandomize: (selections: AttributeSelection[]) => void;
}

interface CategoryState {
  enabled: boolean;
  expanded: boolean;
  attributeCount: number;
}

interface SubcategoryState {
  enabled: boolean;
  expanded: boolean;
  attributeCount: number;
}

/**
 * Collect all node IDs from a category structure
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
 * Get attributes for a specific node ID
 */
const getAttributesForNode = (
  nodeId: string,
  questionNodes: QuestionNode[],
  attributeDefinitions: AttributeDefinition[]
): AttributeDefinition[] => {
  const node = questionNodes.find(n => n.id === nodeId);
  if (!node || !node.attributeIds) {
    return [];
  }
  
  return attributeDefinitions.filter(def => 
    node.attributeIds.includes(def.id)
  );
};

/**
 * Get all attributes for a category or subcategory
 */
const getAttributesForCategory = (
  items: CategoryItem[],
  questionNodes: QuestionNode[],
  attributeDefinitions: AttributeDefinition[]
): AttributeDefinition[] => {
  const nodeIds = collectNodeIds(items);
  const allAttributes: AttributeDefinition[] = [];
  
  nodeIds.forEach(nodeId => {
    const attributes = getAttributesForNode(nodeId, questionNodes, attributeDefinitions);
    allAttributes.push(...attributes);
  });
  
  // Remove duplicates by ID
  const uniqueAttributes = new Map<string, AttributeDefinition>();
  allAttributes.forEach(attr => {
    uniqueAttributes.set(attr.id, attr);
  });
  
  return Array.from(uniqueAttributes.values());
};

/**
 * Generate random selections from enabled categories
 * Uses per-category/subcategory counts if specified, otherwise uses totalCount
 */
const generateRandomSelections = (
  categoryStates: Map<string, CategoryState>,
  subcategoryStates: Map<string, SubcategoryState>,
  attributeDefinitions: AttributeDefinition[],
  questionNodes: QuestionNode[],
  totalCount: number
): AttributeSelection[] => {
  // Collect selections per category/subcategory with their counts
  const categorySelections: Array<{ attributes: AttributeDefinition[]; count: number }> = [];
  
  Object.entries(CATEGORY_MAP).forEach(([categoryId, items]) => {
    const categoryState = categoryStates.get(categoryId);
    
    // Collect all subcategory keys and check which are enabled
    const enabledSubcategoryKeys = new Set<string>();
    
    items.forEach(item => {
      if (item.subcategories) {
        item.subcategories.forEach(subItem => {
          const subKey = `${categoryId}:${subItem.label}`;
          if (subcategoryStates.get(subKey)?.enabled) {
            enabledSubcategoryKeys.add(subKey);
          }
        });
      } else if (item.nodeId) {
        const subKey = `${categoryId}:${item.label}`;
        if (subcategoryStates.get(subKey)?.enabled) {
          enabledSubcategoryKeys.add(subKey);
        }
      }
    });
    
    // If category is enabled and no subcategories are enabled, include all attributes
    if (categoryState?.enabled && enabledSubcategoryKeys.size === 0) {
      const categoryAttributes = getAttributesForCategory(items, questionNodes, attributeDefinitions);
      const categoryCount = categoryState.attributeCount > 0 
        ? categoryState.attributeCount 
        : totalCount;
      
      if (categoryAttributes.length > 0) {
        categorySelections.push({
          attributes: categoryAttributes,
          count: categoryCount,
        });
      }
    } else {
      // Include attributes from enabled subcategories with their specific counts
      items.forEach(item => {
        if (item.subcategories) {
          item.subcategories.forEach(subItem => {
            const subKey = `${categoryId}:${subItem.label}`;
            const subState = subcategoryStates.get(subKey);
            if (subState?.enabled && subItem.nodeId) {
              const subAttributes = getAttributesForNode(subItem.nodeId, questionNodes, attributeDefinitions);
              const subCount = subState.attributeCount > 0 
                ? subState.attributeCount 
                : (categoryState?.attributeCount > 0 ? categoryState.attributeCount : totalCount);
              
              if (subAttributes.length > 0) {
                categorySelections.push({
                  attributes: subAttributes,
                  count: subCount,
                });
              }
            }
          });
        } else if (item.nodeId) {
          const subKey = `${categoryId}:${item.label}`;
          const subState = subcategoryStates.get(subKey);
          if (subState?.enabled) {
            const subAttributes = getAttributesForNode(item.nodeId, questionNodes, attributeDefinitions);
            const subCount = subState.attributeCount > 0 
              ? subState.attributeCount 
              : (categoryState?.attributeCount > 0 ? categoryState.attributeCount : totalCount);
            
            if (subAttributes.length > 0) {
              categorySelections.push({
                attributes: subAttributes,
                count: subCount,
              });
            }
          }
        }
      });
    }
  });
  
  if (categorySelections.length === 0) {
    return [];
  }
  
  // Generate selections from each category/subcategory
  const allSelections: AttributeSelection[] = [];
  const usedAttributeIds = new Set<string>();
  
  categorySelections.forEach(({ attributes, count }) => {
    // Filter out already used attributes
    const availableAttributes = attributes.filter(attr => !usedAttributeIds.has(attr.id));
    
    if (availableAttributes.length === 0) return;
    
    // Shuffle and select
    const shuffled = [...availableAttributes].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    
    selected.forEach(attr => {
      allSelections.push({
        attributeId: attr.id,
        isEnabled: true,
        customExtension: null,
      });
      usedAttributeIds.add(attr.id);
    });
  });
  
  return allSelections;
};

export function RandomPromptGenerator({
  attributeDefinitions,
  questionNodes,
  onRandomize,
}: RandomPromptGeneratorProps) {
  // State for category/subcategory expansion and selection
  const [categoryStates, setCategoryStates] = useState<Map<string, CategoryState>>(() => {
    const initialStates = new Map<string, CategoryState>();
    Object.keys(CATEGORY_MAP).forEach(categoryId => {
      initialStates.set(categoryId, {
        enabled: false,
        expanded: false,
        attributeCount: 0,
      });
    });
    return initialStates;
  });
  const [subcategoryStates, setSubcategoryStates] = useState<Map<string, SubcategoryState>>(new Map());
  const [attributeCount, setAttributeCount] = useState<number>(5);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const isAllChecked = (): boolean => {
    const allCategoriesEnabled = Object.keys(CATEGORY_MAP).every(categoryId => {
      return categoryStates.get(categoryId)?.enabled === true;
    });

    if (!allCategoriesEnabled) {
      return false;
    }

    const allSubcategoriesEnabled = Object.entries(CATEGORY_MAP).every(([categoryId, items]) => {
      return items.every(item => {
        if (item.subcategories && item.subcategories.length > 0) {
          return item.subcategories.every(subItem => {
            const subKey = `${categoryId}:${subItem.label}`;
            return subcategoryStates.get(subKey)?.enabled === true;
          });
        }
        const subKey = `${categoryId}:${item.label}`;
        return subcategoryStates.get(subKey)?.enabled === true;
      });
    });

    return allSubcategoriesEnabled;
  };
  
  // Get portal container on mount
  useEffect(() => {
    setPortalContainer(document.body);
    
    // Prevent body scroll when tutorial is open
    if (showTutorial) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [showTutorial]);
  
  // Handle Escape key to close tutorial
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTutorial) {
        setShowTutorial(false);
      }
    };
    
    if (showTutorial) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showTutorial]);
  
  // Toggle category enabled state
  const toggleCategory = useCallback((categoryId: string) => {
    setCategoryStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId) || { enabled: false, expanded: false, attributeCount: 0 };
      newMap.set(categoryId, {
        ...current,
        enabled: !current.enabled,
      });
      return newMap;
    });
  }, []);
  
  // Update category attribute count
  const updateCategoryCount = useCallback((categoryId: string, count: number) => {
    setCategoryStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId) || { enabled: false, expanded: false, attributeCount: 0 };
      newMap.set(categoryId, {
        ...current,
        attributeCount: Math.max(0, Math.min(50, count)),
      });
      return newMap;
    });
  }, []);
  
  // Toggle category expansion
  const toggleCategoryExpand = useCallback((categoryId: string) => {
    setCategoryStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId) || { enabled: false, expanded: false, attributeCount: 0 };
      newMap.set(categoryId, {
        ...current,
        expanded: !current.expanded,
      });
      return newMap;
    });
  }, []);

  const setAllChecked = useCallback((enabled: boolean) => {
    setCategoryStates(prev => {
      const newMap = new Map(prev);
      Object.keys(CATEGORY_MAP).forEach(categoryId => {
        const current = newMap.get(categoryId) || { enabled: false, expanded: false, attributeCount: 0 };
        newMap.set(categoryId, {
          ...current,
          enabled,
        });
      });
      return newMap;
    });

    setSubcategoryStates(prev => {
      const newMap = new Map(prev);
      Object.entries(CATEGORY_MAP).forEach(([categoryId, items]) => {
        items.forEach(item => {
          const itemKey = `${categoryId}:${item.label}`;
          const current = newMap.get(itemKey) || { enabled: false, expanded: false, attributeCount: 0 };
          newMap.set(itemKey, {
            ...current,
            enabled,
          });

          if (item.subcategories && item.subcategories.length > 0) {
            item.subcategories.forEach(subItem => {
              const subKey = `${categoryId}:${subItem.label}`;
              const subCurrent = newMap.get(subKey) || { enabled: false, expanded: false, attributeCount: 0 };
              newMap.set(subKey, {
                ...subCurrent,
                enabled,
              });
            });
          }
        });
      });
      return newMap;
    });
  }, []);
  
  // Toggle subcategory enabled state
  const toggleSubcategory = useCallback((key: string) => {
    setSubcategoryStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(key) || { enabled: false, expanded: false, attributeCount: 0 };
      newMap.set(key, {
        ...current,
        enabled: !current.enabled,
      });
      return newMap;
    });
  }, []);
  
  // Update subcategory attribute count
  const updateSubcategoryCount = useCallback((key: string, count: number) => {
    setSubcategoryStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(key) || { enabled: false, expanded: false, attributeCount: 0 };
      newMap.set(key, {
        ...current,
        attributeCount: Math.max(0, Math.min(50, count)),
      });
      return newMap;
    });
  }, []);
  
  // Generate random prompt
  const handleGenerate = useCallback(() => {
    const selections = generateRandomSelections(
      categoryStates,
      subcategoryStates,
      attributeDefinitions,
      questionNodes,
      attributeCount
    );
    
    if (selections.length > 0) {
      onRandomize(selections);
    }
  }, [categoryStates, subcategoryStates, attributeDefinitions, questionNodes, attributeCount, onRandomize]);
  
  // Clear random selections
  const handleClear = useCallback(() => {
    onRandomize([]);
  }, [onRandomize]);
  
  // Get category display name
  const getCategoryDisplayName = (categoryId: string): string => {
    const names: Record<string, string> = {
      subject: 'Subject',
      style: 'Style',
      lighting: 'Lighting',
      camera: 'Camera',
      environment: 'Environment',
      quality: 'Quality',
      effects: 'Effects',
      'post-processing': 'Post-Processing',
      'anatomy-details': 'Anatomy Details',
      actions: 'Actions',
    };
    return names[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  };
  
  // Get attribute count for a category
  const getCategoryAttributeCount = useCallback((categoryId: string): number => {
    const items = CATEGORY_MAP[categoryId] || [];
    const attributes = getAttributesForCategory(items, questionNodes, attributeDefinitions);
    return attributes.length;
  }, [questionNodes, attributeDefinitions]);
  
  // Get attribute count for a subcategory
  const getSubcategoryAttributeCount = useCallback((nodeId: string): number => {
    const attributes = getAttributesForNode(nodeId, questionNodes, attributeDefinitions);
    return attributes.length;
  }, [questionNodes, attributeDefinitions]);
  
  return (
    <div className="random-prompt-generator">
      <div className="random-prompt-generator-header">
        <h3 className="random-prompt-generator-title">Random Prompt Generator</h3>
        <button
          className="random-prompt-tutorial-button"
          onClick={() => setShowTutorial(true)}
          aria-label="Show tutorial"
          title="Show tutorial"
        >
          Tutorial
        </button>
      </div>
      
      {showTutorial && portalContainer && createPortal(
        <div className="random-prompt-tutorial-overlay" onClick={() => setShowTutorial(false)}>
          <div className="random-prompt-tutorial-popup" onClick={(e) => e.stopPropagation()}>
            <div className="random-prompt-tutorial-header">
              <h3 className="random-prompt-tutorial-title">Random Prompt Generator Tutorial</h3>
              <button
                className="random-prompt-tutorial-close"
                onClick={() => setShowTutorial(false)}
                aria-label="Close tutorial"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="random-prompt-tutorial-content">
              <div className="random-prompt-tutorial-section">
                <h4 className="random-prompt-tutorial-section-title">How It Works</h4>
                <p className="random-prompt-tutorial-text">
                  The Random Prompt Generator allows you to quickly generate prompts by randomly selecting attributes from enabled categories and subcategories.
                </p>
              </div>
              
              <div className="random-prompt-tutorial-section">
                <h4 className="random-prompt-tutorial-section-title">Category Selection</h4>
                <p className="random-prompt-tutorial-text">
                  • Check the box next to a category to enable it for randomization<br/>
                  • Click the arrow (▶) to expand and see subcategories<br/>
                  • You can enable entire categories or specific subcategories
                </p>
              </div>
              
              <div className="random-prompt-tutorial-section">
                <h4 className="random-prompt-tutorial-section-title">Attribute Count</h4>
                <p className="random-prompt-tutorial-text">
                  • Set a default count in the "Default attributes per category" field<br/>
                  • For each enabled category/subcategory, you can set a specific count<br/>
                  • Leave the count at 0 to use the default value<br/>
                  • The number in parentheses shows how many attributes are available
                </p>
              </div>
              
              <div className="random-prompt-tutorial-section">
                <h4 className="random-prompt-tutorial-section-title">Buttons</h4>
                <p className="random-prompt-tutorial-text">
                  • <strong>Generate Random Prompt:</strong> Creates a new random selection based on your enabled categories<br/>
                  • <strong>Re-roll:</strong> Generates a new random selection with the same settings<br/>
                  • <strong>Clear Random Selections:</strong> Removes all randomly generated selections
                </p>
              </div>
              
              <div className="random-prompt-tutorial-section">
                <h4 className="random-prompt-tutorial-section-title">Tips</h4>
                <p className="random-prompt-tutorial-text">
                  • Enable multiple categories to create diverse prompts<br/>
                  • Use subcategory selection for more precise control<br/>
                  • Adjust attribute counts to balance prompt complexity<br/>
                  • Scroll through categories if the list is long
                </p>
              </div>
            </div>
          </div>
        </div>,
        portalContainer
      )}
      
      <div className="random-prompt-generator-content">
        <div className="random-prompt-generator-controls">
          <label className="random-prompt-generator-label">
            Default attributes per category:
            <input
              type="number"
              min="1"
              max="50"
              value={attributeCount}
              onChange={(e) => setAttributeCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="random-prompt-generator-input"
            />
          </label>
          <label className="random-prompt-generator-label random-prompt-generator-toggle-all">
            <input
              type="checkbox"
              checked={isAllChecked()}
              onChange={(e) => setAllChecked(e.target.checked)}
              className="random-prompt-checkbox"
            />
            Check everything
          </label>
        </div>
        
        <div className="random-prompt-generator-categories">
          {Object.entries(CATEGORY_MAP).map(([categoryId, items]) => {
            const state = categoryStates.get(categoryId) || { enabled: false, expanded: false, attributeCount: 0 };
            const attrCount = getCategoryAttributeCount(categoryId);
            
            return (
              <div key={categoryId} className="random-prompt-category">
                <div className="random-prompt-category-header">
                  <button
                    className="random-prompt-expand-toggle"
                    onClick={() => toggleCategoryExpand(categoryId)}
                    aria-label={state.expanded ? 'Collapse' : 'Expand'}
                  >
                    {state.expanded ? '▼' : '▶'}
                  </button>
                  <label className="random-prompt-category-label">
                    <input
                      type="checkbox"
                      checked={state.enabled}
                      onChange={() => toggleCategory(categoryId)}
                      className="random-prompt-checkbox"
                    />
                    <span className="random-prompt-category-name" title={getCategoryDisplayName(categoryId)}>
                      {getCategoryDisplayName(categoryId)}
                    </span>
                    <span className="random-prompt-attribute-count">({attrCount})</span>
                  </label>
                  {state.enabled && (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={state.attributeCount || ''}
                      onChange={(e) => updateCategoryCount(categoryId, parseInt(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                      className="random-prompt-count-input"
                      placeholder={attributeCount.toString()}
                      title="Attributes to select from this category"
                    />
                  )}
                </div>
                
                {state.expanded && (
                  <div className="random-prompt-subcategories">
                    {items.map((item) => {
                      const subKey = `${categoryId}:${item.label}`;
                      const subState = subcategoryStates.get(subKey) || { enabled: false, expanded: false, attributeCount: 0 };
                      const subAttrCount = item.nodeId ? getSubcategoryAttributeCount(item.nodeId) : 0;
                      
                      return (
                        <div key={subKey} className="random-prompt-subcategory">
                          <div className="random-prompt-subcategory-row">
                            <label className="random-prompt-subcategory-label">
                              <input
                                type="checkbox"
                                checked={subState.enabled}
                                onChange={() => toggleSubcategory(subKey)}
                                className="random-prompt-checkbox"
                              />
                              <span className="random-prompt-subcategory-name" title={item.label}>
                                {item.label}
                              </span>
                              <span className="random-prompt-attribute-count">({subAttrCount})</span>
                            </label>
                            {subState.enabled && (
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={subState.attributeCount || ''}
                                onChange={(e) => updateSubcategoryCount(subKey, parseInt(e.target.value) || 0)}
                                onClick={(e) => e.stopPropagation()}
                                className="random-prompt-count-input"
                                placeholder={categoryStates.get(categoryId)?.attributeCount > 0 
                                  ? categoryStates.get(categoryId)!.attributeCount.toString() 
                                  : attributeCount.toString()}
                                title="Attributes to select from this subcategory"
                              />
                            )}
                          </div>
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
      
      <div className="random-prompt-generator-footer">
        <button
          onClick={handleGenerate}
          className="random-prompt-button random-prompt-button-primary"
        >
          Generate Random Prompt
        </button>
        <button
          onClick={handleGenerate}
          className="random-prompt-button random-prompt-button-secondary"
        >
          Re-roll
        </button>
        <button
          onClick={handleClear}
          className="random-prompt-button random-prompt-button-secondary"
        >
          Clear Random Selections
        </button>
      </div>
    </div>
  );
}
