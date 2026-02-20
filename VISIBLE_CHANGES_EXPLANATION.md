# Exactly What Changes Should Be Visible in the Browser

## Summary

There are **TWO** visible changes that should appear:

1. **"Actions" category in the sidebar** (Visible IMMEDIATELY - Phase 1)
2. **Sectioned prompt display** (Visible ONLY when you generate a prompt with multiple categories - Phase 3)

---

## Visible Change #1: Actions Category in Sidebar

### What You Should See:
- **Location**: Left sidebar (CategorySidebar component)
- **New Item**: "Actions" should appear as a clickable category
- **Position**: Should appear between "Character"/"Subject" and "Style" categories
- **Visibility**: Should be visible **immediately** when the page loads

### How to Verify:
1. Open the app in browser
2. Look at the **left sidebar** (CategorySidebar)
3. You should see "Actions" listed as one of the categories
4. You can click on it to navigate to the Actions category

### If You Don't See It:
- Hard refresh the browser (Ctrl+F5)
- Restart the dev server
- Check browser console for errors

---

## Visible Change #2: Sectioned Prompt Display

### What You Should See (Conditional):
- **Location**: Prompt Preview panel (right side, usually)
- **Change**: Instead of showing a flat comma-separated string, prompts should be organized into sections with headers
- **Visibility**: **ONLY visible when**:
  1. You have generated a prompt
  2. The prompt contains selections from **multiple categories**
  3. The prompt object has a `sections` property with content

### Before (Old Display):
```
Prompt
[flat comma-separated text like: "character, style, lighting, camera"]
```

### After (New Display - When Conditions Met):
```
Characters:
[your character selections]

Style:
[your style selections]

Lighting:
[your lighting selections]

Camera:
[your camera selections]
```

### When This Appears:
- **NOT visible** if you haven't generated a prompt yet
- **NOT visible** if you only selected from one category
- **VISIBLE** when you select from multiple categories (e.g., Character + Style + Lighting) and generate a prompt

### How to Test This:
1. Select items from **multiple categories**:
   - Select something from "Character" category
   - Select something from "Style" category
   - Select something from "Lighting" category
2. Generate a prompt (click through to completion or click "Finish")
3. Look at the **Prompt Preview** panel
4. You should see sections with headers instead of flat text

---

## What Should NOT Change

### Things That Stay the Same:
- The prompt text itself (positiveTokens) - still comma-separated
- Copy functionality - still copies the flat format
- Negative prompt display - unchanged
- Token count display - unchanged
- All other UI elements - unchanged

### Backward Compatibility:
- If a prompt doesn't have sections (old prompts, single category, etc.), it will display the **old flat format**
- This ensures backward compatibility

---

## Step-by-Step Visual Test

### Test 1: Actions Category (Should Work Immediately)
1. ✅ Open browser
2. ✅ Look at left sidebar
3. ✅ See "Actions" category listed
4. ✅ Click "Actions"
5. ✅ See question: "What actions or activities?"
6. ✅ Select an action
7. ✅ Action appears in prompt

### Test 2: Section Display (Requires Multiple Categories)
1. ✅ Navigate to "Character" category
2. ✅ Select a character attribute
3. ✅ Navigate to "Style" category
4. ✅ Select a style attribute
5. ✅ Navigate to "Lighting" category
6. ✅ Select a lighting attribute
7. ✅ Generate prompt (click "Finish" or complete interview)
8. ✅ Look at Prompt Preview
9. ✅ Should see:
    ```
    Characters:
    [your character selection]
    
    Style:
    [your style selection]
    
    Lighting:
    [your lighting selection]
    ```

---

## Troubleshooting

### If "Actions" doesn't appear in sidebar:
- Check browser console (F12) for errors
- Verify `src/data/actions.json` exists
- Verify `src/data/categoryMap.ts` has `actions` entry
- Restart dev server
- Hard refresh browser (Ctrl+F5)

### If sections don't appear:
- **This is normal if you haven't generated a prompt yet**
- **This is normal if you only selected from one category**
- Make sure you select from **at least 2-3 different categories**
- Generate a prompt (sections only appear after prompt generation)
- Check browser console - look at the prompt object:
  ```javascript
  // In browser console after generating prompt:
  console.log(prompt.sections) // Should show sections object
  ```

---

## Expected Behavior Summary

| Change | Visible When | Location | Phase |
|--------|--------------|----------|-------|
| "Actions" in sidebar | Immediately on page load | Left sidebar (CategorySidebar) | Phase 1 |
| Sectioned prompt display | After generating prompt with multiple categories | Prompt Preview panel | Phase 3 |

---

## Quick Check List

- [ ] "Actions" category appears in left sidebar
- [ ] Can click "Actions" to navigate
- [ ] Can select actions
- [ ] Actions appear in generated prompt
- [ ] Made selections from multiple categories
- [ ] Generated a prompt
- [ ] Prompt preview shows sections with headers (instead of flat text)

---

## Important Notes

1. **Phase 2 has NO visible changes** - It only changes the data structure (backend)
2. **Sections only appear conditionally** - Not all prompts will show sections
3. **Backward compatibility** - Old-style flat display still works when sections aren't available
4. **Copy functionality unchanged** - Still copies flat format (no section headers in copied text)

