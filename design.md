# design.md — NontonFilm Visual Design (v2)

This replaces the previous TMDB-layout-inspired version of this document. The new direction is inspired by the attached "Moov" concept (Dribbble reference): softer dark background (near-black, not pure black), heavy use of rounded/pill shapes for buttons, chips, and nav items, a hero with the character/key art breaking out of its frame rather than a full-bleed dimmed backdrop, and a "Continue Watching" pattern with progress indicators. Brand name, stacked logo, and core palette (gray/black/yellow/red) stay as previously defined — this update is primarily about **shape language, layout rhythm, and a few new components**, not a brand change.

Read alongside `CLAUDE.md`.

## 1. Brand (unchanged)

- **Name:** NontonFilm
- **Logo lockup:** stacked wordmark —
  ```
  NONTON
  FILM
  ```
  "NONTON" in off-white, "FILM" in yellow, tight line-height so it reads as one lockup. In the new nav (see §4) this can also appear as a compact single-line variant (icon-less wordmark, smaller point size) when horizontal space is tight — but the stacked version remains the primary logo wherever there's room.
- **Tone:** shifts slightly with this update — still cinematic and confident, but now warmer/softer rather than stark. The reference's rounded shapes and generous spacing read as more "streaming app to unwind with" than "database to search." Keep that friendlier register in spacing and corner radii while keeping our red/yellow accents so it doesn't drift into generic streaming-app sameness.

## 2. Color Palette (refined, not replaced)

| Role | Color | Hex | Usage |
|---|---|---|---|
| Background (primary) | Soft near-black | `#101013` | App background — slightly warmer/softer than pure black, matching the reference's dark navy-black rather than `#000` |
| Surface | Charcoal gray | `#1C1D22` | Cards, nav pill background, modals |
| Surface (raised/hover) | Mid gray | `#2A2B31` | Hover state on cards and pills |
| Border/divider | Gray | `#34353C` | Rarely needed now — the new layout leans on spacing and rounded surfaces instead of hard dividers; use sparingly |
| Text (primary) | Off-white | `#F5F5F3` | Headings, body text |
| Text (secondary) | Muted gray | `#9A9AA2` | Metadata, captions, inactive pill text |
| Accent — Yellow | Marquee yellow | `#F5C518` | Ratings, active/selected states, key highlights |
| Accent — Red | Cinema red | `#E11D2E` | Secondary CTA fill where used, destructive actions, live/urgent tags |
| CTA — White | Pure/off-white | `#FFFFFF` | **New primary button fill**, replacing red as the default hero CTA (see §3) — mirrors the reference's white "Watch Now" pill, keeps red available as a distinct secondary accent rather than overusing it |

Why the change: in the reference, the primary action button is white-on-dark rather than a saturated color, which reads as clean and premium against the busy character art. Adopting a white primary button for the hero's main CTA gives us that same clean contrast, while red is preserved for secondary/urgent accents (badges, active watch-progress bar, destructive actions) so it doesn't compete with the hero art. Yellow keeps its existing job: ratings and "this is the one that's active/selected" signaling.

## 3. Typography (unchanged, with one addition)

- **Headings:** `Inter` (700/800) or `Poppins` (600/700), still slightly condensed for poster-like impact.
- **Body/UI text:** `Inter` (400/500).
- **Numeric/ratings:** tabular figures.
- **New — pill/chip text:** slightly smaller (0.875rem), medium weight (500), all-lowercase-friendly casing is fine for genre chips (e.g. "action," "comedy") to match the reference's casual chip labels — title case elsewhere.

## 4. Navigation (new pattern)

The reference uses a horizontal text nav (Home / Movies / Series / Kids) plus a cluster of circular icon buttons (search, notifications, avatar) on the right, all sitting directly on the dark background with no visible nav bar container. Adapt this:

- **Left:** Stacked logo (compact single-line variant if needed) + primary nav links (Home, Browse, Watchlist) as plain text, off-white, with a small underline or yellow dot indicator for the active page — no boxed/pill nav items, just clean text with generous letter-spacing.
- **Right:** circular icon buttons for Search and Notifications (charcoal `#1C1D22` fill, off-white icon, hover lightens to `#2A2B31`), and the user's avatar as a circular initials badge (see existing avatar system) — same circular sizing as the icon buttons so the whole cluster reads as one consistent row of round elements.
- **Logged-out state:** keep the two-button Log In / Sign Up group from the previous polish pass, but restyle to match this circular-icon energy — Log In as plain text (no border), Sign Up as a rounded pill (not a hard-cornered rectangle) using the red fill.
- No visible nav bar background/border — let it float directly over the hero background, matching the reference's borderless top bar.

## 5. Hero Section (revised)

Previous version: full-width dimmed backdrop with text overlaid on top of a gradient. New direction, closer to the reference:

