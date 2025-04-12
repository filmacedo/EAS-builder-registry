# Builder Registry UI Guidelines - Vercel Inspired

## Design Philosophy

Create a minimalist, high-contrast dashboard UI inspired by Vercel that feels bold, modern, and performance-focused. The interface should be optimized for developers while remaining polished enough to impress designers.

## Layout Principles

- **Mobile-First Approach**: Design for smaller screens first, then enhance for larger displays
- **Generous Whitespace**: Maintain ample breathing room between elements
- **Modular Structure**: Clearly defined content blocks with consistent spacing
- **Responsive Components**: All elements should adapt gracefully to different screen sizes
- **Content Hierarchy**: Establish clear visual hierarchy through sizing and spacing

## Typography

- **Font Family**: Inter or Geist Sans for a clean, modern feel
- **Weight Usage**:
  - Headings: Semi-bold (600) for titles, medium (500) for subtitles
  - Body: Regular (400) for normal text, light (300) for secondary text
- **Scale**: Establish a clear typographic scale (e.g., 14px base with 1.25 ratio)
- **Legibility Focus**: Optimize line-height and letter-spacing for maximum readability
- Max width for readable blocks: ~700px

## Color System

- **Base Palette**:
  - Background: White (#FFFFFF) or soft gray (#F9FAFB)
  - Text: Dark slate (#171923) for primary, lighter (#4A5568) for secondary
  - Borders: Light gray (#E2E8F0)
- **Accent Color**: One subtle accent color for key interactions (optional)
- **Feedback Colors**: Minimal set of status colors (success, error, warning)

## Components (using shadcn/ui)

### Cards & Containers

- Clean white backgrounds with subtle shadows
- Rounded corners (rounded-xl, 12px)
- Minimal borders or borderless design
- Optional subtle hover states with shadow enhancement

### Tables & Data Display

- Clean, borderless tables with subtle column dividers
- Responsive design that adapts to smaller screens
- Compact but readable row spacing
- Subtle hover states for rows

### Navigation

- Simple, clear navigation elements
- Active states with minimal indicators
- Consistent spacing and alignment

### Buttons & Controls

- Clearly defined primary and secondary buttons
- Minimal styling for tertiary actions
- Consistent hover and active states
- Appropriate loading states

## Visual Effects

- **Shadows**: Soft, subtle shadows for elevation (low spread, low opacity)
- **Rounded Corners**: Consistent border radius across components (12px recommended)
- **Glassmorphism**: Occasional subtle blur effects for overlays and modals
- **Gradients**: Minimal use of subtle gradients where appropriate

## Interactions

- **Transitions**: Smooth, quick transitions (150-200ms) for state changes
- **Hover Effects**: Subtle feedback on interactive elements
- **Loading States**: Clean, minimalist loading indicators
- **Feedback**: Toast notifications for important actions
- **Error Handling**: Clear, helpful error messaging

## Implementation Notes

- Use shadcn/ui components as building blocks
- Customize component styling for a unique, cohesive look
- Ensure all interactions feel snappy and responsive
- Test thoroughly across device sizes
- Maintain consistent spacing using a design token system

## Visual Inspiration

- Linear (light mode)
- Vercel dashboard (light theme)
- Notion
- Raycast marketing site
