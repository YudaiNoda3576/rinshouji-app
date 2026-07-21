# Temple Admin Design System (寺院管理システム)

A design system for a Japanese **temple administration platform** (寺務管理システム) that helps temples manage parishioners (檀家), visit records (お参り), memorial records (過去帳 / 戒名), event calendars, and staff. Two surfaces share a single visual language:

- **Staff console** — full-feature admin for temple staff (priests, office workers). Login → dashboard → calendar / visits / parishioners / memorial / staff.
- **Parishioner portal** — read-only portal for registered parishioners. Login → personal dashboard.

The system is in Japanese. Domain vocabulary matters — see *Content fundamentals*.

---

## Sources

- **Codebase:** `YudaiNoda3576/TemplePilgrim` (default branch `main`) — Vite + React 18 + TypeScript + Tailwind + shadcn/ui (`new-york` style, neutral base) + Radix UI + Lucide icons + Wouter routing + Drizzle ORM + Express backend.
- Key source files referenced while building this system: `tailwind.config.ts`, `client/src/index.css`, `client/src/App.tsx`, `client/src/components/layout/sidebar.tsx`, `client/src/components/dashboard/{stats-cards,recent-activity}.tsx`, `client/src/components/auth/login-form.tsx`, `client/src/pages/{dashboard,parishioner-login}.tsx`, plus the full `client/src/components/ui/*` shadcn primitives.

---

## Index

| File / folder | What it is |
|---|---|
| `README.md` | This file |
| `colors_and_type.css` | All design tokens — color vars, type scale, spacing, radii, shadows |
| `SKILL.md` | Agent-Skills manifest so this system works as a downloaded Claude skill |
| `assets/` | Brand mark (placeholder SVG), background motifs, illustration placeholders |
| `fonts/` | Empty — system uses Noto Sans JP from Google Fonts (see *Visual foundations*) |
| `preview/` | Design-system cards (rendered in the Design System tab) |
| `ui_kits/staff-console/` | High-fidelity recreation of the staff admin app — dashboard, sidebar, stats, dialogs, forms |
| `ui_kits/parishioner-portal/` | High-fidelity recreation of the parishioner-facing portal — login, dashboard |

---

## Content fundamentals

### Language & register

- **Primary language: Japanese.** All UI labels, navigation, button text, error messages, and toasts are written in Japanese. English creeps in only for date formatting strings (`MMM d`) and a couple of placeholder/fallback strings.
- **Register: 丁寧語 (polite form), no 敬語 (honorifics).** The system speaks to staff like a respectful coworker, and to parishioners like a courteous service. Verbs are in 〜ます / 〜ください form. Buttons are imperative-polite: `サインイン` (Sign in), `保存` (Save), `キャンセル` (Cancel), `すべて表示` (Show all).
- **No "I", no "you" pronouns.** Japanese UI typically drops the subject entirely. Don't write 「あなたの〜」 or 「私の〜」 unless the source explicitly does.

### Vocabulary (domain terms — keep these exact)

| Japanese | Reading | Meaning |
|---|---|---|
| 寺院管理 | じいんかんり | Temple administration (product short name) |
| ダッシュボード | — | Dashboard |
| 予定管理 | よていかんり | Schedule / event management |
| お参り | おまいり | Visit (to the temple — by a parishioner) |
| お参り記録 | — | Visit record |
| 檀家 | だんか | Parishioner (member family registered with a temple) |
| 檀家管理 | — | Parishioner management |
| 過去帳 | かこちょう | Memorial register (death records / 戒名) |
| 戒名 | かいみょう | Posthumous Buddhist name |
| 法要 | ほうよう | Memorial service |
| 年忌法要 | ねんきほうよう | Death-anniversary memorial service |
| お布施 | おふせ | Offering (donation given at services) |
| 寺務員 | じむいん | Temple staff / office worker |
| 管理機能 | かんりきのう | Administrative features (admin-only section header) |
| サインイン / サインアウト | — | Sign in / sign out |
| 新規登録 | しんきとうろく | New registration |

