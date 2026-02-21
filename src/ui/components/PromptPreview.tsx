/**
 * Prompt Preview Component
 * 
 * Responsibilities:
 * - Display prompt strings (positive and negative)
 * - Apply syntax highlighting (optional, display-only)
 * - Show token count with limit indicator
 * - Provide copy functionality
 * 
 * Must NOT:
 * - Generate or compute prompt strings
 * - Modify prompt text before display
 * - Format weights manually
 * - Calculate token counts
 * - Store prompt strings internally
 * - Validate prompt content
 */

import './PromptPreview.css';

// TODO: Import types when ready
// import { Prompt } from '../types';

/**
 * Maps section keys to reference-style headers for structured output
 */
const SECTION_HEADER_MAP: Record<string, string> = {
  'characters': 'Subject & Characters',
  'actions': 'Actions',
  'scene': 'Environment',
  'style': 'Style & Medium',
  'lighting': 'Lighting',
  'camera': 'Camera',
  'effects': 'Atmosphere & Effects',
  'quality': 'Quality',
  'post-processing': 'Post-Processing',
};

/**
 * Section display order (matching semantic priority)
 */
const SECTION_ORDER: Array<keyof typeof SECTION_HEADER_MAP> = [
  'characters',
  'actions',
  'scene',
  'style',
  'lighting',
  'camera',
  'effects',
  'quality',
  'post-processing',
];

interface PromptPreviewProps {
  /** Engine result (prompt or null if no prompt yet) */
  prompt: any | null; // TODO: Prompt | null
  
  /** Handler for copy button (optional) */
  onCopy?: () => void;

  /** Extra fragments from User Pools */
  customAdditions?: string[];

  /** Freeform prompt text */
  freeformPrompt?: string;

  /** Clear prompt handler */
  onClear?: () => void;

  /** Undo clear handler */
  onUndoClear?: () => void;

  /** Whether undo is available */
  canUndoClear?: boolean;

}

/**
 * Prompt Preview Component
 * 
 * Displays engine-generated prompt strings verbatim.
 */
