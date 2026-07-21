# Parishioner Portal — UI Kit

Recreation of the parishioner-facing portal, matching `client/src/pages/parishioner-login.tsx` and the implied dashboard at `client/src/pages/parishioner-dashboard.tsx`.

## What's here

- `index.html` — login card on the signature **blue-50 → indigo-100 gradient** background, paired with a parishioner "mypage" view showing personal summary stats, upcoming events, and visit history.

## Conventions used

- Auth card: white with `shadow-xl`, 32px padding, centered seal (User icon on temple-blue circle) over title `text-2xl font-bold`.
- Inputs use the prefix-icon pattern (16px Lucide glyph at `top:12px;left:12px` inside a `pl-10` input).
- Submit button is `bg-blue-600 hover:bg-blue-700` at full width.
- Dashboard preview uses card chrome with a 3-cell summary divider grid (1px hairlines via background-color trick) and two history sections.

## Differences vs staff console

- Background: gradient instead of flat `bg-gray-50`.
- Icon color choice: parishioner login uses pure `bg-blue-600` (rather than the temple-blue token), matching the source.
- Tone: speaks to the parishioner as a guest. Uses 様 honorific. Polite, calm.
