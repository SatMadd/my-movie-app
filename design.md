# design.md — NontonFilm Visual Design

This document defines the look and feel of NontonFilm. It's meant to be read alongside `CLAUDE.md`. The attached TMDB screenshots are used only as a **layout/IA reference** (hero banner → trending row → filterable popular grid → community/leaderboard section → footer). Our brand identity — name, logo, and colors — is entirely our own.

## 1. Brand

- **Name:** NontonFilm
- **Logo lockup:** stacked wordmark, two lines, tightly kerned:
  ```
  NONTON
  FILM
  ```
  "NONTON" sits on top in the primary light/white tone; "FILM" sits directly below in the yellow accent, slightly bolder or same weight — the stack itself is the logo, no icon needed. Keep line-height tight (roughly 0.9–1x font size) so it reads as one lockup, not two separate words.
- **Tone:** confident, cinematic, a little edgy — closer to a late-night movie theater marquee than a corporate database. Dark backgrounds, high-contrast accents, minimal chrome.

## 2. Color Palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| Background (primary) | Near-black | `#0B0B0D` | App background, nav, footer |
| Surface | Charcoal gray | `#1A1B1F` | Cards, modals, inputs |
| Surface (raised/hover) | Mid gray | `#26272C` | Hover state on cards, secondary buttons |
| Border/divider | Gray | `#33343A` | Card borders, dividers |
| Text (primary) | Off-white | `#F5F5F3` | Headings, body text |
| Text (secondary) | Muted gray | `#9A9AA2` | Metadata, dates, captions |
| Accent — Yellow | Marquee yellow | `#F5C518` | Ratings, badges, active tab, key highlights |
| Accent — Red | Cinema red | `#E11D2E` | Primary CTAs ("Add to Watchlist," "Submit Review"), destructive actions, live/urgent tags |

Guidelines:
- Yellow = **information/value** (ratings, scores, badges — things the user is scanning for).
- Red = **action** (buttons the user clicks to do something).
- Never place red text directly on black at small sizes — use it as a fill/background for buttons/badges instead, or bump size and weight if used as text, to protect contrast.
- Keep large surfaces gray/black; let yellow and red stay accents, not fills for big areas — this keeps the app feeling premium rather than loud.

## 3. Typography

- **Headings:** a tight, slightly condensed grotesque — e.g. `Inter` (700/800 weight) or `Poppins` (600/700). Large hero titles can go semi-bold/extrabold to feel like poster type.
- **Body/UI text:** `Inter` (400/500), system-ui fallback stack.
- **Numeric/ratings:** tabular figures where possible so rating badges don't jitter in width.

Suggested scale (rem): 2.5 / 2 / 1.5 / 1.25 / 1 / 0.875, with 1.25–1.4 line-height for body, 1.05–1.15 for large headings.

## 4. Layout Patterns (borrowing structure, not skin, from the reference screenshots)

### Homepage
1. **Navbar** — fixed, near-black, logo (stacked lockup, smaller/inline variant) on the left, search bar center-right, auth avatar (colored circle with initials, see §6) on the far right.
2. **Hero** — full-width backdrop image of the top trending/newest release, dark gradient overlay bottom-up so title text stays legible, title + short overview + yellow rating badge + red "Watch Details" CTA.
3. **Latest Releases** — horizontally scrollable row of movie cards, section header with a "This Week / Today"-style toggle if useful.
4. **Popular Now** — grid/row with filter tabs (Streaming / In Theaters / For Rent), mirroring the reference's tab pattern but restyled: active tab pill in yellow, inactive tabs muted gray text on transparent background.
5. **Browse by Release Date** — link/section leading to the full paginated catalog (`/browse`), newest first by default.
6. **Footer** — link columns (About, Community, Legal), TMDB attribution notice (required, see CLAUDE.md §5), small and unobtrusive but present.

