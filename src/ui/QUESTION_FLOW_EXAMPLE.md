# Question Flow State Example

This document demonstrates how the question flow state works in App.tsx after wiring QuestionCard.

## State Structure

### Navigation State
```typescript
// Current question node ID
currentNodeId: string = 'question-1'

// Navigation history (breadcrumb trail)
navigationHistory: string[] = ['question-1']
```

### Question Node Structure
```typescript
interface QuestionNode {
  id: string;                    // Unique identifier
  question: string;              // Question text displayed to user
  description?: string;          // Optional description
  attributeIds: string[];        // IDs of AttributeDefinitions available for this question
  nextNodeId?: string;           // ID of next question (if any)
  allowCustomExtension?: string[]; // Attribute IDs that allow custom extensions
}
```

## Example Flow

### Initial State
```typescript
currentNodeId: 'question-1'
navigationHistory: ['question-1']
selections: Map {} // Empty
```

### Question 1: "What type of character?"
```typescript
{
  id: 'question-1',
  question: 'What type of character?',
  description: 'Select the character type',
  attributeIds: ['subject-female', 'subject-male'],
  nextNodeId: 'question-2',
  allowCustomExtension: ['subject-female', 'subject-male']
}
```

**Available Attributes:**
- `subject-female` (allows custom extension)
- `subject-male` (allows custom extension)

### User Action: Selects "subject-female"
```typescript
// 1. Selection is added
selections: Map {
  'subject-female' => {
    attributeId: 'subject-female',
    isEnabled: true,
    customExtension: null
  }
}

// 2. Navigation automatically transitions
currentNodeId: 'question-2'
navigationHistory: ['question-1', 'question-2']

// 3. Engine is called (via useEffect)
// Prompt is generated and displayed in PromptPreview
```

### User Action: Adds Custom Extension
```typescript
// User types "with long hair" in the extension input
selections: Map {
  'subject-female' => {
    attributeId: 'subject-female',
    isEnabled: true,
    customExtension: 'with long hair'
  }
}

// Engine is called again
// Prompt now includes: "female character with long hair"
```

### Question 2: "What style?"
```typescript
{
  id: 'question-2',
  question: 'What style?',
  description: 'Choose the art style',
  attributeIds: ['anime-style', 'realistic-style'],
  nextNodeId: undefined // No next question
}
```

**Available Attributes:**
- `anime-style`
- `realistic-style`

### User Action: Selects "anime-style"
```typescript
// Selection is added
selections: Map {
  'subject-female' => {
    attributeId: 'subject-female',
    isEnabled: true,
    customExtension: 'with long hair'
  },
  'anime-style' => {
    attributeId: 'anime-style',
    isEnabled: true,
    customExtension: null
  }
}

// No navigation (nextNodeId is undefined)
// Engine is called, prompt updates
```

### User Action: Navigate Back
```typescript
// Navigation history is updated
navigationHistory: ['question-1'] // Last item removed
currentNodeId: 'question-1'

// Question 1 is displayed again
// Previous selections remain in state
```

## Reactive Prompt Updates

The `PromptPreview` component updates automatically via:

1. **useEffect Hook**: Monitors `selections`, `modifiers`, and `modelProfile`
2. **Engine Call**: `callEngine()` converts state to `EngineInput` and calls `generatePrompt()`
3. **State Update**: `setEngineResult()` stores the result
4. **Prop Extraction**: `prompt` and `error` are extracted from `engineResult`
5. **Component Render**: `PromptPreview` receives updated `prompt` prop

## Key Behaviors

1. **Automatic Navigation**: Selecting an option with `nextNodeId` automatically transitions to the next question
2. **Custom Extensions**: Only attributes listed in `allowCustomExtension` show extension inputs
3. **State Persistence**: Selections persist across navigation (back/forward)
4. **Reactive Updates**: Prompt updates immediately on any selection/modifier change
5. **History Tracking**: Navigation history enables back button functionality

