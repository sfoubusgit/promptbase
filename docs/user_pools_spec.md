# User Pools Tool (v1) — Spec

## Goal & User Promise
Give users full freedom to create, manage, and reuse their own prompt elements (pools) and insert them into the main prompt. No dependency on base selection data.

## Page Structure
Two main pages:
- Main Generator (existing selection UI)
- User Pools (new page)

Navigation:
- Top-level toggle or tabs: Generator | User Pools
- Switching pages should not lose state.

User Pools Page Layout:
- Left column: Pool list + pool controls
- Right column: Pool items + item controls
- Bottom/side panel: “Add to prompt” queue or direct add action

## UX Flow

Create pool
1) Click “New Pool”
2) Name pool
3) Pool appears in list

Add items to pool
- Single add input
- Bulk add (multiline)
- Each item can have:
  - Text (required)
  - Tags (optional, for filtering/search)
  - Note (optional, small description)

Manage pools
- Rename pool
- Delete pool
- Export pool (JSON/CSV)
- Import pool (JSON/CSV)

Use pool items in main prompt
- Items have “Add to Prompt” action
- Adds text as a prompt fragment into the current prompt (main page)

## Data Model (JSON)

PoolItem
```
{
  "id": "item_1699185012_abcd",
  "text": "big tree in the midst of a forest",
  "tags": ["nature", "forest"],
  "note": "use for calm landscape scene"
}
```

Pool
```
{
  "id": "pool_1699185001_xyz",
  "name": "Nature",
  "createdAt": 1699185001,
  "updatedAt": 1699185101,
  "items": [ /* PoolItem[] */ ]
}
```

Store (localStorage)
```
{
  "version": 1,
  "pools": [ /* Pool[] */ ]
}
```

## Import/Export Formats

JSON Export (single pool)
```
{
  "version": 1,
  "pool": {
    "id": "pool_...",
    "name": "Nature",
    "createdAt": 1699185001,
    "updatedAt": 1699185101,
    "items": [
      { "id": "item_...", "text": "big tree...", "tags": ["nature"], "note": "" }
    ]
  }
}
```

CSV Export (single pool)
- Columns: text,tags,note
- tags is comma-joined string
- note is optional

CSV Import Rules
- Accept header row if present.
- tags split by comma, trim spaces.
- Empty note is allowed.

JSON Import Rules
- If pool name already exists, prompt: Merge or Replace.
- If IDs collide, regenerate IDs.

## Integration With Main Prompt
- The User Pools page does not touch base selection UI.
- “Add to Prompt” sends the item text to the main prompt as a new element.
- If the main prompt uses weights, the added item uses default weight = 1.0.

## Search & Filters
- Search by text or tags.
- Optional tag filters (multi-select).

## Permissions
- Full CRUD on pools and items.
- Deleting a pool does not delete any items already used in prompts.

## Implementation Plan (v1)

Phase 1 — Data + Storage (Local)
- poolStore.ts (CRUD for pools/items, localStorage, versioning)
- ID generation utility

Phase 2 — User Pools Page UI
- UserPoolsPage.tsx (layout)
- PoolList.tsx (pool selection, create, rename, delete)
- PoolItems.tsx (list, add, edit, delete, tags, notes)
- PoolImportExport.tsx (JSON/CSV import/export)

Phase 3 — Navigation & Integration
- Add top-level page switch in App.
- Add “Add to prompt” action that updates the main prompt list.

Phase 4 — Search/Filters
- Text search (text + tags)
- Tag filters and favorites (optional v1.1)
