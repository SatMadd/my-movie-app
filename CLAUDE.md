# CLAUDE.md — NontonFilm

This file tells Claude (or any AI coding assistant) how to work on this repository. Read this fully before writing code. For visual/UI decisions, always cross-check `design.md`.

## 1. Project Overview

**Name:** NontonFilm ("Nonton" = watch, "Film" = movie, in Indonesian — logo is stacked, "Nonton" above "Film")

**Purpose:** NontonFilm helps users decide what to watch next. It surfaces the latest movies, lets people browse by release date, and shows the stats that matter (ratings, cast, overview) on a dedicated movie page. Registered users can build a personal watchlist and leave reviews, so the "helpful stats" purpose extends to community input, not just TMDB data.

**Reference material:** The provided screenshots are of themoviedb.org (TMDB's own website). Treat them as *layout/IA reference only* — the hierarchy (hero → trending row → popular grid with filter tabs → free-to-watch row → community leaderboard → footer) is a good pattern to borrow. Do not copy TMDB's brand colors, logo, or copy. NontonFilm has its own identity — see `design.md`.

## 2. Tech Stack (do not deviate without asking)

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ App Router, TypeScript |
| Styling | Tailwind CSS |
| Movie data | TMDB API v3 |
| Auth + DB | Supabase (Postgres + Supabase Auth) |
| Deployment | Vercel |
| Images | `next/image` with TMDB image CDN domain allow-listed |

Package manager: prefer `pnpm` unless the repo already has a lockfile for something else.

## 3. Core Features (build in this order)

1. **Homepage — latest movies (hero + grid)**
   - Hero: most recent / currently trending release, full-bleed backdrop.
   - Below the fold: sections such as "Latest Releases," "Popular Now," each a horizontally-scrollable row of movie cards.
   - TMDB endpoints: `/movie/now_playing`, `/trending/movie/day` or `/week`, `/discover/movie?sort_by=release_date.desc`.

2. **Browse all movies by release date**
   - Infinite scroll or "load more" grid, sorted by release date (newest first by default, but allow a sort toggle).
   - Use `/discover/movie` with `sort_by=primary_release_date.desc` and pagination (`page` param). Debounce/paginate requests; don't fetch all pages at once.

3. **Movie detail page** — route: `/movie/[id]`
   - Fetch `/movie/{id}` (append `append_to_response=credits,reviews,videos,similar` to minimize round trips).
   - Show: backdrop + poster, title, tagline, release date, runtime, genres, TMDB vote average (styled as our own rating badge), overview, top cast (with photos), and NontonFilm's own review section (see below).
   - Include a visible "Add to Watchlist" action and a "Write a Review" action.

4. **Authentication**
   - Supabase Auth: email/password at minimum. OAuth (Google) is a nice-to-have, not required for v1.
   - Auth state should be available via a server-side helper (`@supabase/ssr`) so server components can check session without a client-side flash.
   - Protected routes: `/watchlist`, `/profile`, review submission. Redirect unauthenticated users to `/login` with a return path.

5. **Watchlist**
   - Authenticated users can add/remove any TMDB movie to a personal watchlist.
   - Watchlist page shows saved movies as cards, pulling fresh poster/title data from TMDB by stored `movie_id` (don't duplicate TMDB metadata in our DB beyond the id).

6. **Reviews**
   - Authenticated users can write a short text review + a 1–10 (or 1–5, pick one and stay consistent) rating for any movie.
   - Reviews are stored in Supabase, keyed by `movie_id`, and displayed on the movie detail page alongside (not mixed with) the TMDB vote average — label clearly: "TMDB Rating" vs "NontonFilm Community Rating."
   - One review per user per movie (upsert, not duplicate rows).

## 4. Supabase Schema (starting point)

```sql
-- profiles: mirrors auth.users, holds public-facing info
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_color text, -- for generated initials avatars, see design.md
  created_at timestamptz default now()
);

-- watchlist: one row per (user, movie)
create table watchlist_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  movie_id integer not null, -- TMDB movie id
  added_at timestamptz default now(),
  unique (user_id, movie_id)
);

-- reviews: one row per (user, movie)
create table reviews (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  movie_id integer not null,
  rating smallint not null check (rating between 1 and 10),
  body text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, movie_id)
);
```

Enable Row Level Security on all three tables. Policies:
- `profiles`: readable by everyone, writable only by the owning user.
- `watchlist_items`: readable/writable only by the owning user.
- `reviews`: readable by everyone, writable (insert/update/delete) only by the owning user.

## 5. TMDB Integration Notes

- Store the TMDB API key server-side (`TMDB_API_KEY`), never exposed to the client. All TMDB calls go through Next.js server components or route handlers, not client-side `fetch`.
- Cache TMDB responses with Next.js `fetch` caching / `revalidate` (e.g. `revalidate: 3600` for lists, longer for static movie detail data) to stay within rate limits.
- Image base URL comes from `/configuration` or hardcode the current one (`https://image.tmdb.org/t/p/`) with sensible size buckets (`w500` for posters, `original` or `w1280` for backdrops).
- **Attribution requirement:** TMDB requires a visible attribution notice ("This product uses the TMDB API but is not endorsed or certified by TMDB.") plus the TMDB logo, typically in the footer. Do not skip this — it's a condition of API use.

## 6. Suggested Folder Structure

```
app/
  page.tsx                 -> homepage
  movie/[id]/page.tsx      -> movie detail
  browse/page.tsx          -> full catalog by release date
  watchlist/page.tsx       -> requires auth
  profile/page.tsx         -> requires auth
  login/page.tsx
  register/page.tsx
  api/                     -> route handlers if needed (e.g. review mutations)
components/
  movie-card.tsx
  movie-row.tsx
  rating-badge.tsx
  review-form.tsx
  review-card.tsx
  navbar.tsx
  footer.tsx
lib/
  tmdb.ts                  -> typed TMDB fetch helpers
  supabase/
    server.ts
    client.ts
types/
  tmdb.ts                  -> response types
```

## 7. Environment Variables

```
TMDB_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, never exposed client-side
```

Never commit `.env.local`. Confirm `.gitignore` covers it.

## 8. Coding Conventions

- TypeScript strict mode on. No `any` unless justified with a comment.
- Prefer Server Components by default; mark `"use client"` only for interactive pieces (watchlist button, review form, carousels with drag/scroll state).
- Data fetching for movie lists/details happens in Server Components; mutations (add to watchlist, submit review) go through Server Actions or a route handler calling Supabase with the user's session.
- Keep TMDB response typing in `types/tmdb.ts` rather than scattering inline types.
- Handle TMDB API failures gracefully (rate limit, network) — show a fallback UI, not a crash.
- Follow the visual system in `design.md` for every new component: colors, spacing, and card patterns should stay consistent across the app rather than reinvented per page.

## 9. How Claude Should Work on This Repo

- Build feature by feature in the order listed in Section 3; don't jump to reviews/watchlist before the homepage and movie detail page work end-to-end with real TMDB data.
- Before creating a new UI pattern, check `design.md` and existing components — reuse `movie-card.tsx` / `movie-row.tsx` rather than creating near-duplicates.
- When a task is ambiguous (e.g. "add sorting"), pick the most reasonable default (newest release first) and note the assumption rather than blocking on it.
- Never invent TMDB endpoints or fields — verify against TMDB's actual API docs/behavior before using them.
- Keep secrets server-side; flag it if a change would leak `TMDB_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client bundle.
