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
    <section className="relative w-full min-h-[65vh] sm:min-h-[75vh] md:min-h-[85vh] flex flex-col justify-center bg-[#101013] overflow-hidden pt-16">

      {/* ── Preload next backdrop so the browser fetches it before the fade ── */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <link rel="preload" as="image" href={nextBackdrop} />

      {/* ── Backdrop layers (Key Art on the Right) ───────────────────────── */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 lg:w-[55%] h-full z-0 select-none pointer-events-none">

        {/* Layer A — current movie (always fully visible) */}
        <Image
          key={`current-${current.id}`}
          src={currentBackdrop}
          alt={current.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover opacity-50 md:opacity-75"
          style={{ transition: 'none' }}
        />

        {/* Layer B — next movie (fades in on top) */}
        <Image
          key={`next-${next.id}`}
          src={nextBackdrop}
          alt={next.title}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover opacity-50 md:opacity-75"
          style={{
            opacity: isFading ? 0.75 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        />

        {/* Gradient overlays — sit above both backdrops to blend them into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101013] via-transparent to-[#101013]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101013] via-[#101013]/60 md:via-[#101013]/40 to-transparent" />
      </div>

      {/* ── Hero Content (Aligned Left on Clean Background) ───────────────── */}
      <div
        className="relative z-10 w-full max-w-2xl px-4 md:px-8 py-10 sm:py-16 flex flex-col gap-5 mr-auto md:ml-4"
        style={{
          opacity: isFading ? 0 : 1,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      >
        {/* Badges row as small rounded chips */}
        <div className="flex items-center gap-3">
          <span className="bg-[#E11D2E] text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm select-none">
            Trending Today
          </span>
          <div className="flex items-center gap-1 bg-[#1C1D22] border border-[#34353C] rounded-full px-3 py-1 text-[10px] sm:text-xs text-[#F5C518] font-bold shadow-sm select-none">
            ⭐ {current.vote_average ? current.vote_average.toFixed(1) : 'N/A'}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F5F5F3] leading-[1.05]">
          {current.title}
        </h1>

        {/* Overview */}
        <p className="text-sm sm:text-base text-[#9A9AA2] max-w-xl line-clamp-3 leading-relaxed">
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
            className="bg-white hover:bg-[#F5F5F3] text-[#101013] font-bold text-sm sm:text-base px-7 py-3 rounded-full transition-all duration-300 transform hover:scale-[1.02] cursor-pointer shadow-md flex items-center justify-center"
            onFocus={pauseRotation}
            onBlur={resumeRotation}
          >
            Watch Details
          </Link>
          <Link
            href="/browse"
            className="bg-transparent text-[#F5F5F3] border border-[#34353C] hover:bg-[#2A2B31]/40 font-bold text-sm sm:text-base px-7 py-3 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer"
            onFocus={pauseRotation}
            onBlur={resumeRotation}
          >
            Browse Catalog <span className="ml-1 text-xs text-[#9A9AA2] font-normal">›</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