- Key art (a movie's poster character/still) sits on the right side of the hero, allowed to extend toward/past the frame edge for visual energy — not necessarily dimmed or gradient-washed the way a full backdrop was.
- Title, short description, and CTAs sit on the left on a clean section of the dark background (not on top of busy imagery), so text never needs a heavy overlay to stay legible.
- **CTA pair:** primary button is the new white pill ("Watch Details" or similar), secondary is a dark/outline pill ("Browse Catalog") with a small trailing chevron — both fully rounded (pill radius, not just rounded corners).
- Rating badge and "Trending Today"-style tag move to sit just above the title, as small rounded chips rather than a single squared-off label bar.
- Retains the **auto-rotation behavior** already implemented (crossfade every 10s, pauses on hover/tab-hidden) — this update changes the hero's visual composition, not that logic.

## 6. Movie Cards (revised — rounded, not sharp)

- Poster cards now use a **consistent rounded-corner radius** (e.g. `rounded-xl`/`~12-16px`) on every card across the app — trending row, popular grid, watchlist, continue watching — replacing the previous sharp-edged card treatment.
- Rating chip overlay stays (top-corner, small rounded pill, yellow star icon + number, semi-transparent dark backing) but should now match the card's own corner radius family so it feels integrated rather than stamped on.
- Title + year sit below the poster, same as before (off-white title, muted gray year).
- Hover: slight scale-up (1.03–1.05) plus a soft shadow — keep motion from the previous spec, just apply it to the new rounded shape.

## 7. New Component — Genre Filter Pills

A horizontal row of rounded, fully-pill-shaped filter chips (e.g. "All Popular," "Action," "Animation," "Horror," "Documentary," "Romance," "Kids," "Comedy") sits above relevant movie rows (Popular Now, Browse).

- **Inactive pill:** charcoal `#1C1D22` fill, muted gray text.
- **Active pill:** off-white fill, near-black text — mirrors the reference's high-contrast "All Popular" selected state — this is now the preferred "selected" treatment for chips, replacing the earlier yellow-pill-active pattern for filters specifically (yellow stays reserved for ratings/scores so the two meanings don't blur).
- Horizontally scrollable on overflow, no wrapping to a second line.
- Clicking a pill filters the row/grid beneath it client-side (or refetches from TMDB `with_genres` if server-driven) — functional behavior for your engineering agent to wire up separately.

## 8. New Component — Continue Watching

For logged-in users with watch history (or, if NontonFilm doesn't track actual playback, this can be reframed as "recently viewed" movie detail pages — flag this to product/engineering before building, since our app is a discovery/review app, not a streaming player):

- Same rounded poster card as §6, with a centered circular translucent **play icon overlay** on hover (or always-visible at lower opacity, per the reference).
- A **thin progress bar** anchored to the bottom edge of the poster, red fill over a muted gray track, showing how far the user got.
- Section header "Continue Watching," same section-title styling as other rows (small red vertical accent bar + bold off-white label, consistent with the existing "Latest Releases" header treatment).

## 9. "See more" pattern + "Show More" button (finalized)

The reference shows a lightweight "See more →" text link at the end of a row's header instead of a large standalone panel. Adopt this as the **row-level** pattern, and treat it as distinct from the bottom-of-page "Show More" button, which now has a specific, finalized job:

- **Row-level "See more":** Trending, Popular Now, and Continue Watching each get a small "See more →" text link, right-aligned next to that row's title, off-white text that turns yellow on hover. Clicking it goes to that row's own filtered view (e.g. Trending's "See more" → `/browse?sort=trending`). These rows are static/curated — no in-place pagination, no loading state, just a link out.
- **Bottom "Show More" button:** there is **no surrounding card/panel** and no "Looking for something specific?" copy anymore — just a single, large, standalone red pill button, "Show More," sitting at the very bottom of the homepage after the Latest Release row. It's a full navigation link, not an in-place fetch.
- **Destination:** it links to the existing **Browse Movies** page (the one already built — sort pills for Release Date Newest/Oldest, Popularity High/Low, Rating High, plus the full paginated grid). No new page needs to be built for this. Since the button follows the Latest Release row, it should land on Browse Movies with the **"Release Date (Newest)"** sort pill pre-selected/active by default, so the transition feels continuous with what the user was just looking at.
- Browse Movies' own pagination (whatever it already uses — page-based Next/Previous) stays as-is; this change is only about which button links there and with what default sort, not about rebuilding that page.
- **Popular Now stays entirely static** — its own row-level "See more →" link only, no button, no pagination.

## 10. Layout Rhythm

- Increase vertical spacing between homepage sections slightly versus the previous spec (the reference reads as more breathable/generous) — aim for consistent large gaps (e.g. 48–64px) between sections rather than tightly stacked ones.
- **Homepage section order:** Hero → Trending → Genre pills → Continue Watching → **Popular Now** → **Latest Release** → standalone "Show More" button. Popular Now sits above Latest Release (swapped from the earlier draft), with Latest Release as the last content section immediately before the "Show More" button, since that button is the doorway into the full Latest Release listing.
- Section headers stay left-aligned with the small colored accent bar treatment already established; only the row-level "See more" link is right-aligned against that same header line.

## 11. Responsive Behavior (unchanged principles, updated shapes)

- Nav collapses the same way as previously specced (search → icon-only, auth group simplifies) but now everything collapses into circular icon buttons rather than boxed ones, staying consistent with the new nav language.
- Genre filter pills and all movie rows remain horizontally scrollable at every breakpoint.
- Hero stacks vertically on mobile: key art moves above or behind the text block at reduced opacity/size, text and CTAs stack full-width, pills remain fully rounded at all sizes.

## 12. Accessibility (unchanged principles)

- Recheck contrast now that background shifted from `#0B0B0D` to `#101013` and a new white (`#FFFFFF`) button fill was introduced — off-white/near-black text on the white CTA pill needs near-black (`#101013` or true black) text to pass AA comfortably; don't use gray text on the white button.
- Active-state pills (genre filters, active nav item) must be distinguishable by more than color alone where feasible (e.g. weight change alongside the fill change) for users with color vision deficiencies.
- All other accessibility notes from the previous version (alt text, focus rings, labeled rating inputs) still apply unchanged.
