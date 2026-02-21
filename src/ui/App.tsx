/**
 * Top-level Application Component
 * 
 * Responsibilities:
 * - Owns all global UI state (selections, modifiers, navigation, model profile)
 * - Orchestrates engine calls (converts state to EngineInput, calls generatePrompt)
 * - Manages data loading (AttributeDefinitions, ModelProfiles)
 * - Coordinates component communication
 * 
 * Must NOT:
 * - Compute prompt strings
 * - Validate conflicts
 * - Format weights
 * - Store domain rules
 */

import { useState, useCallback, useEffect } from 'react';
import { AttributeDefinition, AttributeSelection, Modifier, ModelProfile, Prompt, ValidationError } from '../types';
import { generatePrompt, EngineInput } from '../engine';
import { loadAttributeDefinitions } from '../data/loadAttributeDefinitions';
import { loadQuestionNodes, QuestionNode } from '../data/loadQuestionNodes';
import { validateAllCategories } from '../data/validateCategoryIntegration';
import './App.css';
import { PromptPreview } from './components/PromptPreview';
import { QuestionCard } from './components/QuestionCard';
import { CompletionState } from './components/CompletionState';
import { ErrorDisplay } from './components/ErrorDisplay';
import { CategorySidebar } from './components/CategorySidebar';
import { RandomPromptGenerator } from './components/RandomPromptGenerator';
import { Modal } from './components/Modal';
import { UserPoolsPage } from './components/UserPoolsPage';
import { PromptLibrary } from './components/PromptLibrary';
import { CATEGORY_MAP } from '../data/categoryMap';

/**
 * Default model profile for Stable Diffusion
 * TODO: Load from config or allow user selection
 */
/**
 * Default model profile matching old generator behavior
 */
const DEFAULT_MODEL_PROFILE: ModelProfile = {
  tokenLimit: 77, // SD 1.5 default
  tokenSeparator: ', ', // Comma-separated tokens
  weightSyntax: 'attention', // Format: (text:value)
  defaultNegativePrompt: 'deformed, distorted, extra limbs, low detail, low quality, bad anatomy', // From old generator
};

/**
 * Attribute definitions will be loaded from external JSON files.
 * No data is loaded at this stage.
 */

