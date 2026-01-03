# Implementation Plan: Layout and Sidebar

**Feature ID:** 003-UI-Layout  
**Plan ID:** plan-001  
**Specification:** spec-001  
**Created:** 2025-11-30  
**Status:** Draft  
**Estimated Duration:** 2-3 days

## Overview

This plan outlines the implementation of a main layout wrapper with sidebar and topbar components for protected routes. The implementation will use Next.js App Router, Tailwind CSS, and integrate with the existing authentication system.

## Implementation Phases

### Phase 1: Project Setup & Dependencies (30 minutes)

**Objective:** Set up Tailwind CSS and required dependencies

**Tasks:**
1. Install Tailwind CSS and dependencies
   - `tailwindcss`, `postcss`, `autoprefixer`
   - `lucide-react` for icons
   - Configure `tailwind.config.js`
   - Configure `postcss.config.js`

2. Update `globals.css` with Tailwind directives
   - Add `@tailwind base`, `@tailwind components`, `@tailwind utilities`

3. Verify Tailwind CSS is working
   - Create a test component
   - Verify styles are applied correctly

**Deliverables:**
- ✅ Tailwind CSS installed and configured
- ✅ Icon library installed
- ✅ Configuration files updated

**Acceptance Criteria:**
- Tailwind CSS compiles without errors
- Test component renders with Tailwind styles

---

### Phase 2: Layout Structure & Route Groups (1 hour)

**Objective:** Create the main layout structure using Next.js route groups

**Tasks:**
1. Create route group structure
   - Create `app/(protected)/` directory
   - Create `app/(protected)/layout.tsx`
   - Move/create `app/(protected)/dashboard/page.tsx`

2. Implement basic layout wrapper
   - Create layout component structure
   - Add Sidebar and Topbar placeholders
   - Set up responsive container structure

3. Test layout rendering
   - Verify layout wraps dashboard page
   - Check that routes are accessible

**Deliverables:**
- ✅ Route group structure created
- ✅ Basic layout wrapper implemented
- ✅ Dashboard page uses new layout

**Acceptance Criteria:**
- Layout wrapper renders correctly
- Dashboard page is accessible at `/dashboard`
- Layout applies to protected routes only

---

### Phase 3: Sidebar Component (2-3 hours)

**Objective:** Build the sidebar navigation component

**Tasks:**
1. Create sidebar component structure
   - Create `components/layout/sidebar.tsx`
   - Set up component props and types
   - Add basic styling with Tailwind

2. Implement navigation links
   - Add Dashboard link (`/dashboard`)
   - Add My Assets link (`/assets`)
   - Add AI Analysis link (`/analysis`)
   - Add Settings link (`/settings`)
   - Add icons for each link (Lucide React)

3. Implement active route highlighting
   - Use `usePathname` hook to detect current route
   - Apply active styles to current route
   - Add hover states and transitions

4. Add branding/logo
   - Add logo or app name at top of sidebar
   - Style appropriately

**Deliverables:**
- ✅ Sidebar component created
- ✅ All navigation links functional
- ✅ Active route highlighting works
- ✅ Icons displayed correctly

**Acceptance Criteria:**
- Sidebar displays all 4 navigation links
- Active route is visually highlighted
- Icons are displayed correctly
- Navigation works (client-side routing)

---

### Phase 4: Topbar Component (2 hours)

**Objective:** Build the topbar with user profile information

**Tasks:**
1. Create topbar component structure
   - Create `components/layout/topbar.tsx`
   - Set up component props and types
   - Add basic styling with Tailwind

2. Integrate user session data
   - Use `getCurrentUser` from auth actions
   - Display user name
   - Display user profile picture (or avatar fallback)
   - Handle loading and error states

3. Implement user menu dropdown
   - Add dropdown menu component
   - Add menu items (Profile, Settings, Logout)
   - Implement dropdown toggle functionality
   - Add click outside to close functionality

4. Add mobile menu toggle button
   - Add hamburger menu icon
   - Connect to sidebar toggle state
   - Style appropriately for mobile

**Deliverables:**
- ✅ Topbar component created
- ✅ User profile displayed correctly
- ✅ User menu dropdown functional
- ✅ Mobile menu toggle button added

**Acceptance Criteria:**
- User name and profile picture displayed
- User menu dropdown works correctly
- Mobile menu toggle button visible on mobile
- Loading states handled gracefully

---

### Phase 5: Responsive Design & Mobile Support (2-3 hours)

**Objective:** Make the layout fully responsive with mobile support

**Tasks:**
1. Implement sidebar state management
   - Add `useState` for sidebar open/closed state
   - Create toggle function
   - Pass state to Sidebar and Topbar components

2. Desktop layout (> 1024px)
   - Sidebar always visible (fixed width: 256px)
   - Topbar full width
   - Main content adjusts automatically
   - Smooth transitions

3. Tablet layout (768px - 1024px)
   - Sidebar toggleable (overlay mode)
   - Hamburger menu button visible
   - Sidebar slides in from left when opened
   - Backdrop overlay when sidebar is open

4. Mobile layout (< 768px)
   - Sidebar hidden by default
   - Hamburger menu button in topbar
   - Sidebar slides in from left when opened
   - Backdrop overlay when sidebar is open
   - Sidebar closes when clicking outside or on a link
   - Touch-friendly sizing

5. Add animations and transitions
   - Smooth slide-in/out animations (200-300ms)
   - Backdrop fade-in/out
   - Link hover effects
   - Active state transitions