export function PromptPreview({
  prompt,
  onCopy,
  customAdditions = [],
  freeformPrompt = '',
  onClear,
  onUndoClear,
  canUndoClear = false,
}: PromptPreviewProps) {
  // TODO: Render positiveTokens (formatted for display)
  // TODO: Render negativeTokens (formatted for display)
  // TODO: Display tokenCount with limit indicator
  // TODO: Show progress bar (tokens used / token limit)
  // TODO: Render Copy button -> call onCopy
  // TODO: Apply syntax highlighting (display-only, no modification)

  // Display engine-generated prompt directly
  const displayPositive = prompt && 'positiveTokens' in prompt ? prompt.positiveTokens : '';
  const additionsText = customAdditions.filter(Boolean).join(', ');
  const combinedPositive = displayPositive
    ? additionsText
      ? `${displayPositive}, ${additionsText}`
      : displayPositive
    : additionsText;
  const displayNegative = prompt && 'negativeTokens' in prompt ? prompt.negativeTokens : '';
  const freeformText = freeformPrompt.trim();
  const mergedPositive = freeformText
    ? combinedPositive
      ? `${freeformText}, ${combinedPositive}`
      : freeformText
    : combinedPositive;

  /**
   * Formats prompt sections into structured, human-readable output
   * Returns formatted string or null if sections unavailable
   */
  const formatStructuredPrompt = (prompt: any): string | null => {
    if (!prompt?.sections || Object.keys(prompt.sections).length === 0) {
      return null; // Fallback to flat format
    }

    const lines: string[] = ['POSITIVE PROMPT:', ''];

    // Iterate sections in priority order
    for (const sectionKey of SECTION_ORDER) {
      const sectionContent = prompt.sections[sectionKey];
      if (sectionContent && sectionContent.trim()) {
        const header = SECTION_HEADER_MAP[sectionKey];
        lines.push(`${header}:`);
        lines.push(sectionContent);
        lines.push(''); // Empty line between sections
      }
    }

    // Remove trailing empty line
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    if (additionsText) {
      lines.push('');
      lines.push('Custom:');
      lines.push(additionsText);
    }

    return lines.join('\n');
  };

  const handleCopy = () => {
    if (!freeformText && (!prompt || !('positiveTokens' in prompt))) {
      return;
    }

    if (freeformText) {
      navigator.clipboard.writeText(mergedPositive).catch(() => {
        // Silent fail - copy functionality is optional
      });
      onCopy?.();
      return;
    }

    // Try structured format first (if sections available)
    const structuredFormat = formatStructuredPrompt(prompt);
    const positiveText = structuredFormat || mergedPositive;

    // Build full prompt with negative
    const negativeText = prompt.negativeTokens || '';
    const fullPrompt = negativeText
      ? `${positiveText}\n\nNEGATIVE PROMPT:\n${negativeText}`
      : positiveText;

    navigator.clipboard.writeText(fullPrompt).catch(() => {
      // Silent fail - copy functionality is optional
    });
    onCopy?.();
  };

  return (
    <div className="prompt-preview">
      <div className="prompt-preview-header">
        <h3 className="prompt-preview-title">Prompt Preview</h3>
        <div className="prompt-preview-header-controls">
          {(onClear || onUndoClear) && (
            <div className="prompt-preview-action-buttons">
              {onUndoClear && (
                <button
                  type="button"
                  className="prompt-preview-action-button"
                  onClick={onUndoClear}
                  disabled={!canUndoClear}
                >
                  Undo
                </button>
              )}
              {onClear && (
                <button
                  type="button"
                  className="prompt-preview-action-button prompt-preview-action-button-danger"
                  onClick={onClear}
                >
                  Clear
                </button>
              )}
            </div>
          )}
          {prompt && 'tokenCount' in prompt && (
            <div className="prompt-preview-metadata">
              <span className="prompt-preview-token-count">
                <span className="prompt-preview-token-count-value">
                  {prompt.tokenCount}
                </span>
                <span className="prompt-preview-token-limit">
                  {' / 77'}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="prompt-preview-content">
        {prompt && 'sections' in prompt && prompt.sections && Object.keys(prompt.sections).length > 0 ? (
          // Display sections
          <div className="prompt-preview-sections">
            {freeformText && (
              <div className="prompt-preview-section">
                <label className="prompt-preview-section-label">Freeform</label>
                <div className="prompt-preview-section-text">{freeformText}</div>
              </div>
            )}
            {['scene', 'characters', 'actions', 'style', 'lighting', 'camera', 'effects', 'quality', 'post-processing'].map((sectionKey) => {
              const sectionValue = prompt.sections?.[sectionKey as keyof typeof prompt.sections];
              if (!sectionValue) return null;
              
              const sectionLabels: Record<string, string> = {
                'scene': 'Scene',
                'characters': 'Characters',
                'actions': 'Actions',
                'style': 'Style',
                'lighting': 'Lighting',
                'camera': 'Camera',
                'effects': 'Effects',
                'quality': 'Quality',
                'post-processing': 'Post-Processing'
              };
              
              return (
                <div key={sectionKey} className="prompt-preview-section">
                  <label className="prompt-preview-section-label">{sectionLabels[sectionKey]}:</label>
                  <div className="prompt-preview-section-text">{sectionValue}</div>
                </div>
              );
            })}
          </div>
        ) : (
          // Fallback: Display flat format (backward compatibility)
            <div className="prompt-preview-section">
              <label className="prompt-preview-label">Prompt</label>
            <div className="prompt-preview-text">
              {mergedPositive || 'Start building your prompt...'}
            </div>
          </div>
        )}

        {!freeformText && additionsText && prompt && 'sections' in prompt && prompt.sections && Object.keys(prompt.sections).length > 0 && (
          <div className="prompt-preview-section">
            <label className="prompt-preview-label">Custom</label>
            <div className="prompt-preview-text">
              {additionsText}
            </div>
          </div>
        )}
        
        {!freeformText && displayNegative && (
          <div className="prompt-preview-section">
            <label className="prompt-preview-label">Negative Prompt</label>
            <div className="prompt-preview-text">
              {displayNegative}
            </div>
          </div>
        )}
      </div>
      
      {(freeformText || combinedPositive || (prompt && 'positiveTokens' in prompt && prompt.positiveTokens)) && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="prompt-preview-copy-button"
            onClick={handleCopy}
            type="button"
          >
            Copy Prompt
          </button>
        </div>
      )}
    </div>
  );
}
