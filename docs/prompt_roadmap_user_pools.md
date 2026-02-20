# Prompt Roadmap — User Pools Tool Implementation

Use these prompts in order. Each prompt is self-contained.

## 1) Audit + Plan
Prompt:
“Scan the repo and identify where the main app page switch/navigation is defined. Propose the minimal changes needed to add a new top-level ‘User Pools’ page without breaking existing generator UI. List exact files and plan.”

## 2) Data Model + Storage
Prompt:
“Implement pool storage with localStorage. Add `Pool` and `PoolItem` types, plus a `poolStore.ts` with CRUD for pools and items. Include versioned storage and safe parsing. Do not touch UI yet.”

## 3) User Pools Page Shell
Prompt:
“Create a new `UserPoolsPage` with layout (left: pool list, right: pool items). Wire it into app navigation (Generator | User Pools). Use placeholder UI for now.”

## 4) Pool List (Left Column)
Prompt:
“Build Pool List UI: create pool, rename, delete, select active pool. Show pool count and last updated. Use `poolStore` for data. Keep styling consistent with existing UI.”

## 5) Pool Items (Right Column)
Prompt:
“Build Pool Items UI: list items for active pool, add single item, edit, delete. Each item supports text + optional tags + optional note. Use `poolStore`. Add basic validation.”

## 6) Search + Filters
Prompt:
“Add search that matches item text and tags. Add tag filter (multi-select or text filter). Keep it fast for large lists.”

## 7) Bulk Add
Prompt:
“Add Bulk Add textarea for the active pool. One item per line. Each line can include optional tags after a ‘|’ (e.g., ‘big tree | nature, forest’). Parse and add in bulk.”

## 8) Import/Export JSON (Single Pool)
Prompt:
“Implement JSON import/export for a single pool. Export as `{ version, pool }`. Import should handle ID collisions and prompt for merge vs replace.”

## 9) Import/Export CSV (Single Pool)
Prompt:
“Implement CSV import/export for a single pool. CSV columns: text,tags,note. Tags are comma-separated. Handle header row if present.”

## 10) Import/Export Library (All Pools)
Prompt:
“Add JSON export/import for the entire pool library. Export `{ version, pools }`. Import should merge or replace based on user choice.”

## 11) Main Prompt Integration
Prompt:
“Add ‘Add to Prompt’ action for pool items. When clicked, append item text to the main prompt’s selections (as a normal prompt fragment). Keep prompt weights default to 1.0.”

## 12) Page Switching UX Polish
Prompt:
“Add top-level navigation tabs (Generator | User Pools) with clear active state. Persist the last active page in localStorage.”

## 13) Empty States + Validation
Prompt:
“Add empty-state messages for: no pools, no items, and search with no results. Add minimal validation errors (empty name, empty item).”

## 14) Styling Pass
Prompt:
“Polish layout to reduce overwhelm: use sections, spacing, and consistent button styles. Keep it compact and aligned to existing dark theme.”

## 15) QA Checklist + Fixes
Prompt:
“Provide a manual QA checklist for: create/rename/delete pool, add/edit/delete items, search/tag filter, bulk add, JSON/CSV import/export, and add-to-prompt integration. Then fix any bugs found.”
