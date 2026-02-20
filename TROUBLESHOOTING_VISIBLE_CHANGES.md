# Troubleshooting: Why Don't I See Visible Changes?

## Expected Visible Changes

### ✅ Phase 1: Actions Category (Should be Visible IMMEDIATELY)

**What to look for:**
- "Actions" should appear in the CategorySidebar (left side)
- It should appear between "Character" (or "Subject") and "Style"
- Click on it to navigate to the Actions category

**Why you might not see it:**
1. **Browser cache** - Try hard refresh (Ctrl+F5 or Ctrl+Shift+R)
2. **Dev server not restarted** - The dev server needs to reload the new JSON files
3. **JavaScript error** - Check browser console for errors

**To verify it's working:**
1. Open browser console (F12)
2. Look for: `[loadAttributeDefinitions] Loading category: actions`
3. Look for: `[App] ✓ Category "actions" is fully integrated`

---

### ⚠️ Phase 2: Section Grouping (NO Visible Changes - This is Normal!)

**What this phase does:**
- Adds `sections` object to the Prompt data structure
- This is backend/data only - NO UI changes

**You won't see any visible changes from Phase 2 alone.**

---

### ✅ Phase 3: Section Display (Visible ONLY When Conditions Met)

**What to look for:**
- Prompt preview should show sections with headers like:
  - "Scene:"
  - "Characters:"
  - "Actions:"
  - "Style:"
  - etc.

**Why you might not see sections:**

1. **You haven't generated a prompt yet** - Sections only appear when a prompt is generated
2. **You only selected from one category** - Sections only appear when you have selections from multiple categories
3. **Empty prompt** - If no selections are made, sections won't appear

**To see sections:**
1. Make selections from MULTIPLE categories (e.g., select something from Subject, Style, Lighting)
2. Click "Next" or generate a prompt
3. Look at the Prompt Preview panel
4. You should see sections with headers instead of flat text

**Example workflow to see sections:**
1. Select something from "Character" category
2. Select something from "Style" category  
3. Select something from "Lighting" category
4. Generate prompt
5. Prompt Preview should show:
   ```
   Characters:
   [your character selections]
   
   Style:
   [your style selections]
   
   Lighting:
   [your lighting selections]
   ```

---

## Troubleshooting Steps

### Step 1: Check if Actions Category Appears

1. **Open the app** in browser
2. **Look at the CategorySidebar** (left side)
3. **Find "Actions"** - it should be there
4. If NOT visible:
   - Open browser console (F12)
   - Check for errors (red text)
   - Try hard refresh (Ctrl+F5)
   - Restart dev server: Stop it (Ctrl+C) and run `npm run dev` again

### Step 2: Check Browser Console

1. Press F12 to open developer tools
2. Go to Console tab
3. Look for:
   - `[loadAttributeDefinitions] Loading category: actions` - Should appear
   - `[App] ✓ Category "actions" is fully integrated` - Should appear
   - Any red error messages? - These need to be fixed

### Step 3: Test Actions Category

1. Click on "Actions" in the CategorySidebar
2. You should see question: "What actions or activities?"
3. Select one or more actions
4. Click "Next"
5. Actions should appear in the generated prompt

### Step 4: Test Section Display

1. Make selections from MULTIPLE categories:
   - Select something from "Character"
   - Select something from "Style"
   - Select something from "Lighting"
2. Generate a prompt (click through to completion or use "Finish")
3. Look at Prompt Preview
4. Should see sections with headers instead of flat comma-separated text

### Step 5: Verify Code Changes

If still not working, verify files exist:
- ✅ `src/data/actions.json` - Should exist
- ✅ `src/data/questions/actions.json` - Should exist
- ✅ `src/data/categoryMap.ts` - Should have `actions` entry
- ✅ `src/ui/App.tsx` - Should have `'actions'` in CATEGORY_ORDER
- ✅ `src/types/entities.ts` - Should have `'actions'` in category types
- ✅ `src/modules/prompt-assembler.ts` - Should have CATEGORY_TO_SECTION_MAP
- ✅ `src/ui/components/PromptPreview.tsx` - Should have section rendering logic

---

## Quick Diagnostic Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console shows no errors (F12 → Console)
- [ ] Actions category appears in sidebar
- [ ] Can click on Actions category
- [ ] Can select actions
- [ ] Actions appear in generated prompt
- [ ] Made selections from multiple categories
- [ ] Prompt preview shows sections with headers (when multiple categories selected)

---

## Common Issues

### Issue 1: "Actions" not in sidebar

**Solution:**
- Restart dev server
- Hard refresh browser (Ctrl+F5)
- Check browser console for errors

### Issue 2: Sections don't appear in preview

**Solution:**
- Make sure you've selected items from MULTIPLE categories
- Generate a prompt (sections only appear after prompt generation)
- Check browser console - look at the prompt object in console:
  ```javascript
  // In browser console after generating prompt:
  console.log(prompt.sections) // Should show sections object
  ```

### Issue 3: Still seeing flat text in preview

**Possible reasons:**
- Only selected from one category (sections need multiple)
- Prompt doesn't have sections (check console for prompt.sections)
- Browser cache - try hard refresh

---

## Testing Workflow

1. **Test Actions Category:**
   - Open app
   - See "Actions" in sidebar → ✅ Phase 1 working
   - Click "Actions" → Should navigate
   - Select an action → Should appear in prompt

2. **Test Section Display:**
   - Select from "Character" category
   - Select from "Style" category
   - Select from "Lighting" category
   - Generate prompt
   - Prompt Preview shows sections → ✅ Phase 3 working

---

## Summary

- **Actions category (Phase 1)**: Should be visible immediately in sidebar
- **Section grouping (Phase 2)**: No visible changes (backend only)
- **Section display (Phase 3)**: Only visible when:
  - Prompt is generated
  - Selections from multiple categories exist
  - prompt.sections object has content

If Actions category doesn't appear, there's likely an issue. If sections don't appear, it's likely because you need to select from multiple categories first.

