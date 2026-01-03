# Specification: Layout and Sidebar

**Feature ID:** 003-UI-Layout  
**Specification ID:** spec-001  
**Created:** 2025-11-30  
**Status:** Draft  
**Priority:** High

## Overview

Create a main layout wrapper for the application to be used on protected routes. This layout will provide consistent navigation and user interface across all authenticated pages.

## Requirements

### 1. Main Layout Wrapper

- **Purpose**: Provide a consistent layout structure for all protected routes
- **Location**: `app/(protected)/layout.tsx` (using Next.js route groups)
- **Features**:
  - Wraps all protected route pages
  - Includes Sidebar and Topbar components
  - Handles responsive behavior
  - Manages layout state (sidebar open/closed)

### 2. Sidebar Component

- **Location**: `components/layout/sidebar.tsx`
- **Position**: Left side of the screen
- **Navigation Links**:
  - **Dashboard** (`/dashboard`) - Main portfolio overview
  - **My Assets** (`/assets`) - Asset management page
  - **AI Analysis** (`/analysis`) - AI-powered portfolio analysis
  - **Settings** (`/settings`) - User settings and preferences
- **Features**:
  - Active link highlighting based on current route
  - Icons for each navigation item
  - Collapsible on mobile devices
  - Smooth transitions for open/close animations
  - Logo/branding at the top

### 3. Topbar Component

- **Location**: `components/layout/topbar.tsx`
- **Position**: Top of the screen (above main content)
- **Features**:
  - Display logged-in user's profile picture
  - Display user's name (from session)
  - User menu dropdown (logout, profile, etc.)
  - Mobile menu toggle button (for sidebar)
  - Search bar (optional, for future use)

### 4. Responsive Design

- **Desktop** (> 1024px):
  - Sidebar always visible (fixed width: ~256px)
  - Topbar full width
  - Main content area adjusts automatically

- **Tablet** (768px - 1024px):
  - Sidebar can be toggled (overlay mode)
  - Topbar remains full width
  - Hamburger menu button visible

- **Mobile** (< 768px):
  - Sidebar hidden by default (overlay mode)
  - Hamburger menu button in topbar
  - Sidebar slides in from left when opened
  - Backdrop overlay when sidebar is open
  - Sidebar closes when clicking outside or on a link

### 5. Styling

- **Framework**: Tailwind CSS
- **Design System**:
  - Use consistent color scheme (from theme)
  - Modern, clean design
  - Proper spacing and typography
  - Smooth animations and transitions
  - Accessible (WCAG 2.1 AA compliant)

### 6. Integration

- **Protected Routes**: Apply layout to `/dashboard` and other protected routes
- **Route Group**: Use Next.js route groups `(protected)` to organize routes
- **Session Management**: Integrate with existing auth system to get user data
- **Navigation**: Use Next.js `usePathname` and `Link` for client-side navigation

## Technical Details

### File Structure

```
app/
  (protected)/
    layout.tsx          # Main layout wrapper
    dashboard/
      page.tsx          # Dashboard page (uses layout)
    assets/
      page.tsx          # Assets page (uses layout)
    analysis/
      page.tsx          # Analysis page (uses layout)
    settings/
      page.tsx          # Settings page (uses layout)

components/
  layout/
    sidebar.tsx         # Sidebar component
    topbar.tsx          # Topbar component
    layout-wrapper.tsx  # Main layout wrapper component (optional)
```

### Dependencies

- **Next.js**: App Router, `usePathname`, `Link`
- **React**: Hooks (`useState`, `useEffect`)
- **Tailwind CSS**: For styling
- **Lucide React** (or similar): For icons
- **Existing Auth**: `getCurrentUser` from `@/lib/auth/actions`

### State Management

- Sidebar open/closed state (local component state)
- User session data (from server components)
- Active route highlighting (using `usePathname`)

## Acceptance Criteria

1. ✅ Layout wrapper is created and applied to protected routes
2. ✅ Sidebar displays all navigation links correctly
3. ✅ Topbar shows user profile picture and name
4. ✅ Sidebar is responsive (collapsible on mobile)
5. ✅ Active route is highlighted in sidebar
6. ✅ Mobile menu toggle works correctly
7. ✅ Layout uses Tailwind CSS for styling
8. ✅ `/dashboard` page uses the new layout
9. ✅ User session data is correctly displayed
10. ✅ Layout is accessible (keyboard navigation, screen readers)

## Design Considerations

- **Color Scheme**: Use existing theme colors or create a consistent palette
- **Icons**: Use Lucide React icons for consistency
- **Spacing**: Follow 8px grid system
- **Typography**: Use consistent font sizes and weights
- **Animations**: Keep transitions smooth but not distracting (200-300ms)

## Future Enhancements

- Notification badge on sidebar items
- Breadcrumb navigation in topbar
- Quick actions menu
- Dark mode toggle
- Customizable sidebar (user preferences)

## Related Features

- **Feature 001**: User Authentication (for session data)
- **Feature 002**: Portfolio Tracker API (for dashboard data)
- Future: Dashboard page content
- Future: Assets management page
- Future: AI Analysis page
- Future: Settings page

