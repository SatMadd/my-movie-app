'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@prisma/client'

interface NavbarProps {
  initialUser: any | null
  initialProfile: Profile | null
}

export default function Navbar({ initialUser, initialProfile }: NavbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [showDropdown, setShowDropdown] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Listen for auth state changes to update navbar state dynamically
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Fetch profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data as Profile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/browse')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  // Generate initials for avatar
  const getInitials = () => {
    if (profile?.username) {
      return profile.username.substring(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Get color based on user profile or email hash
  const getAvatarBgColor = () => {
    if (profile?.avatarColor) return profile.avatarColor
    const colors = ['bg-[#E11D2E]', 'bg-[#F5C518] text-black', 'bg-blue-600', 'bg-purple-600', 'bg-teal-600']
    const index = (user?.id || 'default').charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0D]/95 border-b border-[#33343A] backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link
        href="/"
        className="flex flex-col select-none leading-[0.85] font-black tracking-tight text-left mr-4"
      >
        <span className="text-[#F5F5F3] text-[18px]">NONTON</span>
        <span className="text-[#F5C518] text-[21px] tracking-[0.05em]">FILM</span>
      </Link>

      {/* Navigation links */}
      <div className="hidden sm:flex items-center gap-6 text-sm font-medium mr-auto pl-4">
        {user && (
          <Link href="/watchlist" className="text-[#9A9AA2] hover:text-[#F5F5F3] transition-colors">
            Watchlist
          </Link>
        )}
      </div>

      {/* Search Bar & Profile */}
      <div className="flex items-center gap-6 flex-1 justify-end max-w-md ml-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1B1F] border border-[#33343A] text-[#F5F5F3] text-sm rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] transition-all"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9AA2] hover:text-[#F5C518]">
            🔍
          </button>
        </form>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold uppercase select-none ${getAvatarBgColor()} cursor-pointer border border-[#33343A]`}
            >
              {getInitials()}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#1A1B1F] border border-[#33343A] py-1 shadow-lg z-50 text-sm">
                <div className="px-4 py-2 border-b border-[#33343A] text-xs text-[#9A9AA2] truncate">
                  {profile?.username || user.email}
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-[#F5F5F3] hover:bg-[#26272C] transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/watchlist"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-[#F5F5F3] hover:bg-[#26272C] transition-colors"
                >
                  My Watchlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-[#E11D2E] hover:bg-[#26272C] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#9A9AA2] hover:text-[#F5F5F3] hover:bg-[#26272C]/60 h-[34px] px-3.5 sm:px-4 rounded-full transition-all flex items-center justify-center"
            >
              <span className="sm:hidden">👤</span>
              <span className="hidden sm:inline">Log In</span>
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#E11D2E] text-[#F5F5F3] hover:bg-[#c11726] h-[34px] px-3.5 sm:px-4 rounded-full transition-all flex items-center justify-center"
            >
              <span className="sm:hidden">➕</span>
              <span className="hidden sm:inline">Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
