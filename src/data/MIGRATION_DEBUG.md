# Migration Debug Guide

## Current Issue
Migration is not finding/loading old data files.

## What to Check

1. **Browser Console Logs**:
   - Look for `[Migration]` prefixed messages
   - Check if files are being found
   - Check if migration is running
   - Check error messages

2. **Expected Console Output**:
   ```
   [Migration] Found X old data files, migrating...
   [Migration] Processing X data files...
   [Migration] Collected X nodes from old data
   [Migration] Migrated X attribute definitions
   [Migration] Final result: X attributes, X question nodes
   ```

3. **If No Files Found**:
   - Check that `PCV1_final/src/data/interview/` exists
   - Check Vite is allowing access to files outside src
   - Try restarting the dev server after vite.config.ts changes

4. **If Migration Returns 0 Results**:
   - Check migration logic in `migrateFromOld.ts`
   - Check that nodes have `answers` arrays
   - Check that answers are not being skipped incorrectly

## Quick Test

Open browser console and check:
- `[Migration]` logs
- Any error messages
- Final attribute count

If you see "No old data files found", the glob pattern isn't matching.
If you see "Migrated 0 definitions", the migration logic has an issue.

