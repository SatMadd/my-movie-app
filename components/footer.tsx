import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0B0B0D] border-t border-[#33343A] py-8 px-4 md:px-8 mt-auto text-xs text-[#9A9AA2]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand Lockup */}
        <div className="flex flex-col select-none leading-[0.85] font-black tracking-tight text-center md:text-left">
          <span className="text-[#F5F5F3] text-sm">NONTON</span>
          <span className="text-[#F5C518] text-base tracking-[0.05em]">FILM</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/browse" className="hover:text-[#F5F5F3] transition-colors">
            Browse Movies
          </Link>
          <Link href="/watchlist" className="hover:text-[#F5F5F3] transition-colors">
            My Watchlist
          </Link>
          <a href="#" className="hover:text-[#F5F5F3] transition-colors">
            About Us
          </a>
          <a href="#" className="hover:text-[#F5F5F3] transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-[#F5F5F3] transition-colors">
            Privacy Policy
          </a>
        </div>

        {/* TMDB Attribution */}
        <div className="flex items-center gap-3 max-w-sm text-center md:text-right">
          <p className="leading-normal">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <div className="w-12 h-8 flex-shrink-0 relative flex items-center justify-center">
            {/* TMDB Green/Blue Ribbon Logo */}
            <svg
              viewBox="0 0 100 100"
              className="fill-current text-[#01b4e4]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 25h90v50H5z" fill="#0d253f" />
              <path
                d="M15 35h5v20h10v5H15zm20 0h12c5 0 8 3 8 7v6c0 4-3 7-8 7H35zm5 5v15h7c2 0 3-1 3-3v-9c0-2-1-3-3-3zm18-5h5v20h10v5H58zm20 0h12v5h-7v5h6v5h-6v5h7v5H78z"
                fill="#90cea1"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
