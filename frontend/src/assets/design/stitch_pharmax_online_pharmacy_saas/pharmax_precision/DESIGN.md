---
name: PharmaX Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6e7b6c'
  outline-variant: '#bdcaba'
  surface-tint: '#006e2d'
  primary: '#006b2c'
  on-primary: '#ffffff'
  primary-container: '#00873a'
  on-primary-container: '#f7fff2'
  inverse-primary: '#62df7d'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#525d6c'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7586'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ffc97'
  primary-fixed-dim: '#62df7d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#d9e3f6'
  tertiary-fixed-dim: '#bdc7d9'
  on-tertiary-fixed: '#121c2a'
  on-tertiary-fixed-variant: '#3d4756'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-desktop: 32px
  container-padding-mobile: 16px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 48px
---

## Brand & Style
The design system focuses on a **Corporate / Modern** aesthetic tailored for the high-stakes environment of healthcare SaaS. It balances clinical precision with a user-friendly, approachable interface to reduce cognitive load for medical professionals and patients alike.

The style is characterized by a "Clean Clinical" approach: heavy use of whitespace to separate complex data, subtle depth to indicate interactivity, and a focus on high-legibility typography. The emotional response should be one of reliability, hygiene, and technological sophistication. Design elements utilize soft-rounded containers to feel modern and safe, avoiding the harshness of sharp corners or the "playfulness" of exaggerated roundedness.

## Colors
The palette is rooted in medical trust. **Primary Green** symbolizes health and growth, used primarily for success states and primary actions. **Primary Blue** conveys stability and intelligence, used for secondary actions and information-heavy navigation.

For **Dark Mode**, the system shifts to a deep navy/charcoal base (#0F172A). Surface colors transition to low-opacity overlays to maintain the "soft shadow" effect through elevation-based tinting rather than traditional shadows. Accent colors (Light Green/Blue) reduce in saturation in dark mode to ensure AA accessibility against dark backgrounds.

## Typography
Inter is utilized across all levels to maintain a systematic, utilitarian feel. 
- **Headlines:** Use tighter letter-spacing and semi-bold weights to create a strong visual anchor for page sections.
- **Body:** Uses standard weights with a generous line-height (1.5x - 1.6x) to ensure medical data remains readable during long sessions.
- **Labels:** Small labels use uppercase and slightly increased letter-spacing to differentiate metadata from body text.

## Layout & Spacing
This design system employs a **Fluid Grid** model based on a 12-column system for desktop and a 4-column system for mobile. 

- **Desktop (1440px+):** 32px outer margins, 24px gutters. 
- **Tablet (768px - 1439px):** 24px outer margins, 16px gutters.
- **Mobile (< 767px):** 16px outer margins, 12px gutters.

Spacing follows a 4px base unit. Vertical rhythm should prioritize `stack-md` (16px) for related elements and `stack-xl` (48px) to separate major content sections.

## Elevation & Depth
Elevation is conveyed through **Ambient Shadows** and **Tonal Layers**. This system avoids heavy black shadows in favor of tinted, diffused shadows to maintain a "medical" cleanliness.

- **Level 0 (Base):** White (#FFFFFF) or light neutral background.
- **Level 1 (Cards/Tables):** White background with a 1px border (#E5E7EB) and a soft shadow: `0px 4px 6px -1px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Dropdowns/Modals):** White background with a more pronounced shadow to indicate floating: `0px 10px 15px -3px rgba(0, 0, 0, 0.1)`.

In Dark Mode, elevation is represented by progressively lighter surface hex codes (e.g., Level 0 is #0F172A, Level 1 is #1E293B) instead of shadows.

## Shapes
A **Rounded** shape language is used to soften the professional interface. 
- **Standard Radius:** 8px (0.5rem) for buttons, input fields, and small components.
- **Large Radius (rounded-lg):** 12px-16px (0.75rem - 1rem) for info cards, modals, and data containers.
- **Full Radius:** Used exclusively for badges and toggle switches.

## Components

### Buttons
- **Primary:** Background #16A34A, White text. High-contrast, for main actions.
- **Secondary:** Background #DBEAFE, Text #2563EB. Used for alternative paths.
- **Outline:** Transparent background, 1px Border #6B7280, Text #1F2937. Used for tertiary actions.

### Inputs & Fields
- **Standard:** 12px padding, 8px radius, 1px border (#D1D5DB). Focus state uses 2px Primary Blue ring.
- **Search:** Includes a 16px icon (magnifying glass) at the start with a placeholder in Secondary Text color.

### Data Tables
- **Header:** Light Blue Accent (#DBEAFE) or Light Grey, Semi-bold text.
- **Rows:** 16px vertical padding. Use "Level 1" elevation. Hover state should apply a subtle grey background (#F9FAFB).

### Info Cards & Analytics
- **Cards:** 16px radius, white background, soft shadow.
- **Charts:** Use Primary Green and Primary Blue for primary data series. Use thin lines (2px) and no-fill areas for line charts to keep the UI "light."

### Feedback & Overlays
- **Alerts:** Use background tints (Accent Green for success, Light Red for error) with a thick 4px left-border of the solid status color.
- **Modals:** Centered, 16px radius, Level 2 elevation. Backdrop is 40% opacity #1F2937.
- **Badges:** Small, 12px font-size, pill-shaped. Low-saturation background with high-saturation text.