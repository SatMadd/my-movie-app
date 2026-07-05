'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@prisma/client'

interface NavbarProps {
  initialUser: any | null
  initialProfile: Profile | null
}

export default function Navbar({ initialUser, initialProfile }: NavbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
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
    const colors = ['bg-[#E11D2E]', 'bg-[#F5C518] text-[#101013]', 'bg-blue-600', 'bg-purple-600', 'bg-teal-600']
    const index = (user?.id || 'default').charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <nav className="sticky top-0 z-50 bg-transparent px-4 md:px-8 py-4 flex items-center justify-between border-none">
      {/* Logo Group */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex flex-col select-none leading-[0.85] font-black tracking-tight text-left"
        >
          <span className="text-[#F5F5F3] text-[18px]">NONTON</span>
          <span className="text-[#F5C518] text-[21px] tracking-[0.05em]">FILM</span>
        </Link>

        {/* Navigation links with Active Dot Indicator */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium pl-2 tracking-wider">
          <Link
            href="/"
            className={`relative py-1 transition-colors ${
              pathname === '/' ? 'text-[#F5F5F3] font-bold' : 'text-[#9A9AA2] hover:text-[#F5F5F3]'
            }`}
          >
            Home
            {pathname === '/' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#F5C518] rounded-full" />
            )}
          </Link>
          <Link
            href="/browse"
            className={`relative py-1 transition-colors ${
              pathname === '/browse' ? 'text-[#F5F5F3] font-bold' : 'text-[#9A9AA2] hover:text-[#F5F5F3]'
            }`}
          >
            Movies
            {pathname === '/browse' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#F5C518] rounded-full" />
            )}
          </Link>
          {user && (
            <Link
              href="/watchlist"
              className={`relative py-1 transition-colors ${
                pathname === '/watchlist' ? 'text-[#F5F5F3] font-bold' : 'text-[#9A9AA2] hover:text-[#F5F5F3]'
              }`}
            >
              Watchlist
              {pathname === '/watchlist' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#F5C518] rounded-full" />
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Right Controls (Circular Actions & Auth) */}
      <div className="flex items-center gap-4">
        {/* Search Input and Button Group */}
        <div className="flex items-center relative">
          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="absolute right-12 z-20">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-40 sm:w-56 bg-[#1C1D22] border border-[#34353C] text-[#F5F5F3] text-xs rounded-full py-1.5 px-4 focus:outline-none focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] transition-all shadow-lg"
              />
            </form>
          )}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1C1D22] text-[#F5F5F3] hover:bg-[#2A2B31] transition-colors cursor-pointer border border-[#34353C]/20"
            title="Search"
          >
            🔍
          </button>
        </div>

        {/* Notifications Icon (Circular) */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1C1D22] text-[#F5F5F3] hover:bg-[#2A2B31] transition-colors cursor-pointer relative border border-[#34353C]/20"
          title="Notifications"
        >
          🔔
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#E11D2E] rounded-full" />
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold uppercase select-none ${getAvatarBgColor()} cursor-pointer border border-[#34353C]`}
            >
              {getInitials()}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#1C1D22] border border-[#34353C] py-1 shadow-lg z-50 text-sm">
                <div className="px-4 py-2 border-b border-[#34353C] text-xs text-[#9A9AA2] truncate">
                  {profile?.username || user.email}
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-[#F5F5F3] hover:bg-[#2A2B31] transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/watchlist"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-[#F5F5F3] hover:bg-[#2A2B31] transition-colors"
                >
                  My Watchlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-[#E11D2E] hover:bg-[#2A2B31] transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#9A9AA2] hover:text-[#F5F5F3] transition-colors py-1.5"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#E11D2E] text-white hover:bg-[#c11726] h-9 px-4 rounded-full transition-all flex items-center justify-center shadow-md shadow-black/20"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