### Movie detail page (`/movie/[id]`)
- Full-width backdrop banner (dimmed) with poster overlapping bottom-left, similar to typical movie-detail heroes.
- Meta row directly under title: release date · runtime · genre pills (gray pills, yellow text on hover/active).
- **Rating badge:** circular, yellow fill, black bold number — for the TMDB score. A separate, visually distinct badge (outline style, yellow ring on charcoal fill) for the NontonFilm community average, clearly labeled so the two never get confused.
- Overview paragraph, then a horizontally scrollable **cast row** (circular headshots, name + character name beneath).
- **Reviews section** below cast: existing reviews as cards (avatar, username, star/number rating in yellow, review text, date), a "Write a Review" red button opens an inline form (rating input + textarea).
- Sticky or prominent "Add to Watchlist" button near the title (icon toggles filled/red when active, outline gray when not).

### Auth pages (`/login`, `/register`)
- Centered card, max-width ~400px, on the black background. Minimal fields, red primary button, yellow-underline link for switching between login/register.

### Watchlist / Profile (`/watchlist`, `/profile`)
- Tabbed layout: "Watchlist" / "My Reviews," reusing the same movie-card grid component as the homepage for consistency.
- Profile header: colored initials avatar, username, small stats (movies watchlisted, reviews written).

## 5. Core Components

- **Movie Card:** poster image (2:3 ratio), title truncated to 1–2 lines, release date in muted gray below, small yellow rating chip in the top-right corner of the poster (overlaid, semi-transparent black backing) — evokes the "trending" cards in the reference but restyled to our palette.
- **Movie Row:** horizontally scrollable container of Movie Cards with a section title + optional "See all" link on the right.
- **Rating Badge:** circular, two variants (TMDB / Community) as described above.
- **Watchlist Button:** bookmark or heart icon; outline gray by default, filled red + subtle scale animation when active.
- **Review Card:** initials avatar in a flat color (deterministic per user, from a small palette derived from the brand colors — gray, yellow, muted red-orange — similar in spirit to the colored initials seen in the reference's leaderboard), username, numeric rating shown as a small yellow badge, review text, relative date.
- **Buttons:**
  - Primary: red fill, off-white text, subtle darken on hover.
  - Secondary: transparent/gray-outline, off-white text, fills light gray on hover.
  - Tertiary/link: yellow text, underline on hover.
- **Tabs/Pills:** inactive = muted gray text on transparent; active = yellow pill background with black text (high contrast, easy to scan which filter is active).
- **Skeleton loaders:** dark gray shimmer blocks matching card dimensions for image-heavy grids while TMDB data loads.

## 6. Avatars & Identity touches

- Users without a profile photo get a circular initials avatar with a background color assigned from a small fixed set (charcoal, yellow, red-orange, mid-gray) based on a hash of their user id — consistent, no random reshuffling on reload.

## 7. Motion & Interaction

- Cards: slight scale-up (1.03–1.05) + shadow lift on hover, ~150ms ease-out.
- Carousels: smooth native scroll with snap points; optional arrow controls appear on hover for desktop, touch-scroll only on mobile.
- Rating badges and watchlist toggle: quick scale/pulse on state change so the action feels acknowledged.
- Keep motion subtle — this is a content-browsing app, not a game; nothing should distract from posters and text.

## 8. Responsive Behavior

- Navbar collapses search into an icon that expands on tap below `md` breakpoint; auth avatar and logo remain visible.
- Movie rows stay horizontally scrollable at all breakpoints (touch-friendly on mobile, hover-arrow on desktop).
- Hero section on mobile: reduce backdrop height, stack title/CTA vertically, keep rating badge visible.
- Movie detail page: poster + backdrop collapse to stacked (backdrop on top, poster + info below) on narrow screens rather than overlapping.

## 9. Accessibility

- Maintain WCAG AA contrast: off-white (`#F5F5F3`) on near-black (`#0B0B0D`) passes easily; double-check yellow (`#F5C518`) and red (`#E11D2E`) against black background before using them as text color at small sizes — prefer them as fills with black/off-white text on top.
- All posters/backdrops need descriptive `alt` text (movie title at minimum).
- Interactive elements (watchlist toggle, tabs, rating input) need visible focus rings (a thin yellow outline works well against the dark theme) for keyboard navigation.
- Star/number rating inputs should have accessible labels, not rely on color alone to convey selected value.
