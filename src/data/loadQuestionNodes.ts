/**
 * Question Nodes Data Loader
 * 
 * Loads question nodes from external JSON files.
 */

export interface QuestionNode {
  id: string;
  question: string;
  description?: string;
  attributeIds: string[]; // IDs of AttributeDefinitions available for this question
  nextNodeId?: string; // ID of next question (if any)
  allowCustomExtension?: string[]; // Attribute IDs that allow custom extensions
}

/**
 * Loads question nodes from JSON files.
 * 
 * Loads question node JSON files from src/data/questions/*.json
 * Note: Uses eager loading, so this is effectively synchronous
 */
export function loadQuestionNodes(): QuestionNode[] {
  const allNodes: QuestionNode[] = [];
  
  try {
    // Load question node JSON files from src/data/questions/*.json
    // @ts-ignore - Vite handles JSON imports
    const questionFiles = import.meta.glob('/src/data/questions/**/*.json', { eager: true });
    
    console.log(`[loadQuestionNodes] Found ${Object.keys(questionFiles).length} question files`);
    
    Object.values(questionFiles).forEach((module: any, index) => {
      try {
        const data = module.default ?? module;
        
        if (Array.isArray(data)) {
          // Process each node and normalize null to undefined
          const normalized = data.map((node: any) => ({
            ...node,
            nextNodeId: node.nextNodeId === null ? undefined : node.nextNodeId,
          }));
          console.log(`[loadQuestionNodes] Loaded ${normalized.length} nodes from array file ${index}`);
          allNodes.push(...normalized);
        } else if (data && typeof data === 'object') {
          // Single node object - normalize null to undefined
          const node = {
            ...data,
            nextNodeId: data.nextNodeId === null ? undefined : data.nextNodeId,
          };
          console.log(`[loadQuestionNodes] Loaded node: ${node.id}`);
          allNodes.push(node);
        }
      } catch (error) {
        console.warn(`[loadQuestionNodes] Failed to process question node file ${index}:`, error);
      }
    });
    
    console.log(`[loadQuestionNodes] Total nodes loaded: ${allNodes.length}`);
    
    // Validation: Check for duplicate node IDs
    const nodeIds = allNodes.map(node => node.id);
    const duplicateNodeIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
    if (duplicateNodeIds.length > 0) {
      console.error(`[loadQuestionNodes] ⚠️ Found duplicate node IDs:`, [...new Set(duplicateNodeIds)]);
      console.error(`[loadQuestionNodes] Each question node ID must be unique`);
    }
    
    // Validation: Check for missing required fields
    const invalidNodes = allNodes.filter(node => !node.id || !node.question || !Array.isArray(node.attributeIds));
    if (invalidNodes.length > 0) {
      console.error(`[loadQuestionNodes] ⚠️ Found ${invalidNodes.length} invalid nodes:`, invalidNodes);
      console.error(`[loadQuestionNodes] Each node must have: id, question, attributeIds (array)`);
    }
    
    // Log summary
    console.log(`[loadQuestionNodes] Node IDs:`, allNodes.map(n => n.id));
    
    // Validation: Group by category (extract from node ID pattern: "category-root")
    const byCategory = allNodes.reduce((acc, node) => {
      const categoryMatch = node.id.match(/^([^-]+)-root$/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    console.log(`[loadQuestionNodes] Question nodes by category:`, byCategory);
  } catch (error) {
    console.error('[loadQuestionNodes] Failed to load question nodes:', error);
  }
  
  return allNodes;
}

// Async wrapper for compatibility with existing code
export async function loadQuestionNodesAsync(): Promise<QuestionNode[]> {
  return Promise.resolve(loadQuestionNodes());
}

