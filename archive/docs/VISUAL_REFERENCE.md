# Visual Reference - Hardening Pass UI Changes

This document provides visual descriptions of the UI changes implemented in the hardening pass.

## 1. Dashboard Environment Warning Banner

**Location:** Top of `/dashboard` page  
**Visibility:** Only shown when:
- Critical ARC env vars are missing
- AND user is in development environment OR is an admin

**Appearance:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️  ⚠️ Missing ARC Environment Variables (Dev/Admin View)          │
│     The following keys are not configured:                          │
│     ARC_LIMIT_ELITE, ARC_STORAGE_BUCKET                            │
└─────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Amber/yellow tinted (amber-500/10)
- Border: Bottom border with amber accent (amber-500/30)
- Icon: Warning triangle (AlertTriangle from lucide-react)
- Text: Amber colored text for high visibility
- Layout: Full width, appears above all dashboard content

---

## 2. LockedFeature - Premium Unlock Panel

**Location:** Locked pages like `/members`, `/messages` for non-premium users  
**Purpose:** Replace blank pages with upgrade call-to-action

**Appearance:**
```
                    ┌────────────────────────┐
                    │     ✨ (Sparkles)      │  ← Amber gradient circle
                    └────────────────────────┘

                    Member Directory
                    
        Browse and connect with all 250 founding members.
      Search by expertise, filter by industry, and send direct
               messages to build meaningful relationships.

    ┌─────────────────────┐  ┌──────────────────────┐
    │ Upgrade to Premium →│  │ Back to Dashboard    │
    └─────────────────────┘  └──────────────────────┘
    
                Available from November 10, 2025
```

**Styling:**
- Container: Centered card with gradient background (zinc-900 to zinc-950)
- Icon: 64px circle with amber gradient, white sparkles icon
- Title: Large bold white text (2xl-3xl)
- Description: Gray text (zinc-400), centered
- Primary CTA: Amber gradient button with arrow, hover animation
- Secondary CTA: Dark gray button with white text
- Unlock date: Small gray text at bottom

**Interactive Elements:**
- "Upgrade to Premium" button has hover effect (darker gradient)
- Arrow icon translates right on hover (smooth transition)
- Both buttons have rounded corners and proper spacing

---

## 3. LockedFeature - Admin Preview Callout

**Location:** Above locked content for admin users  
**Purpose:** Indicate admin is viewing feature in preview mode

**Appearance:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ 👑  👑 Admin Preview Mode                                           │
│     You're viewing this feature as an admin                         │
└─────────────────────────────────────────────────────────────────────┘

[Feature content below...]
```

**Styling:**
- Background: Amber gradient (from-amber-500/10 to-amber-600/10)
- Border: Amber accent (amber-500/30)
- Icon: Crown icon (lucide-react)
- Text: Amber colored with two text sizes
- Layout: Full width banner with rounded corners
- Spacing: Margin bottom to separate from content

---

## 4. Onboarding Flow Visual

**Flow Diagram:**
```
Login
  │
  ├─→ No Session? → /login
  │
  ├─→ No Active Subscription? → /subscribe
  │
  ├─→ No Needs Assessment? → /welcome/quiz
  │
  └─→ ✓ All checks passed → /dashboard
```

**User Experience:**
1. User logs in successfully
2. System checks subscription status
3. If subscribed, checks for needs assessment completion
4. If assessment incomplete, shows quiz
5. After quiz completion, redirects to dashboard
6. Subsequent visits go straight to dashboard

---

## 5. Needs Assessment Quiz (Unchanged but Referenced)

**Location:** `/welcome/quiz`  
**Features:**
- Progress bar showing percentage complete
- Step-by-step questions
- Industry selection with search
- Multi-select goals (max 2)
- Travel frequency slider
- Motivation text input

**Integration with Onboarding Gate:**
- After submission, sets `needs_assessment_completed_at` timestamp
- User can then access dashboard
- No way to bypass this step for new users

---

## 6. Before vs After Comparison

### Before: Locked Feature (Blank Page)
```
┌─────────────────────────────────────┐
│  Header: Member Directory           │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         (blank/empty)               │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### After: Locked Feature (Premium Panel)
```
┌─────────────────────────────────────┐
│  Header: Member Directory           │
├─────────────────────────────────────┤
│        ✨                           │
│    Member Directory                 │
│                                     │
│   Premium feature description       │
│                                     │
│  [Upgrade] [Back to Dashboard]     │
│                                     │
│  Available from Nov 10, 2025        │
└─────────────────────────────────────┘
```

---

## 7. Color Palette Reference

**Primary Colors:**
- Amber/Gold: `#fbbf24` (amber-400) to `#f59e0b` (amber-500/600)
- Used for CTAs, accents, admin indicators

**Background Colors:**
- Black: `#000000` (black)
- Dark Gray: `#18181b` (zinc-950)
- Card Gray: `#27272a` (zinc-900)
- Border Gray: `#3f3f46` (zinc-800)

**Text Colors:**
- White: `#ffffff` (white)
- Light Gray: `#a1a1aa` (zinc-400)
- Dark Gray: `#71717a` (zinc-500)

---

## 8. Responsive Behavior

**Desktop (≥768px):**
- Premium panel: Full centered layout
- Buttons: Side-by-side horizontal layout
- Text: Larger font sizes (2xl-3xl for titles)

**Mobile (<768px):**
- Premium panel: Full width with padding
- Buttons: Stacked vertical layout
- Text: Slightly smaller (xl-2xl for titles)
- Icon sizes adjust proportionally

---

## 9. Animation & Transitions

**Hover Effects:**
- Buttons: Smooth color transitions (transition-all)
- Arrow icons: Translate right on hover (1rem)
- Background gradients: Darken on hover

**Loading States:**
- No explicit loading states in LockedFeature
- Instant render when children check completes

**Entrance:**
- No entrance animations (instant render)
- Content should be immediately visible

---

## 10. Accessibility Considerations

**Keyboard Navigation:**
- All buttons are keyboard accessible
- Tab order follows visual flow
- Enter/Space activates buttons

**Screen Readers:**
- Semantic HTML (divs with proper structure)
- Link elements for navigation
- Icon + text labels for clarity

**Color Contrast:**
- White text on dark backgrounds meets WCAG AA
- Amber text on dark backgrounds tested for readability
- Button text (black on amber) has high contrast

---

## Notes for Testing

When testing the visual changes:
1. Check on different screen sizes (mobile, tablet, desktop)
2. Verify colors match the design system
3. Test all interactive elements (hover, click, keyboard)
4. Ensure text is readable and properly sized
5. Check that spacing and alignment are consistent
6. Verify icons render correctly
7. Test with and without admin privileges
8. Check banner appears/disappears based on env config

---

## Future Enhancements (Not in Scope)

Potential improvements for future iterations:
- Fade-in animation for premium panel
- More granular tier-specific messaging
- Preview mode toggle for admins
- Dark/light theme support
- Customizable unlock panel themes
