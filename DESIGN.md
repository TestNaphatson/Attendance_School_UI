---
name: School Attendance
description: A clear school-operations bulletin board for daily attendance work.
colors:
  cool-light: "#f2f5f8"
  paper-white: "#ffffff"
  ink-navy: "#16243a"
  navigation-navy: "#14233b"
  action-cobalt: "#2156d7"
  action-cobalt-soft: "#e8eefc"
  action-cobalt-ink: "#183d94"
  quiet-surface: "#edf1f5"
  quiet-ink: "#5b6879"
  rule: "#d9e0e8"
  field-rule: "#cbd5e1"
  school-yellow: "#f5c84c"
  danger: "#c93445"
typography:
  headline:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  field: "8px"
  control: "12px"
  landmark: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.action-cobalt}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.field}"
    padding: "10px 16px"
  button-outline:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.field}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.control}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
---

# Design System: School Attendance

## Overview

**Creative North Star: "The School Operations Bulletin Board"**

This is an operational school environment, not a generic gradient SaaS dashboard. Cool light surfaces behave like orderly posted sheets; deep navy navigation provides a permanent institutional frame; cobalt identifies the next useful action; and one school-yellow landmark makes the product recognizable without turning every screen into branding.

The system is deliberately dense but calm. Administrators and teachers must scan many records and pending states, while students must find a short, frequent action and understand its result immediately. The first viewport therefore keeps navigation, a plain-language task title, and readable working content in view. Flat color, explicit labels, icons, and compact 12–16px geometry do the work.

**Key Characteristics:**

- Cool, light working canvas with white paper-like containers.
- Deep navy persistent navigation and cobalt action hierarchy.
- School yellow reserved for the product landmark and rare attention cues.
- Compact Thai-first typography and dense, readable operational layouts.
- Status meaning expressed with words and icons as well as color.
- Mostly flat surfaces; restrained shadows clarify hierarchy, not decoration.

## Colors

The palette is a cool institutional neutral field anchored by navy, with cobalt for action and school yellow as a scarce landmark.

### Primary

- **Action Cobalt:** The default primary action, focus identity, links, and active icon color.
- **Navigation Navy:** The persistent desktop and mobile navigation plane.

### Secondary

- **Cobalt Wash:** Active-navigation icon wells and quiet selected surfaces.
- **School Yellow:** The graduation-cap landmark and exceptional counts or attention markers; it is not a general-purpose button color.

### Neutral

- **Cool Light:** The application canvas behind content.
- **Paper White:** Cards, fields, active navigation rows, and high-clarity working surfaces.
- **Ink Navy:** Primary text and headings.
- **Quiet Surface:** Muted rows, identity blocks, loading regions, and low-emphasis groupings.
- **Quiet Ink:** Descriptions, metadata, helper copy, and secondary labels.
- **Rule / Field Rule:** Dividers, card boundaries, table structure, and form outlines.

### Named Rules

**The No-Gradient Rule.** Keep core surfaces and actions flat; hierarchy comes from contrast, spacing, borders, and restrained depth.

**The Yellow Landmark Rule.** School yellow is a recognizable landmark, not a second primary action color.

**The Status Is Language Rule.** Never communicate attendance or approval state through hue alone; pair color with a label and, where space permits, an icon.

## Typography

**Display Font:** Prompt (with Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif fallbacks)  
**Body Font:** Prompt (with the same Thai-capable fallbacks)

**Character:** Prompt keeps Thai and Latin text equally direct, friendly, and operational. Weight changes establish hierarchy; oversized display typography and ornamental pairings do not belong in the working application.

### Hierarchy

- **Headline:** Bold, compact page and task titles; typically around the 24px tier with balanced wrapping on small screens.
- **Title:** Semibold card, section, and table-region headings.
- **Body:** Regular 14px operational copy, values, and descriptions, with 16px used where a student-facing primary task needs more emphasis.
- **Label:** Semibold 12px metadata and control labels; the navigation group eyebrow is an existing uppercase, tracked exception rather than a pattern to spread.

### Named Rules

**The Thai-First Measure Rule.** Allow Thai labels enough width and line height to remain legible; do not force English-dashboard abbreviations to preserve a rigid row.

## Layout

Large screens use a persistent 288px left navigation rail and a content column offset to match it. The shell header keeps the current task and user context available while the main region uses compact, readable cards and tables. Student check-in narrows to a focused central working column, while administrative pages may use the wider canvas for search, filters, tables, and reports.

