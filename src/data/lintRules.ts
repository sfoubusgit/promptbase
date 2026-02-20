import { LintRule } from '../types';
import { isValueEmpty, normalizeValueToText } from '../engine/renderUtils';

const findSectionByLabel = (schema: { sections: Array<{ id: string; label: string }> }, keyword: string) => {
  const lower = keyword.toLowerCase();
  return schema.sections.find(section => section.label.toLowerCase().includes(lower));
};

const getPrimaryTextSection = (schema: { sections: Array<{ id: string; inputType: string; repeatable?: boolean }> }) => {
  return schema.sections.find(section => section.inputType === 'text' && !section.repeatable);
};

const countCommas = (value: string) => (value.match(/,/g) || []).length;

const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const splitCommaList = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

export const LINT_RULES: LintRule[] = [
  {
    id: 'lint-validation-errors-banner',
    evaluate: ctx => {
      if (!ctx.validation.hasErrors) return [];
      return [
        {
          id: 'lint-validation-errors-banner',
          severity: 'info',
          title: 'Fix validation errors first',
          message: 'There are required fields missing. Fix them before refining the prompt.',
          rationale: 'Missing required fields can make prompts invalid or incomplete.',
        },
      ];
    },
  },
  {
    id: 'lint-main-too-short',
    evaluate: ctx => {
      const main = getPrimaryTextSection(ctx.schema);
      if (!main) return [];
      const value = normalizeValueToText(ctx.state.sections[main.id]);
      if (value.length >= 20 || value.length === 0) return [];
      return [
        {
          id: 'lint-main-too-short',
          severity: 'suggestion',
          title: 'Main prompt is short',
          message: 'Consider adding more detail to the main description (subject, setting, lighting).',
          rationale: 'Short prompts often under-specify the scene and lead to inconsistent outputs.',
          target: { kind: 'section', id: main.id },
        },
      ];
    },
  },
  {
    id: 'lint-style-missing',
    evaluate: ctx => {
      const styleSection = findSectionByLabel(ctx.schema, 'style');
      if (!styleSection) return [];
      const value = ctx.state.sections[styleSection.id];
      if (!isValueEmpty(value)) return [];
      const main = getPrimaryTextSection(ctx.schema);
      if (main && isValueEmpty(ctx.state.sections[main.id])) return [];
      return [
        {
          id: 'lint-style-missing',
          severity: 'suggestion',
          title: 'Style is empty',
          message: 'Add a style or medium to make the output more consistent.',
          rationale: 'Style guidance helps the model converge on a consistent aesthetic.',
          target: { kind: 'section', id: styleSection.id },
        },
      ];
    },
  },
  {
    id: 'lint-metadata-aspect-ratio',
    evaluate: ctx => {
      const field = (ctx.schema.metadataFields || []).find(meta =>
        meta.label.toLowerCase().includes('aspect ratio') || meta.id.includes('aspect_ratio')
      );
      if (!field) return [];
      if (!isValueEmpty(ctx.state.metadata[field.id])) return [];
      return [
        {
          id: 'lint-metadata-aspect-ratio',
          severity: 'suggestion',
          title: 'Aspect ratio not set',
          message: 'Choose an aspect ratio for predictable framing.',
          rationale: 'Aspect ratio influences composition and framing.',
          target: { kind: 'metadata', id: field.id },
        },
      ];
    },
  },
  {
    id: 'lint-negative-too-generic',
    evaluate: ctx => {
      if (!ctx.schema.negativePrompt?.enabled) return [];
      const value = (ctx.state.negativePrompt || '').trim();
      if (value.length === 0) return [];
      if (value.length >= 25) return [];
      return [
        {
          id: 'lint-negative-too-generic',
          severity: 'info',
          title: 'Negative prompt is short',
          message: 'Consider adding specific artifacts you want to avoid.',
          rationale: 'Specific negatives reduce recurring artifacts more effectively than generic terms.',
          target: { kind: 'negative', id: 'negativePrompt' },
        },
      ];
    },
  },
  {
    id: 'lint-text-too-comma-heavy',
    evaluate: ctx => {
      return ctx.schema.sections
        .filter(section => section.inputType === 'text' && !section.repeatable)
        .map(section => {
          const value = normalizeValueToText(ctx.state.sections[section.id]);
          if (value.length === 0) return null;
          if (countCommas(value) < 6) return null;
          return {
            id: `lint-text-too-comma-heavy-${section.id}`,
            severity: 'warning' as const,
            title: 'Too many comma-separated tokens',
            message: 'Consider moving lists into a list-style section for clarity.',
            rationale: 'Long comma chains can reduce clarity and make edits harder.',
            target: { kind: 'section' as const, id: section.id },
          };
        })
        .filter(Boolean) as ReturnType<LintRule['evaluate']>;
    },
  },
  {
    id: 'lint-video-duration-missing',
    evaluate: ctx => {
      const durationSection = findSectionByLabel(ctx.schema, 'duration');
      const totalField = (ctx.schema.metadataFields || []).find(field =>
        field.id.includes('total_duration') || field.label.toLowerCase().includes('total duration')
      );
      if (!durationSection || !totalField) return [];
      const durationValue = ctx.state.sections[durationSection.id];
      if (isValueEmpty(durationValue)) return [];
      if (!isValueEmpty(ctx.state.metadata[totalField.id])) return [];
      return [
        {
          id: 'lint-video-duration-missing',
          severity: 'suggestion',
          title: 'Total duration missing',
          message: 'Scenes have durations but total duration is not set.',
          rationale: 'Total duration helps the model align timing across scenes.',
          target: { kind: 'metadata', id: totalField.id },
        },
      ];
    },
  },
  {
    id: 'lint-multiple-scenes-no-global-camera',
    evaluate: ctx => {
      const sceneSection = findSectionByLabel(ctx.schema, 'scene');
      const cameraSection = findSectionByLabel(ctx.schema, 'camera');
      if (!sceneSection || !cameraSection) return [];
      const scenes = ctx.state.sections[sceneSection.id];
      if (!Array.isArray(scenes) || scenes.length < 2) return [];
      if (!isValueEmpty(ctx.state.sections[cameraSection.id])) return [];
      return [
        {
          id: 'lint-multiple-scenes-no-global-camera',
          severity: 'suggestion',
          title: 'Global camera rules missing',
          message: 'Multiple scenes benefit from a consistent camera style.',
          rationale: 'Global camera guidance keeps scenes visually cohesive.',
          target: { kind: 'section', id: cameraSection.id },
        },
      ];
    },
  },
  {
    id: 'lint-repeatable-duplicates',
    evaluate: ctx => {
      return ctx.schema.sections
        .filter(section => section.repeatable && section.inputType === 'text')
        .flatMap(section => {
          const entries = ctx.state.sections[section.id];
          if (!Array.isArray(entries)) return [];
          const seen = new Map<string, number>();
          const issues = entries.map((entry, index) => {
            const text = normalizeValueToText(entry);
            if (!text) return null;
            const previous = seen.get(text);
            if (previous !== undefined) {
              return {
                id: `lint-repeatable-duplicates-${section.id}-${index}`,
                severity: 'warning' as const,
                title: 'Repeated scene content',
                message: `Scene ${index + 1} repeats Scene ${previous + 1}. Consider differentiating them.`,
                rationale: 'Repeated scenes reduce narrative variety and visual interest.',
                target: { kind: 'section' as const, id: section.id, index },
              };
            }
            seen.set(text, index);
            return null;
          });
          return issues.filter(Boolean) as ReturnType<LintRule['evaluate']>;
        });
    },
  },
  {
    id: 'lint-trim-whitespace',
    evaluate: ctx => {
      const fixes = ctx.schema.sections
        .filter(section => section.inputType === 'text')
        .map(section => {
          const value = normalizeValueToText(ctx.state.sections[section.id]);
          const collapsed = collapseWhitespace(value);
          if (!value || value === collapsed) return null;
          return {
            id: `lint-trim-${section.id}`,
            severity: 'suggestion' as const,
            title: 'Extra whitespace',
            message: 'Trim repeated spaces for cleaner prompts.',
            rationale: 'Cleaner text improves readability and reduces token noise.',
            fixPreview: 'Trim whitespace and collapse multiple spaces.',
            target: { kind: 'section' as const, id: section.id },
            fixes: [
              {
                id: `fix-trim-${section.id}`,
                label: 'Trim whitespace',
                apply: state => ({
                  ...state,
                  sections: {
                    ...state.sections,
                    [section.id]: collapsed,
                  },
                }),
              },
            ],
          };
        })
        .filter(Boolean);
      return fixes as ReturnType<LintRule['evaluate']>;
    },
  },
  {
    id: 'lint-list-from-string',
    evaluate: ctx => {
      return ctx.schema.sections
        .filter(section => section.inputType === 'list')
        .map(section => {
          const value = ctx.state.sections[section.id];
          if (typeof value !== 'string') return null;
          return {
            id: `lint-list-string-${section.id}`,
            severity: 'suggestion' as const,
            title: 'List field contains comma-separated text',
            message: 'Convert to a list for clearer rendering.',
            rationale: 'List fields render more predictably and are easier to edit.',
            fixPreview: 'Split comma-separated items into a list.',
            target: { kind: 'section' as const, id: section.id },
            fixes: [
              {
                id: `fix-list-${section.id}`,
                label: 'Convert to list',
                apply: state => ({
                  ...state,
                  sections: {
                    ...state.sections,
                    [section.id]: splitCommaList(value),
                  },
                }),
              },
            ],
          };
        })
        .filter(Boolean) as ReturnType<LintRule['evaluate']>;
    },
  },
  {
    id: 'lint-default-fps',
    evaluate: ctx => {
      const fpsField = (ctx.schema.metadataFields || []).find(field =>
        field.id.includes('fps') || field.label.toLowerCase().includes('fps')
      );
      if (!fpsField) return [];
      if (!isValueEmpty(ctx.state.metadata[fpsField.id])) return [];
      if (fpsField.default === undefined) return [];
      return [
        {
          id: 'lint-default-fps',
          severity: 'suggestion',
          title: 'FPS not set',
          message: 'Use the default FPS for smoother video output.',
          rationale: 'FPS controls motion smoothness and timing.',
          fixPreview: `Set FPS to ${fpsField.default}.`,
          target: { kind: 'metadata', id: fpsField.id },
          fixes: [
            {
              id: 'fix-default-fps',
              label: `Set FPS to ${fpsField.default}`,
              apply: state => ({
                ...state,
                metadata: {
                  ...state.metadata,
                  [fpsField.id]: fpsField.default ?? state.metadata[fpsField.id],
                },
              }),
            },
          ],
        },
      ];
    },
  },
];