**Deliverables:**
- ✅ Responsive design implemented
- ✅ Mobile sidebar works correctly
- ✅ Animations and transitions smooth
- ✅ Touch-friendly interactions

**Acceptance Criteria:**
- Layout works correctly on all screen sizes
- Sidebar toggle works on mobile/tablet
- Animations are smooth and not distracting
- Backdrop overlay works correctly
- Sidebar closes when clicking outside or on link

---

### Phase 6: Styling & Polish (2-3 hours)

**Objective:** Apply consistent styling and polish the UI

**Tasks:**
1. Define color scheme
   - Create or use existing theme colors
   - Apply consistent colors throughout
   - Ensure proper contrast for accessibility

2. Typography
   - Define font sizes and weights
   - Apply consistent typography
   - Ensure readability

3. Spacing and layout
   - Follow 8px grid system
   - Consistent padding and margins
   - Proper spacing between elements

4. Icons and visual elements
   - Ensure icons are properly sized
   - Add hover effects
   - Ensure visual consistency

5. Accessibility improvements
   - Add proper ARIA labels
   - Ensure keyboard navigation works
   - Test with screen readers
   - Ensure color contrast meets WCAG AA

6. Polish and refinements
   - Fine-tune spacing and alignment
   - Add subtle shadows and borders
   - Ensure consistent styling throughout
   - Test on different browsers

**Deliverables:**
- ✅ Consistent styling applied
- ✅ Accessibility requirements met
- ✅ UI polished and refined
- ✅ Cross-browser compatibility verified

**Acceptance Criteria:**
- Design is consistent and polished
- Accessibility requirements met (WCAG 2.1 AA)
- Keyboard navigation works
- Works correctly on major browsers

---

### Phase 7: Integration & Testing (1-2 hours)

**Objective:** Integrate layout with existing system and test thoroughly

**Tasks:**
1. Integrate with authentication
   - Verify user session data loads correctly
   - Test logout functionality
   - Ensure protected routes work correctly

2. Create placeholder pages
   - Create `/assets` page placeholder
   - Create `/analysis` page placeholder
   - Create `/settings` page placeholder
   - Ensure all routes are accessible

3. Test navigation
   - Test all navigation links
   - Verify active route highlighting
   - Test mobile navigation
   - Test user menu dropdown

4. Test responsive behavior
   - Test on different screen sizes
   - Test sidebar toggle on mobile
   - Test backdrop overlay
   - Verify layout doesn't break

5. Fix any issues
   - Address any bugs found
   - Improve performance if needed
   - Optimize animations

**Deliverables:**
- ✅ Layout integrated with auth system
- ✅ All placeholder pages created
- ✅ Navigation tested and working
- ✅ Responsive behavior verified

**Acceptance Criteria:**
- All navigation links work correctly
- User session data displays correctly
- Layout works on all screen sizes
- No console errors or warnings
- Performance is acceptable

---

## Technical Considerations

### Dependencies
- `tailwindcss`: ^3.4.0
- `postcss`: ^8.4.0
- `autoprefixer`: ^10.4.0
- `lucide-react`: ^0.400.0 (or latest)

### File Structure
```
app/
  (protected)/
    layout.tsx
    dashboard/
      page.tsx
    assets/
      page.tsx
    analysis/
      page.tsx
    settings/
      page.tsx

components/
  layout/
    sidebar.tsx
    topbar.tsx

tailwind.config.js
postcss.config.js
```

### Key Implementation Details

1. **Route Groups**: Use Next.js route groups `(protected)` to organize protected routes without affecting URL structure

2. **State Management**: Use React `useState` for sidebar open/closed state, manage at layout level

3. **Session Data**: Use Server Components where possible, Client Components only when needed (interactivity)

4. **Responsive Breakpoints**: Use Tailwind's default breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

5. **Icons**: Use Lucide React for consistent iconography

6. **Accessibility**: Ensure proper ARIA labels, keyboard navigation, and screen reader support

## Risk Assessment

### Low Risk
- Tailwind CSS setup (well-documented)
- Basic layout structure (standard Next.js pattern)
- Icon integration (simple library usage)

### Medium Risk
- Responsive sidebar behavior (requires careful state management)
- User session integration (need to handle loading/error states)
- Cross-browser compatibility (need thorough testing)

### Mitigation Strategies
- Test responsive behavior early and often
- Handle all edge cases for user session data
- Test on multiple browsers and devices
- Use well-tested libraries (Lucide React, Tailwind CSS)

## Success Metrics

1. ✅ Layout renders correctly on all screen sizes
2. ✅ All navigation links work and highlight correctly
3. ✅ User profile displays correctly
4. ✅ Sidebar toggle works smoothly on mobile
5. ✅ No console errors or warnings
6. ✅ Accessibility requirements met
7. ✅ Performance is acceptable (< 100ms for interactions)

## Timeline

- **Phase 1**: 30 minutes
- **Phase 2**: 1 hour
- **Phase 3**: 2-3 hours
- **Phase 4**: 2 hours
- **Phase 5**: 2-3 hours
- **Phase 6**: 2-3 hours
- **Phase 7**: 1-2 hours

**Total Estimated Time**: 10-15 hours (1.5-2 days)

## Next Steps

1. Review and approve this plan
2. Create task breakdown (`/sp-task`)
3. Begin implementation starting with Phase 1
4. Test incrementally after each phase
5. Gather feedback and iterate

