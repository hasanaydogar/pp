# Task Breakdown: Layout and Sidebar

**Feature ID:** 003-UI-Layout  
**Task ID:** task-001  
**Plan:** plan-001  
**Specification:** spec-001  
**Created:** 2025-11-30  
**Status:** Pending

## Phase 1: Project Setup & Dependencies

### Task 1.1: Install Tailwind CSS
- [ ] Install `tailwindcss`, `postcss`, `autoprefixer` packages
- [ ] Run `npx tailwindcss init -p` to create config files
- [ ] Verify `tailwind.config.js` and `postcss.config.js` are created
- [ ] Update `tailwind.config.js` with content paths
- **Files**: `tailwind.config.js`, `postcss.config.js`, `package.json`
- **Estimated Time**: 10 minutes

### Task 1.2: Configure Tailwind CSS
- [ ] Update `app/globals.css` with Tailwind directives
- [ ] Add `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
- [ ] Configure content paths in `tailwind.config.js` (app, components directories)
- [ ] Test Tailwind compilation (run `npm run dev`)
- **Files**: `app/globals.css`, `tailwind.config.js`
- **Estimated Time**: 10 minutes

### Task 1.3: Install Icon Library
- [ ] Install `lucide-react` package
- [ ] Verify installation in `package.json`
- [ ] Test importing an icon in a test component
- **Files**: `package.json`
- **Estimated Time**: 5 minutes

### Task 1.4: Verify Setup
- [ ] Create a test component with Tailwind classes
- [ ] Verify styles are applied correctly
- [ ] Test icon rendering
- [ ] Check for any compilation errors
- **Files**: Test component (can be temporary)
- **Estimated Time**: 5 minutes

**Phase 1 Total**: 30 minutes

---

## Phase 2: Layout Structure & Route Groups

### Task 2.1: Create Route Group Structure
- [ ] Create `app/(protected)/` directory
- [ ] Create `app/(protected)/layout.tsx` file
- [ ] Set up basic layout component structure
- [ ] Export default layout component
- **Files**: `app/(protected)/layout.tsx`
- **Estimated Time**: 15 minutes

### Task 2.2: Create Dashboard Page
- [ ] Create `app/(protected)/dashboard/` directory
- [ ] Create `app/(protected)/dashboard/page.tsx`
- [ ] Add basic page content (placeholder)
- [ ] Verify page is accessible at `/dashboard`
- **Files**: `app/(protected)/dashboard/page.tsx`
- **Estimated Time**: 10 minutes

### Task 2.3: Implement Basic Layout Wrapper
- [ ] Create layout component structure with children prop
- [ ] Add Sidebar placeholder component import
- [ ] Add Topbar placeholder component import
- [ ] Set up basic container structure (flex/grid)
- [ ] Add placeholder divs for Sidebar and Topbar
- **Files**: `app/(protected)/layout.tsx`
- **Estimated Time**: 20 minutes

### Task 2.4: Test Layout Rendering
- [ ] Verify layout wraps dashboard page correctly
- [ ] Check that routes are accessible
- [ ] Verify no console errors
- [ ] Test navigation to `/dashboard`
- **Files**: Test in browser
- **Estimated Time**: 15 minutes

**Phase 2 Total**: 1 hour

---

## Phase 3: Sidebar Component

### Task 3.1: Create Sidebar Component Structure
- [ ] Create `components/layout/` directory
- [ ] Create `components/layout/sidebar.tsx` file
- [ ] Set up component with TypeScript types
- [ ] Add basic component structure (export default function)
- [ ] Add props interface (isOpen, onClose, etc.)
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 15 minutes

### Task 3.2: Add Basic Sidebar Styling
- [ ] Add Tailwind classes for sidebar container
- [ ] Set fixed width (256px) for desktop
- [ ] Add background color and border
- [ ] Add padding and spacing
- [ ] Style sidebar container appropriately
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 20 minutes

### Task 3.3: Add Logo/Branding
- [ ] Add logo or app name at top of sidebar
- [ ] Style logo/branding appropriately
- [ ] Add padding and spacing
- [ ] Make it visually appealing
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 15 minutes

### Task 3.4: Implement Dashboard Navigation Link
- [ ] Import `Link` from `next/link`
- [ ] Import `usePathname` from `next/navigation`
- [ ] Add Dashboard link with `/dashboard` path
- [ ] Add icon (LayoutDashboard from lucide-react)
- [ ] Add hover and active states
- [ ] Test navigation works
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 20 minutes

### Task 3.5: Implement My Assets Navigation Link
- [ ] Add My Assets link with `/assets` path
- [ ] Add icon (Briefcase or Wallet from lucide-react)
- [ ] Add hover and active states
- [ ] Test navigation works
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 15 minutes

### Task 3.6: Implement AI Analysis Navigation Link
- [ ] Add AI Analysis link with `/analysis` path
- [ ] Add icon (Brain or Sparkles from lucide-react)
- [ ] Add hover and active states
- [ ] Test navigation works
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 15 minutes

### Task 3.7: Implement Settings Navigation Link
- [ ] Add Settings link with `/settings` path
- [ ] Add icon (Settings or Cog from lucide-react)
- [ ] Add hover and active states
- [ ] Test navigation works
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 15 minutes

### Task 3.8: Implement Active Route Highlighting
- [ ] Use `usePathname` hook to get current route
- [ ] Compare current route with link paths
- [ ] Apply active styles (background color, text color)
- [ ] Add smooth transitions for active state changes
- [ ] Test active highlighting works correctly
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 30 minutes

### Task 3.9: Add Link Hover Effects
- [ ] Add hover background color change
- [ ] Add hover text color change
- [ ] Add smooth transitions (200-300ms)
- [ ] Ensure hover effects are consistent
- [ ] Test hover effects work correctly
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 15 minutes

### Task 3.10: Integrate Sidebar into Layout
- [ ] Import Sidebar component in layout
- [ ] Add Sidebar to layout structure
- [ ] Pass necessary props (isOpen, onClose)
- [ ] Verify Sidebar renders correctly
- [ ] Test all navigation links work
- **Files**: `app/(protected)/layout.tsx`
- **Estimated Time**: 20 minutes

**Phase 3 Total**: 2.5-3 hours

---

## Phase 4: Topbar Component

### Task 4.1: Create Topbar Component Structure
- [ ] Create `components/layout/topbar.tsx` file
- [ ] Set up component with TypeScript types
- [ ] Add basic component structure
- [ ] Add props interface (onMenuToggle, etc.)
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 15 minutes

### Task 4.2: Add Basic Topbar Styling
- [ ] Add Tailwind classes for topbar container
- [ ] Set full width and fixed height
- [ ] Add background color and border
- [ ] Add padding and spacing
- [ ] Style topbar container appropriately
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 20 minutes

### Task 4.3: Create User Profile Section
- [ ] Create user profile container div
- [ ] Add flex layout for user info
- [ ] Add spacing and alignment
- [ ] Style appropriately
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 15 minutes

### Task 4.4: Integrate User Session Data
- [ ] Import `getCurrentUser` from `@/lib/auth/actions`
- [ ] Fetch user data in Server Component or use client-side hook
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Display user name
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 30 minutes

### Task 4.5: Display User Profile Picture
- [ ] Get user profile picture from session
- [ ] Add avatar/image component
- [ ] Add fallback avatar (initials or default icon)
- [ ] Style avatar appropriately (circular, size)
- [ ] Handle missing profile picture gracefully
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 25 minutes

### Task 4.6: Create User Menu Dropdown
- [ ] Create dropdown menu component structure
- [ ] Add dropdown toggle button
- [ ] Add dropdown menu container
- [ ] Add menu items (Profile, Settings, Logout)
- [ ] Style dropdown menu appropriately
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 30 minutes

### Task 4.7: Implement Dropdown Toggle Functionality
- [ ] Add state for dropdown open/closed
- [ ] Add click handler for toggle button
- [ ] Toggle dropdown visibility
- [ ] Add click outside to close functionality
- [ ] Test dropdown toggle works
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 25 minutes

### Task 4.8: Add Logout Functionality
- [ ] Import logout function from auth actions
- [ ] Add logout handler
- [ ] Add logout menu item click handler
- [ ] Test logout works correctly
- [ ] Handle logout errors gracefully
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 20 minutes

### Task 4.9: Add Mobile Menu Toggle Button
- [ ] Add hamburger menu icon (Menu from lucide-react)
- [ ] Add toggle button in topbar
- [ ] Connect to sidebar toggle state
- [ ] Style button appropriately
- [ ] Make button visible only on mobile/tablet
- **Files**: `components/layout/topbar.tsx`
- **Estimated Time**: 20 minutes

### Task 4.10: Integrate Topbar into Layout
- [ ] Import Topbar component in layout
- [ ] Add Topbar to layout structure
- [ ] Pass necessary props (onMenuToggle)
- [ ] Verify Topbar renders correctly
- [ ] Test user profile displays correctly
- **Files**: `app/(protected)/layout.tsx`
- **Estimated Time**: 20 minutes

**Phase 4 Total**: 2.5 hours

---

## Phase 5: Responsive Design & Mobile Support

### Task 5.1: Add Sidebar State Management
- [ ] Add `useState` hook for sidebar open/closed state
- [ ] Create toggle function
- [ ] Pass state and toggle function to Sidebar and Topbar
- [ ] Initialize state appropriately (closed on mobile, open on desktop)
- **Files**: `app/(protected)/layout.tsx`
- **Estimated Time**: 20 minutes

### Task 5.2: Implement Desktop Layout (> 1024px)
- [ ] Add Tailwind classes for desktop layout
- [ ] Sidebar always visible (fixed width: 256px)
- [ ] Topbar full width
- [ ] Main content area adjusts automatically
- [ ] Add smooth transitions
- **Files**: `app/(protected)/layout.tsx`, `components/layout/sidebar.tsx`
- **Estimated Time**: 30 minutes

### Task 5.3: Implement Tablet Layout (768px - 1024px)
- [ ] Add Tailwind responsive classes for tablet
- [ ] Sidebar toggleable (overlay mode)
- [ ] Hamburger menu button visible
- [ ] Sidebar slides in from left when opened
- [ ] Backdrop overlay when sidebar is open
- **Files**: `app/(protected)/layout.tsx`, `components/layout/sidebar.tsx`
- **Estimated Time**: 40 minutes

### Task 5.4: Implement Mobile Layout (< 768px)
- [ ] Add Tailwind responsive classes for mobile
- [ ] Sidebar hidden by default
- [ ] Hamburger menu button in topbar
- [ ] Sidebar slides in from left when opened
- [ ] Backdrop overlay when sidebar is open
- **Files**: `app/(protected)/layout.tsx`, `components/layout/sidebar.tsx`
- **Estimated Time**: 40 minutes

### Task 5.5: Add Sidebar Slide Animations
- [ ] Add transform classes for slide-in/out
- [ ] Add transition classes (200-300ms)
- [ ] Implement slide from left animation
- [ ] Test animations are smooth
- [ ] Ensure animations work on all screen sizes
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 30 minutes

### Task 5.6: Add Backdrop Overlay
- [ ] Create backdrop component/div
- [ ] Add backdrop when sidebar is open (mobile/tablet)
- [ ] Add fade-in/out animation
- [ ] Add click handler to close sidebar
- [ ] Style backdrop appropriately (semi-transparent)
- **Files**: `app/(protected)/layout.tsx` or `components/layout/sidebar.tsx`
- **Estimated Time**: 25 minutes

### Task 5.7: Implement Click Outside to Close
- [ ] Add click handler for backdrop
- [ ] Close sidebar when clicking outside
- [ ] Close sidebar when clicking on backdrop
- [ ] Test click outside functionality
- [ ] Ensure it works on mobile and tablet
- **Files**: `app/(protected)/layout.tsx` or `components/layout/sidebar.tsx`
- **Estimated Time**: 20 minutes

### Task 5.8: Close Sidebar on Link Click (Mobile)
- [ ] Add click handler to navigation links
- [ ] Close sidebar when link is clicked (mobile only)
- [ ] Keep sidebar open on desktop
- [ ] Test sidebar closes correctly
- **Files**: `components/layout/sidebar.tsx`
- **Estimated Time**: 15 minutes

### Task 5.9: Add Touch-Friendly Sizing
- [ ] Ensure buttons and links are touch-friendly (min 44x44px)
- [ ] Add appropriate padding for touch targets
- [ ] Test on mobile device or emulator
- [ ] Verify touch interactions work smoothly
- **Files**: `components/layout/sidebar.tsx`, `components/layout/topbar.tsx`
- **Estimated Time**: 20 minutes

### Task 5.10: Test Responsive Behavior
- [ ] Test on different screen sizes (desktop, tablet, mobile)
- [ ] Test sidebar toggle on mobile/tablet
- [ ] Test backdrop overlay
- [ ] Verify layout doesn't break
- [ ] Fix any responsive issues
- **Files**: Test in browser with DevTools
- **Estimated Time**: 30 minutes

**Phase 5 Total**: 3 hours

---

## Phase 6: Styling & Polish

### Task 6.1: Define Color Scheme
- [ ] Review existing theme colors or create new palette
- [ ] Define primary, secondary, background colors
- [ ] Define text colors (primary, secondary, muted)
- [ ] Define border colors
- [ ] Apply consistent colors throughout layout
- **Files**: `tailwind.config.js` or CSS variables
- **Estimated Time**: 30 minutes

### Task 6.2: Apply Typography
- [ ] Define font sizes for headings, body text
- [ ] Define font weights
- [ ] Apply consistent typography to sidebar links
- [ ] Apply consistent typography to topbar
- [ ] Ensure readability
- **Files**: `components/layout/sidebar.tsx`, `components/layout/topbar.tsx`
- **Estimated Time**: 25 minutes

### Task 6.3: Apply Consistent Spacing
- [ ] Follow 8px grid system
- [ ] Apply consistent padding and margins
- [ ] Ensure proper spacing between elements
- [ ] Review and adjust spacing throughout
- **Files**: All layout components
- **Estimated Time**: 30 minutes

### Task 6.4: Style Icons
- [ ] Ensure icons are properly sized
- [ ] Add consistent icon colors
- [ ] Add hover effects to icons
- [ ] Ensure visual consistency
- [ ] Test icon rendering
- **Files**: `components/layout/sidebar.tsx`, `components/layout/topbar.tsx`
- **Estimated Time**: 20 minutes

### Task 6.5: Add Subtle Shadows and Borders
- [ ] Add subtle shadows to sidebar and topbar
- [ ] Add borders where appropriate
- [ ] Ensure shadows are consistent
- [ ] Test shadows look good
- **Files**: All layout components
- **Estimated Time**: 20 minutes

### Task 6.6: Add ARIA Labels
- [ ] Add ARIA labels to navigation links
- [ ] Add ARIA labels to buttons
- [ ] Add ARIA labels to dropdown menu
- [ ] Add ARIA expanded states
- [ ] Test with screen reader
- **Files**: All layout components
- **Estimated Time**: 30 minutes

### Task 6.7: Implement Keyboard Navigation
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add keyboard shortcuts (optional)
- [ ] Test Tab navigation
- [ ] Test Enter/Space activation
- [ ] Test Escape key closes dropdown/sidebar
- **Files**: All layout components
- **Estimated Time**: 30 minutes

### Task 6.8: Ensure Color Contrast
- [ ] Check text contrast ratios
- [ ] Ensure WCAG AA compliance (4.5:1 for normal text)
- [ ] Fix any contrast issues
- [ ] Test with color contrast checker
- **Files**: All layout components
- **Estimated Time**: 25 minutes

### Task 6.9: Cross-Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Fix any browser-specific issues
- **Files**: Test in browsers
- **Estimated Time**: 30 minutes

### Task 6.10: Final Polish
- [ ] Review all styling
- [ ] Fine-tune spacing and alignment
- [ ] Ensure consistency throughout
- [ ] Fix any visual issues
- [ ] Final review
- **Files**: All layout components
- **Estimated Time**: 30 minutes

**Phase 6 Total**: 3 hours

---

## Phase 7: Integration & Testing

### Task 7.1: Verify Auth Integration
- [ ] Verify user session data loads correctly
- [ ] Test user profile displays correctly
- [ ] Test logout functionality
- [ ] Handle auth errors gracefully
- [ ] Test protected routes work correctly
- **Files**: `components/layout/topbar.tsx`, `app/(protected)/layout.tsx`
- **Estimated Time**: 30 minutes

### Task 7.2: Create Placeholder Pages
- [ ] Create `/assets` page placeholder
- [ ] Create `/analysis` page placeholder
- [ ] Create `/settings` page placeholder
- [ ] Ensure all routes are accessible
- [ ] Add basic content to placeholders
- **Files**: `app/(protected)/assets/page.tsx`, `app/(protected)/analysis/page.tsx`, `app/(protected)/settings/page.tsx`
- **Estimated Time**: 20 minutes

### Task 7.3: Test Navigation
- [ ] Test all navigation links work
- [ ] Verify active route highlighting
- [ ] Test mobile navigation
- [ ] Test user menu dropdown
- [ ] Verify no broken links
- **Files**: Test in browser
- **Estimated Time**: 20 minutes

### Task 7.4: Test Responsive Behavior
- [ ] Test on different screen sizes
- [ ] Test sidebar toggle on mobile
- [ ] Test backdrop overlay
- [ ] Verify layout doesn't break
- [ ] Test on actual devices if possible
- **Files**: Test in browser with DevTools
- **Estimated Time**: 30 minutes

### Task 7.5: Performance Testing
- [ ] Check for any performance issues
- [ ] Optimize animations if needed
- [ ] Check bundle size
- [ ] Verify no unnecessary re-renders
- [ ] Test page load times
- **Files**: Test with DevTools
- **Estimated Time**: 20 minutes

### Task 7.6: Fix Any Issues
- [ ] Address any bugs found
- [ ] Fix console errors/warnings
- [ ] Improve performance if needed
- [ ] Optimize code
- [ ] Final bug fixes
- **Files**: All files
- **Estimated Time**: 30 minutes

### Task 7.7: Final Testing Checklist
- [ ] All navigation links work
- [ ] User profile displays correctly
- [ ] Layout works on all screen sizes
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Accessibility requirements met
- [ ] Cross-browser compatibility verified
- **Files**: Final testing
- **Estimated Time**: 30 minutes

**Phase 7 Total**: 2 hours

---

## Summary

**Total Tasks**: 67 tasks  
**Total Estimated Time**: 12-15 hours (1.5-2 days)

### Task Distribution by Phase:
- Phase 1: 4 tasks (30 min)
- Phase 2: 4 tasks (1 hour)
- Phase 3: 10 tasks (2.5-3 hours)
- Phase 4: 10 tasks (2.5 hours)
- Phase 5: 10 tasks (3 hours)
- Phase 6: 10 tasks (3 hours)
- Phase 7: 7 tasks (2 hours)

### Priority Order:
1. **High Priority**: Phases 1-3 (Setup, Layout, Sidebar)
2. **Medium Priority**: Phases 4-5 (Topbar, Responsive)
3. **Low Priority**: Phases 6-7 (Polish, Testing)

### Dependencies:
- Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
- Each phase builds on the previous one

### Notes:
- Test incrementally after each phase
- Fix issues as they arise
- Don't skip testing steps
- Keep code clean and well-organized
- Document any deviations from plan

