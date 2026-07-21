# Staff Console — UI Kit

High-fidelity recreation of the temple staff admin app, matching the source at `client/src/pages/dashboard.tsx` and `client/src/components/layout/sidebar.tsx`.

## What's here

- `index.html` — full dashboard view with **sidebar + header + stats grid + recent activity / upcoming memorials + management trio + new-visit dialog**. Click "新規お参り記録" to open the dialog.

## Conventions used (lifted from source)

- Sidebar: 256px fixed left rail, white surface with `border-r` divider, dark-navy alternate is available via tokens.
- Active sidebar item: `bg-temple-blue text-white`. Inactive: `text-gray-700 hover:bg-gray-100`.
- Stat cards: white card + 1px border + `shadow-sm`. Icon sits in a 48×48 tinted square (`bg-{domain}-100`) with accent-colored stroke.
- Page header: `text-2xl font-semibold` title, `text-sm text-gray-600` subtitle.
- Activity rows: 36px avatar circle (gray-100 by default, purple-100 for memorial rows), name + meta on the left, right-aligned date + secondary text.

## What's missing / next

- Calendar, Visits, Parishioners, Memorial, Staff pages — the source has full implementations; this kit covers the dashboard which is the canonical layout reference.