export function App() {
  const [activePage, setActivePage] = useState<'generator' | 'user-pools'>(() => {
    try {
      const saved = window.localStorage.getItem('promptgen:active_page');
      return saved === 'user-pools' ? 'user-pools' : 'generator';
    } catch {
      return 'generator';
    }
  });
  // UI State: Selections
  const [selections, setSelections] = useState<Map<string, AttributeSelection>>(new Map());
  
  // UI State: Modifiers
  const [modifiers, setModifiers] = useState<Map<string, Modifier>>(new Map());
  
  // UI State: Global weight enabled/disabled
  const [weightsEnabledGlobal, setWeightsEnabledGlobal] = useState<boolean>(true);
  
  // UI State: User pool prompt additions
  const [poolPromptItems, setPoolPromptItems] = useState<Array<{ id: string; text: string }>>([]);
  const [poolOutputOverrides, setPoolOutputOverrides] = useState<Map<string, string>>(new Map());

  // UI State: Freeform prompt text
  const [freeformPrompt, setFreeformPrompt] = useState<string>('');
  const [selectionOutputOverrides, setSelectionOutputOverrides] = useState<Map<string, string>>(new Map());

  // UI State: Clear prompt undo (single step)
  const [clearUndoState, setClearUndoState] = useState<{
    selections: Map<string, AttributeSelection>;
    modifiers: Map<string, Modifier>;
    poolPromptItems: Array<{ id: string; text: string }>;
    poolOutputOverrides: Map<string, string>;
    selectionOutputOverrides: Map<string, string>;
    freeformPrompt: string;
  } | null>(null);
  
  // UI State: Model Profile
  const [modelProfile, setModelProfile] = useState<ModelProfile>(DEFAULT_MODEL_PROFILE);

  // UI State: Engine Result
  const [engineResult, setEngineResult] = useState<Prompt | ValidationError | null>(null);
  
  // Attribute definitions will be loaded from external JSON files.
  // No data is loaded at this stage.
  const [attributeDefinitions] = useState<AttributeDefinition[]>(() => {
    try {
      const loaded = loadAttributeDefinitions();
      console.log(`[App] Loaded ${loaded.length} attribute definitions`);
      
      // CRITICAL VALIDATION: Verify categories in CATEGORY_MAP have attribute data
      Object.keys(CATEGORY_MAP).forEach(categoryId => {
        const categoryAttributes = loaded.filter(def => def.category === categoryId);
        if (categoryAttributes.length === 0) {
          console.error(`[App] ⚠️ VALIDATION ERROR: Category "${categoryId}" is in CATEGORY_MAP but has 0 attributes loaded!`);
          console.error(`[App] SOLUTION: Check that src/data/${categoryId}.json exists and is properly formatted.`);
          console.error(`[App] File must have structure: { "category": "${categoryId}", "attributes": [...] }`);
        } else {
          console.log(`[App] ✓ Category "${categoryId}" has ${categoryAttributes.length} attributes loaded`);
        }
      });
      
      return loaded;
    } catch (error) {
      console.error('Failed to load attribute definitions:', error);
      return [];
    }
  });
  
  // Question nodes will be loaded from external JSON files.
  // No data is loaded at this stage.
  const [questionNodes, setQuestionNodes] = useState<QuestionNode[]>([]);
  
  // Category order for interview flow (based on semantic priority)
  // This defines the sequence in which categories are presented when clicking Next
  // 
  // IMPORTANT: When adding new categories, add them to this array in the desired order
  // The order determines the interview flow: subject -> style -> lighting -> [future categories]
  // 
  // Categories must also exist in CATEGORY_MAP with their root nodeId
  const CATEGORY_ORDER: string[] = ['subject', 'style', 'lighting', 'camera', 'environment', 'quality', 'effects', 'post-processing', 'actions', 'anatomy-details'];
  
  // Helper: Get first subcategory node ID for a category, or the category root if no subcategories
  const getFirstSubcategoryNodeId = (categoryId: string, nodes: QuestionNode[]): string | null => {
    const categoryItems = CATEGORY_MAP[categoryId];
    if (!categoryItems || categoryItems.length === 0) return null;
    
    const mainItem = categoryItems[0];
    // If there are subcategories, get the first one's nodeId
    if (mainItem.subcategories && mainItem.subcategories.length > 0) {
      const firstSubcategory = mainItem.subcategories[0];
      if (firstSubcategory.nodeId && nodes.find(n => n.id === firstSubcategory.nodeId)) {
        return firstSubcategory.nodeId;
      }
    }
    // Otherwise, use the main category's nodeId
    if (mainItem.nodeId && nodes.find(n => n.id === mainItem.nodeId)) {
      return mainItem.nodeId;
    }
    return null;
  };
  
  /**
   * Build a flat list of all subcategory node IDs in order
   * This creates a sequential list: Subject->People, Subject->Animals, ..., Anatomy Details->Breasts, etc.
   */
  const getAllSubcategoryNodeIds = useCallback((nodes: QuestionNode[]): string[] => {
    const allNodeIds: string[] = [];
    
    for (const categoryId of CATEGORY_ORDER) {
      const categoryItems = CATEGORY_MAP[categoryId] || [];
      
      // For each subcategory in this category
      for (const item of categoryItems) {
        // If item has subcategories (nested structure), add them
        if (item.subcategories && item.subcategories.length > 0) {
          for (const subItem of item.subcategories) {
            if (subItem.nodeId && nodes.find(n => n.id === subItem.nodeId)) {
              allNodeIds.push(subItem.nodeId);
            }
          }
        } else if (item.nodeId && nodes.find(n => n.id === item.nodeId)) {
          // Direct subcategory (no nesting)
          allNodeIds.push(item.nodeId);
        }
      }
    }
    
    return allNodeIds;
  }, []);

  /**
   * Get the next subcategory node ID in sequential order
   * Returns the next subcategory, or loops back to the first if at the end
   */
  const getNextSubcategoryNodeId = useCallback((currentNodeId: string | null, nodes: QuestionNode[]): string | null => {
    const allNodeIds = getAllSubcategoryNodeIds(nodes);
    
    if (allNodeIds.length === 0) {
      return null;
    }
    
    if (!currentNodeId) {
      // No current node - return first subcategory
      return allNodeIds[0];
    }
    
    // Find current node index
    const currentIndex = allNodeIds.indexOf(currentNodeId);
    
    if (currentIndex === -1) {
      // Current node not found in list - return first subcategory
      return allNodeIds[0];
    }
    
    // Get next index (loop back to 0 if at end)
    const nextIndex = (currentIndex + 1) % allNodeIds.length;
    return allNodeIds[nextIndex];
  }, [getAllSubcategoryNodeIds]);

  // Determine initial node ID
  const getInitialNodeId = useCallback((nodes: QuestionNode[]): string => {
    // Get the first subcategory in sequential order
    const allNodeIds = getAllSubcategoryNodeIds(nodes);
    if (allNodeIds.length > 0) {
      return allNodeIds[0];
    }
    
    // Fallback to subject-root or first node
    return nodes.find(n => n.id === 'subject-root')?.id || 
           nodes.find(n => n.id === 'root')?.id ||
           nodes[0]?.id || 
           '';
  }, [getAllSubcategoryNodeIds]);

  /**
   * Get the next category node ID in the interview order
   * Returns the root node ID for the next category, or null if no more categories
   * @deprecated - Use getNextSubcategoryNodeId instead for sequential navigation
   */
  const getNextCategoryNodeId = useCallback((currentCategoryId: string | null, nodes: QuestionNode[]): string | null => {
    if (!currentCategoryId) {
      // If no current category, return first category's first subcategory
      const firstCategory = CATEGORY_ORDER[0];
      return getFirstSubcategoryNodeId(firstCategory, nodes);
    }
    
    // Find current category index by checking if current node belongs to any category
    let currentIndex = -1;
    for (let i = 0; i < CATEGORY_ORDER.length; i++) {
      const cat = CATEGORY_ORDER[i];
      const categoryItems = CATEGORY_MAP[cat] || [];
      // Check if current node is in this category (including subcategories)
      const isInCategory = categoryItems.some(item => {
        if (item.nodeId === currentCategoryId) return true;
        if (item.subcategories) {
          return item.subcategories.some(sub => sub.nodeId === currentCategoryId);
        }
        return false;
      });
      if (isInCategory) {
        currentIndex = i;
        break;
      }
    }
    
    if (currentIndex === -1) {
      // Current node not in category order, return first category's first subcategory
      const firstCategory = CATEGORY_ORDER[0];
      return getFirstSubcategoryNodeId(firstCategory, nodes);
    }
    
    // Get next category
    const nextIndex = currentIndex + 1;
    if (nextIndex >= CATEGORY_ORDER.length) {
      // No more categories
      return null;
    }
    
    const nextCategory = CATEGORY_ORDER[nextIndex];
    return getFirstSubcategoryNodeId(nextCategory, nodes);
  }, []);
  
  // UI State: Navigation
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  
  // Track if user has explicitly clicked Next to reach the end
  // This ensures completion only happens after explicit Next click, not just from selections
  const [hasReachedEndViaNext, setHasReachedEndViaNext] = useState<boolean>(false);

  // UI State: Random Prompt Generator Modal
  const [isRandomPromptModalOpen, setIsRandomPromptModalOpen] = useState<boolean>(false);

  // UI State: App Tutorial Modal
  const [isAppTutorialOpen, setIsAppTutorialOpen] = useState<boolean>(false);
  
  // Load question nodes
  useEffect(() => {
    try {
      const loaded = loadQuestionNodes();
      console.log(`[App] Loaded ${loaded.length} question nodes:`, loaded.map(n => n.id));
      
      // COMPREHENSIVE VALIDATION: Validate all categories using the validation system
      const validationResults = validateAllCategories(
        attributeDefinitions,
        loaded,
        CATEGORY_ORDER
      );

      // Log validation results
      validationResults.forEach(result => {
        if (result.isValid) {
          console.log(`[App] ✓ Category "${result.categoryId}" is fully integrated`);
          if (result.warnings.length > 0) {
            result.warnings.forEach(warning => {
              console.warn(`[App] ⚠️ ${warning}`);
            });
          }
        } else {
          console.error(`[App] ❌ Category "${result.categoryId}" has integration errors:`);
          result.errors.forEach(error => {
            console.error(`[App]   - ${error}`);
          });
          if (result.warnings.length > 0) {
            result.warnings.forEach(warning => {
              console.warn(`[App] ⚠️ ${warning}`);
            });
          }
        }
      });

      // Count valid vs invalid categories
      const validCount = validationResults.filter(r => r.isValid).length;
      const invalidCount = validationResults.filter(r => !r.isValid).length;
      console.log(`[App] Category Integration Summary: ${validCount} valid, ${invalidCount} invalid out of ${validationResults.length} total`);
      
      if (loaded.length > 0) {
        setQuestionNodes(loaded);
        // Always set initial node when question nodes first load
        const initialId = getInitialNodeId(loaded);
        console.log(`[App] Setting initial node ID: ${initialId}`);
        if (initialId) {
          setCurrentNodeId(initialId);
          setNavigationHistory([initialId]);
          setHasReachedEndViaNext(false); // Reset completion flag on initial load
        }
      } else {
        console.warn('[App] No question nodes loaded');
      }
    } catch (err) {
      console.error('[App] Failed to load question nodes:', err);
    }
  }, []);

  // Get current question node
  const currentNode: QuestionNode | undefined = questionNodes.find(n => n.id === currentNodeId);
  
  // Debug logging
  useEffect(() => {
    console.log('[App] Current state:', {
      questionNodesCount: questionNodes.length,
      currentNodeId,
      currentNode: currentNode?.id,
      attributeDefinitionsCount: attributeDefinitions.length,
    });
  }, [questionNodes.length, currentNodeId, currentNode?.id, attributeDefinitions.length]);
  
  // Check if interview is complete
  // CRITICAL RULE: Completion ONLY happens after user explicitly clicks Next button
  // Completion requires ALL of:
  // 1. There's a current node
  // 2. There's no next node (reached the end)
  // 3. User has explicitly clicked Next to reach this end state (hasReachedEndViaNext)
  // 4. User has made at least one selection
  // 
  // This ensures:
  // - Completion NEVER happens just from making selections
  // - Completion ONLY happens after explicit Next button click
  // - Next button is ALWAYS required to proceed
  const isComplete = currentNode && 
                     !currentNode.nextNodeId && 
                     hasReachedEndViaNext &&
                     selections.size > 0;
  
  // Get attribute definitions for current question
  const currentQuestionAttributes = attributeDefinitions.filter(attr => 
    currentNode?.attributeIds.includes(attr.id)
  );
  
  // CRITICAL VALIDATION: Detect missing attributes for current question
  useEffect(() => {
    if (currentNode && currentNode.attributeIds) {
      const missingAttributes = currentNode.attributeIds.filter(
        attrId => !attributeDefinitions.find(def => def.id === attrId)
      );
      
      if (missingAttributes.length > 0) {
        console.error(`[App] ⚠️ VALIDATION ERROR: Question node "${currentNode.id}" references ${missingAttributes.length} missing attributes:`, missingAttributes);
        console.error(`[App] Available attribute IDs (first 20):`, attributeDefinitions.map(def => def.id).slice(0, 20));
        console.error(`[App] Question node expects:`, currentNode.attributeIds);
        console.error(`[App] SOLUTION: Ensure src/data/${currentNode.id.split('-')[0]}.json exists and contains these attribute IDs.`);
        console.error(`[App] Also verify: 1) Dev server was restarted, 2) File is valid JSON, 3) Attribute IDs match exactly`);
      }
      
      if (currentQuestionAttributes.length === 0 && currentNode.attributeIds.length > 0) {
        console.error(`[App] ⚠️ VALIDATION ERROR: Question node "${currentNode.id}" has ${currentNode.attributeIds.length} attribute IDs but 0 matching attributes found!`);
        console.error(`[App] This indicates a data loading or matching issue.`);
        console.error(`[App] DIAGNOSIS: Check browser console for earlier errors about missing data files.`);
      }
      
      // Success logging for debugging
      if (currentQuestionAttributes.length > 0 && currentNode.attributeIds.length > 0) {
        console.log(`[App] ✓ Question "${currentNode.id}" has ${currentQuestionAttributes.length}/${currentNode.attributeIds.length} attributes available`);
      }
    }
  }, [currentNode?.id, currentNode?.attributeIds, attributeDefinitions.length, currentQuestionAttributes.length]);
  
  // Get modifiers for current question (empty for now, can be enhanced later)
  const currentQuestionModifiers: Modifier[] = [];

  /**
   * Core UI ↔ Engine Integration Point
   * 
   * This function bridges UI state (selections, modifiers) with the prompt engine.
   * It converts React state into engine input format and calls generatePrompt().
   * 
   * TODO: Future enhancements could be added here:
   * - Category filtering before engine call
   * - Selection persistence (localStorage, API)
   * - Undo/redo history
   * - Batch operations
   * - Optimistic updates
   */
  const callEngine = useCallback(() => {
    // Convert Map state to arrays for engine
    const selectionsArray: AttributeSelection[] = Array.from(selections.values());
    const outputDefinitions = selectionOutputOverrides.size === 0
      ? attributeDefinitions
      : attributeDefinitions.map(def => {
          const override = selectionOutputOverrides.get(def.id);
          if (!override || !override.trim()) return def;
          return { ...def, baseText: override.trim() };
        });
    
    // Only include modifiers that are enabled (checkbox checked)
    const modifiersArray: Modifier[] = weightsEnabledGlobal ? Array.from(modifiers.values()) : [];

    // Build engine input
    const input: EngineInput = {
      attributeDefinitions: outputDefinitions,
      selections: selectionsArray,
      modifiers: modifiersArray,
      modelProfile,
    };

    // Call engine
    const result = generatePrompt(input);
    setEngineResult(result);
  }, [selections, modifiers, weightsEnabledGlobal, modelProfile, attributeDefinitions, selectionOutputOverrides]);

  // Call engine whenever selections, modifiers, or modelProfile changes
  useEffect(() => {
    callEngine();
  }, [callEngine]);

  /**
   * Event Handler: Select an attribute
   * 
   * GLOBAL BEHAVIOR: When ANY attribute is selected:
   * - Selection is added to state
   * - Default weight of 1.0 is automatically set (GLOBAL RULE - NO EXCEPTIONS)
   * - Inline weight slider appears in AttributeSelector (GLOBAL RULE - NO EXCEPTIONS)
   * 
   * Does NOT automatically navigate - user must click Next button
   */
  const handleAttributeSelect = useCallback((attributeId: string) => {
    console.log('[App] Attribute selected:', attributeId);
    console.log('[App] Current node ID:', currentNodeId);
    console.log('[App] Will NOT navigate - user must click Next button');
    setSelections(prev => {
      const next = new Map(prev);
      next.set(attributeId, {
        attributeId,
        isEnabled: true,
        customExtension: null,
      });
      return next;
    });
    
    // GLOBAL RULE: Set default weight of 1.0 when ANY attribute is selected
    // This applies to ALL attributes without exception:
    // - subject attributes
    // - style attributes  
    // - lighting attributes
    // - positive and negative attributes
    // - ALL current and future attributes
    setModifiers(prev => {
      const next = new Map(prev);
      if (!next.has(attributeId)) {
        next.set(attributeId, {
          targetAttributeId: attributeId,
          value: 1.0,
        });
      }
      return next;
    });
    
    // EXPLICITLY DO NOT NAVIGATE - user must click Next button
  }, [currentNodeId]);

  /**
   * Event Handler: Deselect an attribute
   * 
   * GLOBAL BEHAVIOR: When ANY attribute is deselected:
   * - Selection is removed from state
   * - Weight modifier is removed (GLOBAL RULE - NO EXCEPTIONS)
   * - Inline weight slider disappears (GLOBAL RULE - NO EXCEPTIONS)
   * - Weight resets to default (no persistence, no memory)
   * 
   * This applies to ALL attributes without exception.
   */
  const handleAttributeDeselect = useCallback((attributeId: string) => {
    setSelections(prev => {
      const next = new Map(prev);
      next.delete(attributeId);
      return next;
    });
    
    // GLOBAL RULE: Remove weight modifier when attribute is deselected
    // This applies to ALL attributes - no exceptions, no persistence
    setModifiers(prev => {
      const next = new Map(prev);
      next.delete(attributeId);
      return next;
    });
    
  }, []);

  /**
   * Event Handler: Change custom extension text
   * Updates selection's customExtension and triggers engine call
   */
  const handleCustomExtensionChange = useCallback((attributeId: string, extension: string) => {
    setSelections(prev => {
      const next = new Map(prev);
      const existing = next.get(attributeId);
      if (existing) {
        next.set(attributeId, {
          ...existing,
          customExtension: extension || null,
        });
      }
      return next;
    });
  }, []);

  /**
   * Event Handler: Change weight value
   * Updates modifier value and triggers engine call
   */
  const handleWeightChange = useCallback((attributeId: string, value: number) => {
    setModifiers(prev => {
      const next = new Map(prev);
      next.set(attributeId, {
        targetAttributeId: attributeId,
        value,
      });
      return next;
    });
  }, []);

  /**
   * Event Handler: Navigate back
   * Moves to previous node in history
   */
  const handleNavigateBack = useCallback(() => {
    setHasReachedEndViaNext(false); // Reset completion flag when going back
    setNavigationHistory(prev => {
      if (prev.length > 1) {
        const newHistory = prev.slice(0, -1);
        setCurrentNodeId(newHistory[newHistory.length - 1]);
        return newHistory;
      }
      return prev;
    });
  }, []);

  /**
   * Event Handler: Navigate next
   * Moves to next node if available, or to next category in order
   * ONLY called when user explicitly clicks Next button
   * 
   * CRITICAL: This is the ONLY way to proceed to next question or mark as complete
   * 
   * Flow:
   * 1. If current node has nextNodeId -> navigate to that node
   * 2. Else, check if there's a next category in order -> navigate to that category
   * 3. Else, no more categories -> mark as complete
   */
  const handleNavigateNext = useCallback(() => {
    console.log('[App] Navigate Next clicked');
    console.log('[App] Current node:', currentNode?.id);
    console.log('[App] Next node ID:', currentNode?.nextNodeId);
    
    // Always use sequential subcategory navigation
    // This ensures we go through: Subject->People, Subject->Animals, ..., Anatomy Details->Breasts, etc.
    const nextNodeId = getNextSubcategoryNodeId(currentNode?.id || null, questionNodes);
    
    if (nextNodeId) {
      // Navigate to next subcategory in sequence
      console.log('[App] Navigating to next subcategory:', nextNodeId);
      setCurrentNodeId(nextNodeId);
      setNavigationHistory(prev => [...prev, nextNodeId]);
      setHasReachedEndViaNext(false); // Reset completion flag when moving forward
    } else {
      // No more subcategories - mark as complete (shouldn't happen with looping, but just in case)
      console.log('[App] No more subcategories available - marking as complete via Next button');
      setHasReachedEndViaNext(true);
    }
  }, [currentNode, questionNodes, getNextSubcategoryNodeId]);

  /**
   * Event Handler: Navigate skip
   * Skips current question and moves to next
   */
  const handleNavigateSkip = useCallback(() => {
    if (currentNode?.nextNodeId) {
      setCurrentNodeId(currentNode.nextNodeId);
      setNavigationHistory(prev => [...prev, currentNode.nextNodeId!]);
    }
  }, [currentNode]);

  /**
   * Event Handler: Start over
   * Resets all state and returns to first question
   */
  const handleStartOver = useCallback(() => {
    setSelections(new Map());
    setModifiers(new Map());
    setHasReachedEndViaNext(false); // Reset completion flag
    const initialId = getInitialNodeId(questionNodes);
    setCurrentNodeId(initialId);
    setNavigationHistory([initialId]);
  }, [questionNodes]);

  /**
   * Event Handler: Review selections
   * Goes back to first question to review
   */
  const handleReview = useCallback(() => {
    setHasReachedEndViaNext(false); // Reset completion flag when reviewing
    const initialId = getInitialNodeId(questionNodes);
    setCurrentNodeId(initialId);
    setNavigationHistory([initialId]);
  }, [questionNodes]);

  /**
   * Event Handler: Jump to category
   * Navigates to a specific question node
   * 
   * CRITICAL: When jumping to a category, reset completion state
   * This ensures completion doesn't persist when switching categories
   */
  const handleJumpToCategory = useCallback((nodeId: string) => {
    console.log('[App] handleJumpToCategory called with nodeId:', nodeId);
    console.log('[App] Available question nodes:', questionNodes.map(n => n.id));
    // Check if node exists in question nodes
    const targetNode = questionNodes.find(n => n.id === nodeId);
    if (targetNode) {
      console.log('[App] Target node found, navigating to:', nodeId);
      setCurrentNodeId(nodeId);
      setHasReachedEndViaNext(false); // Reset completion flag when jumping
      // Update history to include this jump
      setNavigationHistory(prev => {
        // If node is already in history, truncate to that point
        const nodeIndex = prev.indexOf(nodeId);
        if (nodeIndex !== -1) {
          return prev.slice(0, nodeIndex + 1);
        }
        // Otherwise, add to history
        return [...prev, nodeId];
      });
    } else {
      console.error('[App] Target node not found:', nodeId);
      console.error('[App] Available nodes:', questionNodes.map(n => n.id));
    }
  }, [questionNodes]);

  /**
   * Event Handler: Remove selection
   * Removes selection and triggers engine call
   */
  const handleRemoveSelection = useCallback((attributeId: string) => {
    handleAttributeDeselect(attributeId);
  }, [handleAttributeDeselect]);

  /**
   * Event Handler: Change model profile
   * Updates model profile and triggers engine call
   */
  const handleModelProfileChange = useCallback((profile: ModelProfile) => {
    setModelProfile(profile);
  }, []);

  /**
   * Event Handler: Randomize prompt
   * Applies random selections from the Random Prompt Generator
   */
  const handleRandomize = useCallback((randomSelections: AttributeSelection[]) => {
    // Clear existing selections
    setSelections(new Map());
    setModifiers(new Map());
    // Ensure weights remain enabled after randomize
    setWeightsEnabledGlobal(true);
    setSelectionOutputOverrides(new Map());

    // Apply random selections
    const newSelections = new Map<string, AttributeSelection>();
    randomSelections.forEach(selection => {
      newSelections.set(selection.attributeId, selection);
    });
    setSelections(newSelections);
  }, []);

  const handleAddPoolItem = useCallback((text: string) => {
    if (!text.trim()) return;
    const id = `pool_add_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setPoolPromptItems(prev => [...prev, { id, text: text.trim() }]);
  }, []);

  const handleRandomizePoolItems = useCallback((items: string[]) => {
    const next = items
      .filter(Boolean)
      .map(text => ({
        id: `pool_add_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: text.trim(),
      }))
      .filter(item => item.text);
    setPoolPromptItems(next);
    setPoolOutputOverrides(new Map());
  }, []);

  const handleSetPoolOutputOverride = useCallback((itemId: string, value: string | null) => {
    setPoolOutputOverrides(prev => {
      const next = new Map(prev);
      if (!value || !value.trim()) {
        next.delete(itemId);
      } else {
        next.set(itemId, value.trim());
      }
      return next;
    });
  }, []);

  const handleSetSelectionOutputOverride = useCallback((attributeId: string, value: string | null) => {
    setSelectionOutputOverrides(prev => {
      const next = new Map(prev);
      if (!value || !value.trim()) {
        next.delete(attributeId);
      } else {
        next.set(attributeId, value.trim());
      }
      return next;
    });
  }, []);

  const handleClearPrompt = useCallback(() => {
    const hasSelections = selections.size > 0;
    const hasModifiers = modifiers.size > 0;
    const hasPoolItems = poolPromptItems.length > 0;
    if (!hasSelections && !hasModifiers && !hasPoolItems) {
      return;
    }
    setClearUndoState({
      selections: new Map(selections),
      modifiers: new Map(modifiers),
      poolPromptItems: [...poolPromptItems],
      poolOutputOverrides: new Map(poolOutputOverrides),
      selectionOutputOverrides: new Map(selectionOutputOverrides),
      freeformPrompt,
    });
    setSelections(new Map());
    setModifiers(new Map());
    setPoolPromptItems([]);
    setPoolOutputOverrides(new Map());
    setSelectionOutputOverrides(new Map());
    setFreeformPrompt('');
  }, [selections, modifiers, poolPromptItems, poolOutputOverrides, selectionOutputOverrides, freeformPrompt]);

  const handleUndoClearPrompt = useCallback(() => {
    if (!clearUndoState) return;
    setSelections(new Map(clearUndoState.selections));
    setModifiers(new Map(clearUndoState.modifiers));
    setPoolPromptItems([...clearUndoState.poolPromptItems]);
    setPoolOutputOverrides(new Map(clearUndoState.poolOutputOverrides));
    setSelectionOutputOverrides(new Map(clearUndoState.selectionOutputOverrides));
    setFreeformPrompt(clearUndoState.freeformPrompt);
    setClearUndoState(null);
  }, [clearUndoState]);

  // Convert Map state to props format for children
  const selectionsMap = new Map<string, { isEnabled: boolean; customExtension: string | null }>();
  selections.forEach((selection, id) => {
    selectionsMap.set(id, {
      isEnabled: selection.isEnabled,
      customExtension: selection.customExtension,
    });
  });

  const modifierValues = new Map<string, number>();
  modifiers.forEach((modifier, id) => {
    modifierValues.set(id, modifier.value);
  });

  const poolAdditionTexts = poolPromptItems.map(item => {
    const override = poolOutputOverrides.get(item.id);
    return override ? override : item.text;
  });

  // Add allowCustomExtension to attribute definitions for current question
  const currentQuestionAttributesWithExtensions = currentQuestionAttributes.map(attr => ({
    ...attr,
    allowCustomExtension: currentNode?.allowCustomExtension?.includes(attr.id) ?? false,
  }));

  // Extract prompt and error from engine result
  const prompt: Prompt | null = engineResult && 'positiveTokens' in engineResult ? engineResult : null;
  const error: ValidationError | null = engineResult && 'type' in engineResult ? engineResult : null;
  

  // Persist active page
  useEffect(() => {
    try {
      window.localStorage.setItem('promptgen:active_page', activePage);
    } catch {
      // ignore
    }
  }, [activePage]);

  return (
    <div className="app-root">
      <div className="app-page-toggle">
        <div className="app-page-toggle-title">
          <span className="app-page-toggle-label">Workspace</span>
          <span className="app-page-toggle-sub">Choose a mode</span>
        </div>
        <div className="app-page-toggle-actions">
          <button
            type="button"
            className="app-page-toggle-action-button"
            onClick={() => setIsRandomPromptModalOpen(true)}
          >
            Random
          </button>
          <button
            type="button"
            className="app-page-toggle-action-button"
            onClick={() => setIsAppTutorialOpen(true)}
          >
            Tutorial
          </button>
        </div>
        <div className="app-page-toggle-group" role="tablist" aria-label="App mode">
          <button
            type="button"
            className={`app-page-toggle-btn ${activePage === 'generator' ? 'active' : ''}`}
            onClick={() => setActivePage('generator')}
            role="tab"
            aria-selected={activePage === 'generator'}
          >
            Generator
          </button>
          <button
            type="button"
            className={`app-page-toggle-btn ${activePage === 'user-pools' ? 'active' : ''}`}
            onClick={() => setActivePage('user-pools')}
            role="tab"
            aria-selected={activePage === 'user-pools'}
          >
            User Pools
          </button>
        </div>
      </div>
      {activePage === 'user-pools' ? (
        <UserPoolsPage
          onAddToPrompt={handleAddPoolItem}
          onRandomizePoolItems={handleRandomizePoolItems}
          prompt={prompt}
          customAdditions={poolAdditionTexts}
          onClearPrompt={handleClearPrompt}
          onUndoClearPrompt={handleUndoClearPrompt}
          canUndoClearPrompt={Boolean(clearUndoState)}
          freeformPrompt={freeformPrompt}
          onFreeformPromptChange={setFreeformPrompt}
        />
      ) : (
        <div className="interview-layout">
          <CategorySidebar
            categoryMap={CATEGORY_MAP}
            currentNodeId={currentNodeId}
            selections={selectionsMap}
            onJumpToCategory={handleJumpToCategory}
          />
          <div className="interview-container">
            <div className="app-main">
              {isComplete ? (
                <CompletionState
                  totalSteps={navigationHistory.length}
                  onStartOver={handleStartOver}
                  onReview={handleReview}
                />
              ) : currentNode ? (
                <QuestionCard
                  node={currentNode}
                  currentStep={navigationHistory.length}
                  selections={selectionsMap}
                  modifierValues={modifierValues}
                  attributeDefinitions={currentQuestionAttributesWithExtensions}
                  modifiers={currentQuestionModifiers}
                  onSelect={handleAttributeSelect}
                  onDeselect={handleAttributeDeselect}
                  onCustomExtensionChange={handleCustomExtensionChange}
                  onWeightChange={handleWeightChange}
                  weightsEnabledGlobal={weightsEnabledGlobal}
                  onToggleGlobalWeights={setWeightsEnabledGlobal}
                  selectionOutputOverrides={selectionOutputOverrides}
                  onSetSelectionOutputOverride={handleSetSelectionOutputOverride}
                  onNavigateBack={handleNavigateBack}
                  onNavigateNext={handleNavigateNext}
                  onNavigateSkip={handleNavigateSkip}
                  canGoBack={navigationHistory.length > 1}
                  canGoNext={true}
                />
              ) : (
                <div className="app-error-state">
                  <p>Question not found. Please start over.</p>
                  <button onClick={handleStartOver}>Start Over</button>
                </div>
              )}
              {error && (
                <ErrorDisplay
                  error={error}
                  selections={selectionsMap}
                  onRemoveSelection={handleRemoveSelection}
                />
              )}
            </div>
            <div className="app-sidebar">
              <div className="freeform-prompt-panel">
                <div className="freeform-prompt-header">
                  <h3>Freeform Prompt</h3>
                  <span>Type anything</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Write a full prompt here..."
                  value={freeformPrompt}
                  onChange={event => setFreeformPrompt(event.target.value)}
                />
              </div>
              <PromptPreview 
                prompt={prompt}
                customAdditions={poolAdditionTexts}
                freeformPrompt={freeformPrompt}
                onClear={handleClearPrompt}
                onUndoClear={handleUndoClearPrompt}
                canUndoClear={Boolean(clearUndoState)}
              />
              <PromptLibrary
                prompt={prompt}
                customAdditions={poolAdditionTexts}
                onAddToPrompt={handleAddPoolItem}
              />
            </div>
            
            {/* Random Prompt Generator Modal */}
            <Modal
              isOpen={isRandomPromptModalOpen}
              onClose={() => setIsRandomPromptModalOpen(false)}
              title="Random Prompt Generator"
              className="random-prompt-modal"
            >
              <div className="random-prompt-modal-body">
                {/* Description Section */}
                <div className="random-prompt-description">
                  <div className="random-prompt-description-content">
                    <h3 className="random-prompt-description-title">What is this tool?</h3>
                    <p className="random-prompt-description-text">
                      The <strong>Random Prompt Generator</strong> helps you quickly create diverse, well-structured prompts without manually selecting every detail. 
                      Simply choose which categories interest you (like "Style", "Lighting", or "Subject"), and the tool will randomly combine attributes from those categories 
                      to generate a complete prompt ready to use in Stable Diffusion.
                    </p>
                    <p className="random-prompt-description-text">
                      You can also <strong>expand any category</strong> by clicking on it to see its subcategories (for example, expanding "Style" reveals "Illustration", "Realistic", "Painting", etc.). 
                      This allows you to be more specific—you can enable only the subcategories you want, giving you precise control over which types of attributes will be randomly selected.
                    </p>
                    <p className="random-prompt-description-text">
                      This is perfect for exploring new ideas, getting inspiration, or quickly generating variations of prompts to see what works best.
                    </p>
                  </div>
                </div>
                
                <RandomPromptGenerator
                  attributeDefinitions={attributeDefinitions}
                  questionNodes={questionNodes}
                  onRandomize={(selections) => {
                    handleRandomize(selections);
                    setIsRandomPromptModalOpen(false);
                  }}
                />
              </div>
            </Modal>

            {/* App Tutorial Modal */}
            <Modal
              isOpen={isAppTutorialOpen}
              onClose={() => setIsAppTutorialOpen(false)}
              title="How to Use the Prompt Generator"
            >
              <div className="app-tutorial-body">
                <section className="app-tutorial-section">
                  <h3 className="app-tutorial-heading">What is This Tool?</h3>
                  <p>
                    This tool helps you build high-quality text prompts for image generation models such as Stable Diffusion.
                    Instead of writing a long, complex prompt from scratch, you answer a series of focused questions
                    about your image (Subject, Style, Lighting, Camera, Environment, Quality, Effects, and more).
                  </p>
                </section>

                <section className="app-tutorial-section">
                  <h3 className="app-tutorial-heading">How It Works</h3>
                  <p>
                    Each answer you choose adds structured pieces to your final prompt—for example, who or what is in the scene,
                    how it should look (art style or realism), how it should be lit, and how the camera should frame it.
                    The prompt preview on the right updates as you go, so you can see exactly what will be sent to the model.
                  </p>
                </section>

                <section className="app-tutorial-section">
                  <h3 className="app-tutorial-heading">Navigating the Interface</h3>
                  <p>
                    <strong>Next Button:</strong> Move through questions sequentially, going through all categories and subcategories in order.
                  </p>
                  <p>
                    <strong>Category Sidebar:</strong> Jump directly to any category or subcategory by clicking on it in the left sidebar.
                    The sidebar shows which categories you've visited and which have selections.
                  </p>
                  <p>
                    <strong>Prompt Preview:</strong> Watch your prompt build in real-time on the right side as you make selections.
                  </p>
                </section>

                <section className="app-tutorial-section">
                  <h3 className="app-tutorial-heading">Building Your Prompt</h3>
                  <p>
                    Start by selecting attributes from the current question. You can select multiple options, and each selection
                    contributes to your final prompt. You can refine or remove choices at any time by navigating back to previous
                    questions or using the sidebar.
                  </p>
                  <p>
                    When you're happy with the result, copy the prompt text from the preview panel and paste it into your
                    image-generation interface (like Stable Diffusion, Midjourney, or similar tools).
                  </p>
                </section>

                <section className="app-tutorial-section">
                  <h3 className="app-tutorial-heading">Using the Random Prompt Generator</h3>
                  <p>
                    If you want quick inspiration instead of manually answering questions, use the <strong>Random Prompt Generator</strong>
                    button in the bottom-right corner. This opens a separate tool that creates prompts automatically based on
                    randomly selected attributes from categories you choose.
                  </p>
                  <p>
                    This is perfect for exploring new ideas, getting inspiration, or quickly generating variations to see what works best.
                  </p>
                </section>

                <section className="app-tutorial-section">
                  <h3 className="app-tutorial-heading">Tips for Best Results</h3>
                  <ul className="app-tutorial-list">
                    <li>Be specific with your selections—more detail often leads to better results</li>
                    <li>Use the sidebar to jump between categories and refine your choices</li>
                    <li>Check the prompt preview regularly to see how your selections combine</li>
                    <li>Experiment with different combinations to find what works best for your needs</li>
                    <li>Use the Random Generator to discover new prompt styles you might not have considered</li>
                  </ul>
                </section>
              </div>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}

