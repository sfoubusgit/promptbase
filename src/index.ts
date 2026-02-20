/**
 * Minimal Viable Prompt Engine
 * 
 * Main entry point for the engine.
 * Re-exports all public types and functions.
 */

// Core types
export * from './types/entities';
export * from './types/errors';

// Engine orchestrator
export { generatePrompt, type EngineInput } from './engine';

// Module functions (exported for testing/advanced usage)
export { validateSelection } from './modules/validator';
export { generateFragments } from './modules/fragment-generator';
export { applyModifiers } from './modules/fragment-processor';
export { orderFragments, type OrderedFragments } from './modules/fragment-orderer';
export { assemblePrompt } from './modules/prompt-assembler';