Spacing follows a practical 4/8/12/16/24px rhythm. Controls cluster tightly; sections receive the larger steps. At widths below the large breakpoint, navigation becomes an off-canvas drawer with a clear menu trigger and scrim. Mobile is a primary layout: actions may stack or form a two-column task pair only when labels remain readable, tables require deliberate overflow or alternate presentation, and tap targets stay comfortably usable.

**The First-Viewport Rule.** Preserve access to navigation, the current task title, and the task's meaningful content or action without ceremonial hero space.

## Elevation & Depth

The system is flat by default. White cards separate from the cool canvas through tonal contrast and quiet borders; shadows are structural accents for the fixed navigation, active navigation row, focused task card, and temporary overlays. Avoid glass effects and decorative floating layers.

### Shadow Vocabulary

- **Navigation edge:** A broad, low-opacity navy shadow separates the fixed rail from working content.
- **Active row:** A compact dark shadow lifts the white active destination against the navy rail.
- **Task emphasis:** A soft, wide shadow may identify the principal check-in card without making every card float.

### Named Rules

**The Flat-by-Default Rule.** Ordinary cards and fields rely on surface contrast and rules; reserve visible elevation for navigation, priority, and transient state.

## Shapes

The recurring language is gently squared: 8px fields and compact controls, 12px cards and navigation rows, and 16px landmark/icon containers. Circles are reserved for avatars, status icons, loaders, and small count indicators. Borders are thin and cool. Larger rounded-3xl containers and heavily softened backdrop modals are legacy compatibility patterns, not templates for new work.

## Components

### Buttons

- **Shape:** Compact gently curved control, normally 8px; student primary actions may grow to 48–56px high.
- **Primary:** Cobalt with white text and icon, clear verb-first label, and concise hover darkening.
- **Outline:** White or transparent surface with a cool border and ink text for secondary actions.
- **Ghost / icon:** Used in navigation and compact utility contexts, with a visible hover surface and the global focus-visible outline.
- **States:** Disabled actions remain readable but visibly unavailable; loading states retain the action label and add a spinner.

### Chips

- **Style:** Compact labeled status badges use a pale tonal surface, matching darker text, a fine border, and optional icon.
- **State:** Green means completed/present, amber means late or attention, red means absent/error, blue means leave/information, and violet distinguishes pending time-entry workflow. Text remains authoritative.

### Cards / Containers

- **Corner Style:** 12px for standard working cards; use 16px only for branded landmarks or deliberately prominent modules.
- **Background:** Paper white on cool light, with quiet-surface blocks nested for student identity, loading, and secondary facts.
- **Shadow Strategy:** Flat by default; priority check-in content may use the task-emphasis shadow.
- **Border:** One-pixel cool rules separate normal cards, headers, rows, and map details.
- **Internal Padding:** Usually 16–24px, reduced only for dense table or mobile treatments.

### Inputs / Fields

- **Style:** White or page-toned field, 8px corners, cool field rule, 12px horizontal inset, concise labels and helper text.
- **Focus:** Cobalt ring with a visible offset; never remove the global keyboard outline without an equivalent.
- **Error / Disabled:** Use explicit nearby copy plus state color; disabled fields preserve legibility.

### Tables

- **Style:** Dense, flat, left-aligned operational rows with quiet headers, cool dividers, and enough cell padding for scanning.
- **Behavior:** Filters and search precede the dataset; numeric/status columns stay compact; mobile behavior must be intentionally scrollable or reformatted.

### Navigation

- **Style:** Deep navy 288px rail with 56px minimum rows, paired icon wells, strong labels, and short descriptions.
- **Active:** White row, navy text, cobalt-on-wash icon, and `aria-current`; pending counts remain visible.
- **Mobile:** Off-canvas rail opened from the persistent header, closed by an explicit control or scrim.

## Do's and Don'ts

### Do:

- **Do** keep frequent actions and pending states visible in the first working viewport.
- **Do** use cobalt for the clearest next action and deep navy for persistent institutional navigation.
- **Do** pair status color with direct Thai wording and a recognizable icon where practical.
- **Do** use the 8/12/16px corner hierarchy and the 4/8/12/16/24px spacing rhythm.
- **Do** preserve keyboard focus, reduced-motion behavior, readable contrast, and mobile touch targets.

### Don't:

- **Don't** introduce generic gradients, glass panels, decorative blobs, or marketing-style hero composition.
- **Don't** use school yellow as a routine primary button or flood whole screens with it.
- **Don't** make every card float; elevation must communicate navigation, priority, or temporary state.
- **Don't** rely on red, amber, green, blue, or violet without a textual state label.
- **Don't** copy the legacy one-off uppercase eyebrow, ad hoc status pills, or rounded-3xl/backdrop modal treatment into new components; maintain them only where compatibility requires it.
