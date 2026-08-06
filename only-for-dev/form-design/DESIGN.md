---
name: FARS Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#42474f'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727780'
  outline-variant: '#c2c7d1'
  surface-tint: '#2d6197'
  primary: '#00355f'
  on-primary: '#ffffff'
  primary-container: '#0f4c81'
  on-primary-container: '#8ebdf9'
  inverse-primary: '#a0c9ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#003b35'
  on-tertiary: '#ffffff'
  tertiary-container: '#00544d'
  on-tertiary-container: '#5eccbe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#07497d'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The design system is engineered for a high-stakes educational environment, prioritizing trust, academic excellence, and administrative efficiency. The brand personality is **authoritative yet accessible**, bridging the gap between rigorous institutional standards and student-friendly usability.

The aesthetic follows a **Corporate / Modern** style with a focus on high legibility and systematic organization. It utilizes a refined color palette to manage complex user flows—from initial course registration to secure payment processing. The visual language conveys reliability through structured layouts, while generous whitespace prevents cognitive overload for students navigating dense registration forms.

## Colors
The palette is anchored by **Deep Blue** (Primary), symbolizing stability and institutional trust. **Warm Gold** (Secondary) is reserved exclusively for high-priority Call-to-Actions and urgent notifications, ensuring they stand out without appearing aggressive. **Teal** (Tertiary) provides a calming alternative for secondary actions or decorative elements.

Functional status colors are strictly enforced to guide users through the admission funnel:
- **Pending:** Neutral gray to indicate an inactive or initial state.
- **Under Review:** Amber to signal active processing.
- **Verified:** Bright blue to confirm financial reconciliation.
- **Admitted:** Success green for the final positive outcome.
- **Rejected/Cancelled:** High-visibility red for errors or negative status updates.

## Typography
The design system utilizes **Inter** across all levels to maintain a systematic, utilitarian aesthetic. The typeface is chosen for its exceptional legibility at small sizes—critical for complex data tables in the admin dashboard—and its professional "ink traps" that maintain clarity on mobile screens.

- **Headlines:** Use Bold (700) or SemiBold (600) weights with slight negative letter spacing to create a compact, authoritative feel.
- **Body Text:** Regular weight (400) is used for all descriptive text to ensure maximum readability during long reading sessions.
- **Labels:** Medium (500) and SemiBold (600) weights distinguish metadata and interactive triggers from static content.

## Layout & Spacing
This design system employs a **hybrid layout strategy** to accommodate two distinct user groups:

1.  **Student Experience (Mobile-First):** A single-column fluid layout. Emphasis is placed on "stack spacing" (vertical rhythm) to ensure touch targets are accessible and forms are easy to navigate on narrow viewports.
2.  **Admin Experience (Desktop-Optimized):** A fixed sidebar (280px) with a fluid content area. A 12-column grid is used for the main canvas to organize data-dense cards and tables side-by-side.

Spacing follows an 8px base grid. Use `stack-lg` for separating major sections and `stack-sm` for grouping related labels and inputs.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Ambient Shadows**. Surfaces are categorized into three levels of elevation:

- **Level 0 (Background):** Soft gray (#F8FAFC) used for the canvas to reduce eye strain.
- **Level 1 (Cards/Surface):** Pure white surfaces with a subtle, 1px border (#E2E8F0) and a very soft, diffused shadow (15% opacity, 10px blur).
- **Level 2 (Modals/Popovers):** Elevated surfaces with a more pronounced shadow (20% opacity, 25px blur) to draw focus during critical payment or confirmation tasks.

Avoid heavy black shadows. Instead, use a shadow color tinted with the Primary Blue to maintain the "calm" aesthetic.

## Shapes
The shape language is consistently **Rounded**, promoting an approachable and modern feel. 

- **Standard Elements:** Inputs, buttons, and small components use a 0.5rem (8px) radius.
- **Containers:** Dashboard cards and registration sections use a 1rem (16px) radius (`rounded-lg`).
- **Accent Elements:** Tags and status indicators may use a `rounded-xl` or pill-shape to distinguish them from actionable buttons.

## Components
- **Buttons:** Primary buttons use the Deep Blue background with white text. CTA buttons (e.g., "Pay Now") use the Gold background. Both should have a height of 48px on mobile for optimal touch ergonomics.
- **Input Fields:** Use a solid 1px border (#CBD5E1) that transitions to Primary Blue on focus. Labels should always be visible above the field, never floating as placeholders.
- **Status Chips:** Small, semi-transparent background badges using the status colors defined in the Color section. Text within chips should be SemiBold and high-contrast.
- **Cards:** The primary unit of the UI. Cards must include a standard 24px padding. Admin cards should utilize "Header-Body-Footer" structures to separate metadata from primary actions.
- **Data Tables:** For the admin view, use zebra-striping (Level 0 background) and "sticky" headers. Ensure cells have a minimum height of 56px to maintain a professional, airy feel even with dense information.
- **Progress Steppers:** Essential for the multi-step registration process. Use a horizontal stepper for desktop and a simplified "Step X of Y" indicator for mobile.