### Tone examples (real, from the codebase)

- Login title: **「寺院管理システム」** with subtitle **「続行するにはサインインしてください」** (Please sign in to continue).
- Login success toast: title **「ログインしました」**, description **「ダッシュボードにリダイレクトします」**.
- Login error toast: title **「ログインに失敗しました」**, description **「認証情報が正しくありません」**.
- Dashboard greeting: **「寺院管理システムへようこそ」** (Welcome to the temple admin system).
- Empty state on dashboard: `No recent visits found` — note: English placeholder leaked in; **prefer Japanese**: 「最近のお参り記録はありません」.
- Section descriptions are full polite sentences: 「寺院でのお参り、法要、お布施の記録と管理を行います。」 (We handle the recording and management of visits, services, and offerings at the temple.)
- Admin section header is uppercased latin in spirit but rendered Japanese: 「管理機能」 with `uppercase tracking-wider` styling on a `text-xs text-gray-500` label.

### Copy rules

1. **Sentences end with 「。」**, not periods. Buttons and labels don't take terminal punctuation.
2. **Polite imperatives use 〜してください** when guiding (e.g., 「パスワードを入力してください」). Buttons themselves drop the 〜ください and just say the verb stem (e.g., 「サインイン」, 「保存」).
3. **Headings are short noun phrases**: 「ダッシュボード」, 「最近のお参り」, 「今月の年忌法要」, 「新規檀家登録」.
4. **Stat-card labels** read naturally — 「本日のお参り」 (Today's visits), 「檀家総数」 (Total parishioners), 「過去帳記録数」 (Memorial records count), 「寺務員数」 (Staff count).
5. **No emoji.** None in the source. Don't add any.
6. **No exclamation marks.** The tone is calm, ceremonial, administrative — not cheerful.

---

## Visual foundations

### Palette — two-layer system

The system uses **two parallel color layers**, kept distinct:

**Layer 1 — Neutrals (shadcn `neutral` base, HSL CSS vars).** Cool gray-blue neutrals carry the entire UI chrome — backgrounds, cards, borders, body text. The sidebar inverts to a near-black deep-navy (`224 71% 4%`) which gives the product its characteristic "dark rail + bright workspace" layout. Light mode is the default; dark mode tokens are defined but the staff console runs in light.

**Layer 2 — Domain accents (4 hex colors, custom utilities).** Each major domain gets its own accent. These appear on icon backgrounds, primary CTAs, badges, and active sidebar items. **Do not invent new accent colors** — these four are the whole vocabulary.

| Token | Hex | Role | Lives on |
|---|---|---|---|
| `--temple-blue` | `#2563EB` | Visits, calendar, primary action, brand mark | Sidebar logo, login CTA, today's visits stat |
| `--temple-green` | `#059669` | Parishioners (檀家), confirmation, parishioner portal | Parishioner total stat, parishioner login button |
| `--temple-purple` | `#7C3AED` | Memorial / 過去帳 / 戒名 | Memorial stat icon, anniversary list avatars |
| `--temple-red` | `#DC2626` | Staff, destructive actions, alerts | Staff count stat, delete confirms |

Each accent has a **tint pair** (icon background) and a **hover-deeper** (CTA pressed):

```
temple-blue:    bg-blue-100   / icon: text-temple-blue   / hover: #1D4ED8
temple-green:   bg-green-100  / icon: text-temple-green  / hover: #047857
temple-purple:  bg-purple-100 / icon: text-temple-purple / hover: #6D28D9
temple-red:     bg-red-100    / icon: text-temple-red    / hover: #B91C1C
```

### Typography

- **Family:** No webfont is loaded in the source — it inherits Tailwind's `font-sans` stack. For Japanese rendering we **standardize on `Noto Sans JP`** (Google Fonts) with system-font fallback. This is a **substitution** I am flagging: please confirm or supply a licensed Japanese typeface if you have one.
- **Weights used:** 400 (body), 500 (medium — buttons, nav labels, stat labels), 600 (semibold — headings, card titles), 700 (rare — only used on login page H1).
- **Size scale (Tailwind classes seen in source):** `text-xs` 12px, `text-sm` 14px, `text-base` 16px, `text-lg` 18px, `text-xl` 20px, `text-2xl` 24px. No display sizes — this is a workspace, not a marketing site.
- **Line height** uses Tailwind defaults; tight (`leading-none tracking-tight`) only on card titles.

### Spacing & layout

- **Base unit: 4px** (Tailwind default). Everything snaps to multiples — `p-2` (8) for icon pads, `p-3` (12) for compact cards, `p-4` (16) for headers, `p-6` (24) for card content, `p-8` only on auth pages.
- **Sidebar width: 256px** (`w-64`), fixed on `lg:` and above, slides in from left on mobile.
- **Main content padding:** `pt-16 lg:pt-6 lg:ml-64 lg:pl-6` — sits to the right of the rail with consistent breathing room.
- **Grids:** stats cards use `grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6`. Management cards use `grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6`.

### Radius

- **Base radius:** `--radius: 0.5rem` (8px). Maps to Tailwind `rounded-lg`.
- **Step-down:** `md = calc(--radius - 2px)` = 6px (buttons, inputs).
- **Step-down-2:** `sm = calc(--radius - 4px)` = 4px (small chips, tight elements).
- **Rounded-full:** avatars, badges, the spinner ring, and the auth-page logo circle.

### Shadows

The system uses **only two depth levels**:

1. **`shadow-sm`** — cards, the default elevation. Subtle 1-2px shadow.
2. **`shadow-lg`** — the mobile sidebar drawer and a small set of dialogs.
3. **`shadow-xl`** — only the auth/login card on the parishioner gradient page.

No drop-shadows on text, no inner shadows, no glow.

### Backgrounds

- **App background:** `bg-gray-50` — very light cool gray, the canvas behind cards.
- **Card background:** pure white (`bg-card` resolves to `hsl(0 0% 100%)`).
- **Sidebar:** white on staff console (`bg-white shadow-lg border-r`). The token system defines a dark sidebar (`224 71% 4%`) but the running app uses the white variant. Both are valid; treat dark sidebar as a documented alt.
- **Auth pages** use a soft tonal gradient: `bg-gradient-to-br from-blue-50 to-indigo-100` for the parishioner portal. Staff login uses flat `bg-gray-50`.
- **No images, no patterns, no textures, no full-bleed photography.** This is an administrative product — content lives in cards on a flat neutral canvas.

### Borders

- Default border color is `--border` (`215 28% 90%` light / `215 28% 17%` dark). Used on cards, inputs, dividers between sections (`border-b`), and the sidebar rail (`border-r`).
- Borders are always **1px solid**. No dashed, no dotted, no doubled.
- Form inputs always have a 1px border; on focus they get a 2px `ring-2 ring-ring ring-offset-2`.

### Animation

- **Transitions: `transition-colors`** on every interactive element. Duration is Tailwind's default (150ms). No motion-easing customization in source.
- **Framer Motion** is installed and available for richer animations (drawers, page transitions) — not used heavily in the code I read.
- **Accordion** uses a 0.2s `ease-out` height transition (the only custom keyframe in `tailwind.config.ts`).
- **Loading state:** a centered `animate-spin` ring (`rounded-full border-b-2`). Skeleton placeholders use `animate-pulse` with `bg-gray-200` blocks.
- **No bouncy springs, no scale-in entrances, no parallax.** Movement is functional.

### Interaction states

| State | Treatment |
|---|---|
| **Hover (primary button)** | Background steps to the `/90` opacity variant (e.g., `bg-primary/90`) or the named deeper shade (`hover:bg-blue-700` for `temple-blue`) |
| **Hover (ghost button)** | `hover:bg-accent hover:text-accent-foreground` (light gray fill) |
| **Hover (sidebar item, inactive)** | `hover:bg-gray-100` |
| **Active (sidebar item)** | `bg-temple-blue text-white` — high contrast, no border |
| **Hover (link)** | Color steps deeper (e.g., `hover:text-blue-700`); no underline by default; `underline-offset-4` when underlining |
| **Focus (keyboard)** | `focus-visible:ring-2 ring-ring ring-offset-2` — applied universally via shadcn primitives |
| **Press** | Same as hover (no separate active state). Buttons do **not** shrink on press. |
| **Disabled** | `disabled:opacity-50 disabled:pointer-events-none` |

### Transparency & blur

Used **sparingly**. The mobile-menu backdrop is `bg-black bg-opacity-50` — that's it. No frosted-glass surfaces, no semi-transparent cards.

### Imagery

There is no photography or illustration in the codebase. The product is functional/administrative. If imagery is needed in marketing or onboarding flows, treat any photography as **warm but desaturated** to match the calm temple register — avoid high-saturation, avoid grain/film effects.

### Cards (the dominant container)

```
rounded-lg              (8px corners)
border                  (1px, --border)
bg-card                 (white)
text-card-foreground    (deep navy)
shadow-sm               (subtle)
CardHeader  → flex-col space-y-1.5 p-6
CardContent → p-6 pt-0
CardFooter  → flex items-center p-6 pt-0
```

Cards never sit on cards. They never have colored top-borders or left-borders. Headers may have a `border-b` divider but the card itself stays neutral.

---

## Iconography

- **Source: [Lucide React](https://lucide.dev)** (`lucide-react@^0.453`). Single-line, 2px stroke, rounded caps and joins, designed on a 24px grid.
- **Also installed: `react-icons@^5.4`** — present in dependencies but barely used; treat Lucide as canonical.
- **Sizes seen in source:** `w-3 h-3` (12px, sub-icon inside logo mark), `w-4 h-4` (16px, default in buttons/lists/inputs), `w-5 h-5` (20px, sidebar items and stat-card icons).
- **Color rule:** an icon's color matches its semantic domain (see palette). Domain icon → tinted bg square + accent-colored stroke. Nav icon → matches text color. Form-field icon (the little prefix glyph in inputs) is always `text-gray-400`.
- **Pictograms used (the full inventory I saw in source):** `Home`, `Calendar`, `Users`, `Book`, `UserRoundCheck`, `Settings`, `LogOut`, `Building`, `Menu`, `X`, `Clock`, `BarChart3`, `History`, `Search`, `UserPlus`, `Edit`, `CalendarDays`, `Plus`, `Eye`, `EyeOff`, `Lock`, `LogIn`, `User`, `ArrowRight`.
- **No emoji.** None used in source. Don't introduce them.
- **No unicode-as-icon.** Use Lucide.
- **Brand mark:** in the source, the only "logo" is a Lucide `Building` icon inside a `bg-temple-blue rounded-lg` square (8×8 mobile, 8×8 desktop, 16×16 on the auth page). This is a placeholder — a temple-specific glyph would be welcome. I've drawn a minimal `torii`-inspired SVG mark at `assets/logo-mark.svg` as an alternate proposal; the source-canonical `Building`-in-blue-square is preserved as `assets/logo-mark-source.svg`.
- **Loading via CDN:** Lucide icons are imported as React components; for static HTML mocks, use `https://unpkg.com/lucide-static@latest/icons/<name>.svg` or the inline SVG paths copied into `assets/lucide/`.

---

## How to use this system

1. **For prototypes / mocks** — copy `colors_and_type.css` and the relevant UI-kit components from `ui_kits/` into your HTML, then build.
2. **For production code** — read the source codebase (`TemplePilgrim`); this system documents what's there, it doesn't replace it.
3. **For slide decks or marketing** — pull the brand mark and color tokens from `assets/` + `colors_and_type.css`. Stay flat, stay calm, stay polite.
