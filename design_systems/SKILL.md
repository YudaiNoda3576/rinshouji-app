---
name: temple-admin-design
description: Use this skill to generate well-branded interfaces and assets for the Temple Admin (寺院管理 / 寺務管理) platform — either for production or throwaway prototypes/mocks/decks. Contains essential design guidelines, colors, typography, fonts, icon usage, and UI-kit components for prototyping a Japanese temple-administration product that manages parishioners (檀家), visit records (お参り), memorial registers (過去帳), event calendars, and staff.
user-invocable: true
---

Read the `README.md` file within this skill first — it contains the brand context, content fundamentals (Japanese vocabulary and tone), visual foundations (palette, type, spacing, motion, interaction states), and an iconography guide. Then explore the other files:

- `colors_and_type.css` — all design tokens as CSS variables (palette, type scale, radii, shadows, spacing, motion).
- `assets/` — brand mark, Lucide icon SVGs.
- `ui_kits/staff-console/` — high-fidelity recreation of the staff admin app: dashboard, sidebar, stats cards, dialogs, forms.
- `ui_kits/parishioner-portal/` — recreation of the parishioner-facing portal.
- `preview/` — design-system specimen cards (color palette, type, components, etc.) — useful as visual reference.

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing pages), copy assets out and create static HTML files for the user to view; reference `colors_and_type.css` directly and pull components straight out of `ui_kits/`. If working on production code, copy assets and read the rules here to become an expert at designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few clarifying questions (what surface — staff console, parishioner portal, marketing? what flow? Japanese-only?), and act as an expert designer who outputs HTML artifacts or production code depending on the need.

**Non-negotiable rules:**

1. **Japanese first.** All UI copy is Japanese (丁寧語, polite form, no honorifics, no pronouns). See README's content-fundamentals section for the exact vocabulary list and tone examples. English placeholder strings are bugs to fix, not patterns to copy.
2. **Four domain accents, no others.** Use the temple-blue / green / purple / red palette for domain coding (visits / parishioners / memorial / staff). Don't invent new accent colors.
3. **No emoji. No exclamation marks. No decorative gradients.** The tone is calm, ceremonial, administrative.
4. **Icons come from Lucide.** Use the inventory in README's iconography section. Don't draw your own SVG glyphs; don't substitute emoji or unicode.
5. **Cards are the dominant container.** White, 8px corners, subtle border + `shadow-sm`. Never colored top-borders or left-borders.
6. **Sidebar = fixed 256px rail.** Either white (running app default) or deep-navy (token alt). Active item is `bg-temple-blue text-white`.

When in doubt, lift directly from `ui_kits/staff-console/index.html` — it is the canonical reference layout.
