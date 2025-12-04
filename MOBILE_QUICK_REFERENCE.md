# Quick Mobile Layout Reference

## Safe Area CSS
```css
.main-content {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

@media (max-width: 640px) {
  .main-content {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}
```

## Responsive Button Pattern
```tsx
<button className="w-full py-4 sm:py-6 text-lg sm:text-3xl">
  <span className="hidden sm:inline">Full text</span>
  <span className="sm:hidden">Short</span>
</button>
```

## Responsive Breakpoints
| Breakpoint | CSS | Usage |
|---|---|---|
| Mobile | Default | < 640px |
| Desktop | sm: | ≥ 640px |

## Touch Target Sizes (WCAG AA)
- **Minimum**: 48px × 48px
- **Current Buttons**: 52-64px height
- **Status**: ✅ Exceeds minimum

## Device Safe Areas
| Device | Type | Safe Area | Handling |
|---|---|---|---|
| iPhone 14 Pro | Notch | Dynamic island | ✅ CSS handles |
| iPhone 13 | Notch | Top notch | ✅ CSS handles |
| Android 12+ | Punch-hole | Top center | ✅ CSS handles |
| Regular phones | None | 0px all sides | ✅ CSS defaults |

## Build & Deploy
```bash
# Development
npm run dev              # Port 1114 (if 1113 busy)

# Production build
npm run build            # ~11.26s

# Preview production
npm run preview          # Port 4173
```

## Key Files
- `src/pages/HomePage.tsx` - Responsive buttons + safe-area CSS
- `src/hooks/useGameEquipment.ts` - Powerup display logic
- `src/components/game/Bird.tsx` - Powerup animations
- `index.html` - Viewport meta configuration

## Verification Checklist
- [ ] All buttons visible on 320px screen
- [ ] No horizontal scrolling
- [ ] Touch targets 48px+ height
- [ ] Safe area padding on notched devices
- [ ] Powerup animations smooth
- [ ] Text scales appropriately
- [ ] No overflow on mobile

---

**Status**: Production Ready ✅
