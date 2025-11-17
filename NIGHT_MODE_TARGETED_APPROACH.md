# Night Mode - Targeted Approach

## Summary
Replaced the aggressive night mode CSS approach with a targeted, component-specific styling system that prevents text visibility issues while maintaining proper night mode functionality.

## Problem with Previous Approach

### **Issues with Aggressive CSS:**
1. **Broad Selectors**: Used `[data-theme="dark"] *` and `[data-theme="night"] *` that affected ALL elements
2. **!important Overrides**: Forced styling on every element, causing text visibility issues
3. **Global Impact**: Affected pages and components that didn't need night mode styling
4. **Poor Text Contrast**: Made text invisible or hard to read in many cases

### **Specific Problems:**
- Text became invisible on light backgrounds in night mode
- All buttons, links, and text elements were forced to white
- No granular control over which components needed night mode
- CSS conflicts with existing component styles

## New Targeted Approach

### **1. Component-Specific CSS Classes**
Instead of global selectors, we now use specific CSS classes:

```css
/* OLD - Aggressive approach */
[data-theme="dark"] *,
[data-theme="night"] *,
.dark * {
  color: #ffffff !important;
}

/* NEW - Targeted approach */
[data-theme="dark"] .npc-dialog-bubble,
[data-theme="night"] .npc-dialog-bubble,
.dark .npc-dialog-bubble {
  background-color: #1f2937 !important;
  color: #ffffff !important;
}
```

### **2. Enhanced Theme Hook**
The `useTheme` hook now provides component-specific styling utilities:

```typescript
const { getThemeStyles } = useTheme();

// Use in components
const dialogStyle = getThemeStyles.npcDialog;
const nameStyle = getThemeStyles.npcName;
```

### **3. CSS Classes for Night Mode Components**
- `.npc-dialog-bubble` - For NPC dialog bubbles
- `.npc-name-text` - For NPC names
- `.npc-subtitle-text` - For NPC subtitles
- `.night-mode-component` - For general night mode components
- `.night-mode-card` - For cards that need night mode
- `.night-mode-modal` - For modals that need night mode

## Implementation

### **1. Updated CSS File (`src/styles/night-mode-fixes.css`)**
- Removed aggressive global selectors
- Added targeted component-specific rules
- Only affects components that explicitly need night mode styling

### **2. Updated NPC Components**
- `FooterNPC.tsx` - Added `npc-dialog-bubble`, `npc-name-text`, `npc-subtitle-text` classes
- `NPCGuide1.tsx` - Added targeted CSS classes
- `PerformanceMonitorPage.tsx` - Added targeted CSS classes

### **3. Enhanced Theme Hook (`src/hooks/useTheme.ts`)**
- Added `getThemeStyles` object with component-specific styles
- Provides consistent theme styling across components
- Avoids CSS conflicts and overrides

## Benefits of New Approach

### **1. Better Text Visibility**
- Only affects components that need night mode
- Preserves existing text styling on other components
- No more invisible text issues

### **2. Granular Control**
- Each component can opt-in to night mode styling
- Easy to add/remove night mode for specific components
- No unintended side effects

### **3. Maintainable Code**
- Clear separation of concerns
- Easy to debug and modify
- Component-specific styling logic

### **4. Performance**
- Reduced CSS specificity conflicts
- Faster rendering (fewer CSS rules to process)
- Better browser optimization

## Usage Examples

### **For NPC Dialogs:**
```typescript
const { getThemeStyles } = useTheme();

// In component
<div 
  className="npc-dialog-bubble"
  style={getThemeStyles.npcDialog}
>
  {dialogText}
</div>
```

### **For Cards:**
```typescript
<div className="night-mode-card">
  <h3 style={{ color: getThemeStyles.text.primary }}>
    Card Title
  </h3>
  <p style={{ color: getThemeStyles.text.secondary }}>
    Card content
  </p>
</div>
```

### **For Forms:**
```typescript
<form className="night-mode-form">
  <input 
    style={getThemeStyles.input}
    placeholder="Enter text..."
  />
</form>
```

## Migration Guide

### **For Existing Components:**
1. **Identify components that need night mode**
2. **Add appropriate CSS classes** (e.g., `npc-dialog-bubble`)
3. **Use `getThemeStyles` from `useTheme` hook**
4. **Test in both light and night modes**

### **For New Components:**
1. **Use `getThemeStyles` for consistent theming**
2. **Add specific CSS classes if needed**
3. **Test text visibility in both themes**

## Testing Checklist

### **Text Visibility:**
- [ ] All text is visible in light mode
- [ ] All text is visible in night mode
- [ ] No text appears invisible or with poor contrast
- [ ] NPC dialogs are clearly readable
- [ ] Important notes and warnings are visible

### **Component Functionality:**
- [ ] NPC dialogs work correctly in both modes
- [ ] Theme switching works smoothly
- [ ] No CSS conflicts or overrides
- [ ] Performance is not affected

### **Accessibility:**
- [ ] Proper contrast ratios maintained
- [ ] Focus states work correctly
- [ ] Screen readers can access all content
- [ ] High contrast mode support

## Result

The new targeted approach provides:
- **Better text visibility** - No more invisible text issues
- **Granular control** - Only affects components that need night mode
- **Maintainable code** - Clear, component-specific styling
- **Better performance** - Reduced CSS conflicts and processing
- **Consistent theming** - Reliable theme switching across components

This approach ensures that night mode enhances the user experience without causing text visibility problems!
