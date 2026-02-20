import { useMemo, useState } from 'react';
import type { SavedPrompt } from '../../types';
import {
  createPrompt,
  deletePrompt,
  exportPromptsPayload,
  importPromptsPayload,
  listPrompts,
} from '../../engine/promptStore';
import './PromptLibrary.css';

type PromptLibraryProps = {
  prompt: any | null;
  customAdditions?: string[];
  onAddToPrompt?: (text: string) => void;
};

const buildPromptText = (prompt: any, customAdditions: string[]) => {
  const additionsText = customAdditions.filter(Boolean).join(', ');
  const positive = prompt && 'positiveTokens' in prompt ? prompt.positiveTokens : '';
  const combinedPositive = positive
    ? additionsText
      ? `${positive}, ${additionsText}`
      : positive
    : additionsText;
  const negative = prompt && 'negativeTokens' in prompt ? prompt.negativeTokens : '';
  return {
    positive: combinedPositive,
    negative,
    full: negative ? `${combinedPositive}\n\nNEGATIVE PROMPT:\n${negative}` : combinedPositive,
  };
};

export function PromptLibrary({ prompt, customAdditions = [], onAddToPrompt }: PromptLibraryProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>(() => listPrompts());
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [note, setNote] = useState('');
  const [libraryJson, setLibraryJson] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentText = useMemo(() => buildPromptText(prompt, customAdditions), [prompt, customAdditions]);

  const refresh = () => {
    setPrompts(listPrompts());
  };

  const parseTags = (raw: string) =>
    raw
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

  const handleSave = () => {
    setError(null);
    setMessage(null);
    try {
      createPrompt({
        name,
        positive: currentText.positive,
        negative: currentText.negative,
        tags: parseTags(tags),
        note,
      });
      setName('');
      setTags('');
      setNote('');
      refresh();
      setMessage('Saved prompt.');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save prompt.');
    }
  };

  const handleExport = () => {
    try {
      const payload = exportPromptsPayload();
      setLibraryJson(JSON.stringify(payload, null, 2));
      setMessage('Exported prompts.');
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to export.');
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(libraryJson);
      importPromptsPayload(parsed);
      refresh();
      setMessage('Imported prompts.');
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Invalid prompts JSON.');
    }
  };

  const handleDownload = () => {
    try {
      const payload = exportPromptsPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'saved-prompts.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage('Downloaded prompts JSON.');
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to download.');
    }
  };

  const handleCopy = (prompt: SavedPrompt) => {
    const full = prompt.negative
      ? `${prompt.positive}\n\nNEGATIVE PROMPT:\n${prompt.negative}`
      : prompt.positive;
    navigator.clipboard.writeText(full).catch(() => {
      // ignore
    });
    setMessage('Copied prompt.');
  };

  return (
    <div className="prompt-library">
      <div className="prompt-library-header">
        <h3>Saved Prompts</h3>
        <span className="prompt-library-count">{prompts.length}</span>
      </div>
      <div className="prompt-library-save">
        <input
          type="text"
          placeholder="Prompt name"
          value={name}
          onChange={event => setName(event.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma)"
          value={tags}
          onChange={event => setTags(event.target.value)}
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={event => setNote(event.target.value)}
        />
        <button type="button" onClick={handleSave}>
          Save Current Prompt
        </button>
      </div>
      <details className="prompt-library-io">
        <summary>Import / Export</summary>
        <textarea
          rows={5}
          placeholder="Prompts JSON import/export"
          value={libraryJson}
          onChange={event => setLibraryJson(event.target.value)}
        />
        <div className="prompt-library-actions">
          <button type="button" onClick={handleExport}>
            Export Prompts
          </button>
          <button type="button" onClick={handleImport}>
            Import Prompts
          </button>
          <button type="button" onClick={handleDownload}>
            Download Prompts
          </button>
        </div>
      </details>
      {error && <div className="prompt-library-error">{error}</div>}
      {message && <div className="prompt-library-message">{message}</div>}
      <div className="prompt-library-list">
        {prompts.length === 0 ? (
          <div className="prompt-library-empty">No saved prompts yet.</div>
        ) : (
          prompts.map(item => (
            <div key={item.id} className="prompt-library-item">
              <div className="prompt-library-item-main">
                <div className="prompt-library-item-title">{item.name}</div>
                <div className="prompt-library-item-text">{item.positive}</div>
                {item.tags && item.tags.length > 0 && (
                  <div className="prompt-library-item-tags">{item.tags.join(', ')}</div>
                )}
              </div>
              <div className="prompt-library-item-actions">
                <button type="button" onClick={() => handleCopy(item)}>
                  Copy
                </button>
                <button type="button" onClick={() => onAddToPrompt?.(item.positive)}>
                  Add to Prompt
                </button>
                <button type="button" onClick={() => deletePrompt(item.id) && refresh()}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
