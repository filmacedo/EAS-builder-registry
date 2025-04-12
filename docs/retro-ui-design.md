# Builder Registry UI Guidelines - Retro Tech

## Design Philosophy

Create a distinctive interface that celebrates the heritage of computing while maintaining modern usability. This "Digital Archaeology" aesthetic blends retro terminal visuals, pixel art, and vintage computing references with clean, contemporary UX patterns.

Inspired by Linear's "Change" campaign, our approach juxtaposes the nostalgic texture of early computing with the precision and performance expected in modern developer tools.

## Core Aesthetic

- **Vintage × Modern**: Blend pixel-perfect retro elements with thoughtful, contemporary UX
- **Technical Character**: Emphasize the builder ethos through visual references to computing history
- **High Contrast**: Maintain exceptional readability with stark contrasts and clear hierarchy

## Typography

- **Primary Font**: Monospace/pixel font for headings and key UI elements (JetBrains Mono or similar)
- **Secondary Font**: Serif font for body text (IBM Plex Serif or similar) to create meaningful contrast
- **Special Elements**: Consider pixel-serif hybrid fonts for highlighted content
- **Scale & Weight**:
  - Use larger, more pronounced type scaling to emphasize the terminal aesthetic
  - Maintain lighter weights for body text
  - Create clear typographic contrast between elements

## Color System

- **Base Palette**: High-contrast monochrome
  - Background: Off-white (#F8F8F8) or deep black (#101010)
  - Text: Deep black (#000000) or crisp white (#FFFFFF)
- **Accent Options**:
  - Terminal green (#00FF00) for primary actions and highlights
  - Amber (#FFBF00) for secondary elements and warnings
  - Use sparingly for maximum impact
- **Visual Hierarchy**:
  - Use dithering patterns rather than opacity for creating depth
  - Apply halftone effects for intermediate states

## Digital Texture

- **Pattern Language**:
  - Subtle dot matrix patterns for section backgrounds
  - Halftone gradients instead of smooth color transitions
  - Scanline effects for hover states or focused elements
- **Iconography**:
  - Pixel-style icons that maintain clarity at all sizes
  - ASCII-inspired decorative elements for empty states
  - Grid-aligned visual elements that reference older interfaces
- **Borders & Dividers**:
  - Pixel-perfect borders (1px or 2px) instead of rounded corners
  - Dot patterns for secondary dividers
  - ASCII-style line breaks (──────) for section dividers

## Components

### Cards & Containers

- Pixel-perfect borders rather than shadows
- Terminal-inspired headers with monospace type
- Optional scanline texture on hover

### Navigation

- Tab interfaces that reference old dialog boxes
- Simple, decisive state changes rather than smooth transitions
- Clear, high-contrast active states

### Tables

- Grid-based layouts with visible borders
- Monospace fonts for technical data
- Terminal-style alternating row styling (subtle)

### Buttons & Forms

- Command-line inspired input fields
- Pixel-bordered buttons with decisive hover states
- Form elements that reference early GUI interfaces

## Interaction Patterns

- **Terminal-Inspired Feedback**:
  - Typing animations for important content reveals
  - Cursor blink effects for loading states
  - Scan line or reveal animations for transitions
- **User Feedback**:
  - ASCII-style loading indicators
  - Decisive state changes rather than subtle animations
  - Command-line inspired toast notifications

## Empty States & Illustrations

- Use ASCII art or pixel illustrations for empty states
- Consider including "terminal poetry" for loading screens or empty results
- Reference vintage computing aesthetics in error states

## Implementation Notes

- Build with shadcn/ui components, customized with CSS to achieve the retro aesthetic
- Focus on accessibility despite the stylized visual approach
- Maintain pixel-perfect implementation
- Balance vintage aesthetics with modern usability requirements

## Reference Inspirations

- Linear's "Change" campaign
- Early terminal interfaces
- Vintage computing advertisements
- '80s and '90s digital aesthetics
- Text-based adventure games
