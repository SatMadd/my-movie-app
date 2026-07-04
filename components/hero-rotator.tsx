'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Movie } from '@/types/tmdb'
import { getBackdropUrl } from '@/lib/tmdb'

interface HeroRotatorProps {
  movies: Movie[]
}

const ROTATION_INTERVAL = 10_000 // 10 s between advances
const FADE_DURATION = 450        // ms — must match CSS transition duration

export default function HeroRotator({ movies }: HeroRotatorProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [nextIdx, setNextIdx] = useState(1 % movies.length)
  const [isFading, setIsFading] = useState(false)

  // Refs so event callbacks always read the latest values without stale closures
  const isPausedRef = useRef(false)
  const currentIdxRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the ref in sync with state
  useEffect(() => {
    currentIdxRef.current = currentIdx
  }, [currentIdx])

  // ─── Core advance function ────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (isPausedRef.current || movies.length <= 1) return

    const cur = currentIdxRef.current
    const nxt = (cur + 1) % movies.length

    setNextIdx(nxt)
    setIsFading(true)

    // After the fade completes, flip the "current" layer and reset fade state
    fadeTimerRef.current = setTimeout(() => {
      setCurrentIdx(nxt)
      setIsFading(false)
    }, FADE_DURATION)
  }, [movies.length])

  // ─── Start / Stop helpers ────────────────────────────────────────────────
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(advance, ROTATION_INTERVAL)
  }, [advance])

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // ─── Main rotation effect ────────────────────────────────────────────────
  useEffect(() => {
    if (movies.length <= 1) return
    startInterval()
    return () => {
      stopInterval()
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [movies.length, startInterval, stopInterval])

  // ─── Page Visibility API ─────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopInterval()
      } else {
        startInterval()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [startInterval, stopInterval])

  // ─── Pause / Resume on hover & focus ─────────────────────────────────────
  const pauseRotation = useCallback(() => {
    isPausedRef.current = true
  }, [])

  const resumeRotation = useCallback(() => {
    isPausedRef.current = false
  }, [])

  if (movies.length === 0) return null

  const current = movies[currentIdx]
  const next = movies[nextIdx]

  const currentBackdrop = getBackdropUrl(current.backdrop_path, 'original')
  const nextBackdrop = getBackdropUrl(next.backdrop_path, 'original')

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] flex flex-col justify-end bg-black overflow-hidden">

      {/* ── Preload next backdrop so the browser fetches it before the fade ── */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <link rel="preload" as="image" href={nextBackdrop} />

      {/* ── Backdrop layers ─────────────────────────────────────────────── */}
      <div className="absolute inset-0">

        {/* Layer A — current movie (always fully visible) */}
        <Image
          key={`current-${current.id}`}
          src={currentBackdrop}
          alt={current.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
          style={{ transition: 'none' }}
        />

        {/* Layer B — next movie (fades in on top) */}
        <Image
          key={`next-${next.id}`}
          src={nextBackdrop}
          alt={next.title}
          fill
          sizes="100vw"
          className="object-cover opacity-60"
          style={{
            opacity: isFading ? 0.6 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        />

        {/* Gradient overlays — sit above both backdrops */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D]/80 via-[#0B0B0D]/20 to-transparent" />
      </div>

      {/* ── Hero Content ────────────────────────────────────────────────── */}
      {/*
          Content always reflects `current` — it only flips after the fade
          completes inside the setTimeout, so text and backdrop are never
          mismatched.
      */}
      <div
        className="relative z-10 w-full max-w-4xl px-4 md:px-8 pb-10 sm:pb-16 flex flex-col gap-4"
        style={{
          opacity: isFading ? 0 : 1,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      >
        {/* Badges row */}
        <div className="flex items-center gap-3">
          <span className="bg-[#E11D2E] text-white text-xs font-black uppercase px-2 py-0.5 rounded tracking-wider">
            Trending Today
          </span>
          <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-[#F5C518] font-bold">
            ⭐ {current.vote_average ? current.vote_average.toFixed(1) : 'N/A'}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F5F5F3] leading-[1.05]">
          {current.title}
        </h1>

        {/* Overview */}
        <p className="text-sm sm:text-base text-[#9A9AA2] max-w-2xl line-clamp-3 leading-relaxed">
          {current.overview}
        </p>

        {/* CTA buttons — hover/focus here pauses rotation */}
        <div
          className="mt-2 flex flex-wrap gap-4"
          onMouseEnter={pauseRotation}
          onMouseLeave={resumeRotation}
        >
          <Link
            href={`/movie/${current.id}`}
            className="bg-[#E11D2E] text-[#F5F5F3] hover:bg-[#c11726] font-bold text-sm sm:text-base px-6 py-3 rounded transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
            onFocus={pauseRotation}
            onBlur={resumeRotation}
          >
            Watch Details
          </Link>
          <Link
            href="/browse"
            className="bg-transparent text-[#F5F5F3] border border-[#33343A] hover:bg-[#26272C]/40 hover:border-[#9A9AA2] font-bold text-sm sm:text-base px-6 py-3 rounded transition-all duration-300 cursor-pointer"
            onFocus={pauseRotation}
            onBlur={resumeRotation}
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </section>
  )
}
