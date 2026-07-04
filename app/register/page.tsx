'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('next') || '/'

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.')
      setLoading(false)
      return
    }

    try {
      // 1. Sign up user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Generate a deterministic avatar color based on username length
        const colors = ['#E11D2E', '#F5C518', '#3b82f6', '#8b5cf6', '#14b8a6']
        const avatarColor = colors[username.trim().length % colors.length]

        // 2. Create profile row in profiles table
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: username.trim(),
          avatar_color: avatarColor,
        })

        if (profileError) {
          setError(profileError.message)
          setLoading(false)
          return
        }

        router.refresh()
        router.push(redirectPath)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-[#1A1B1F] border border-[#33343A] rounded-lg p-8 shadow-2xl">
      <div className="flex flex-col items-center mb-8 select-none leading-[0.85] font-black tracking-tight">
        <span className="text-[#F5F5F3] text-2xl">NONTON</span>
        <span className="text-[#F5C518] text-3xl tracking-[0.05em]">FILM</span>
      </div>

      <h2 className="text-xl font-bold text-[#F5F5F3] mb-6 text-center">
        Create Your Account
      </h2>

      {error && (
        <div className="bg-[#E11D2E]/10 border border-[#E11D2E]/20 text-[#E11D2E] text-sm rounded p-3 mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-[#9A9AA2] mb-1.5">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#0B0B0D] border border-[#33343A] text-[#F5F5F3] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
            placeholder="moviefan99"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#9A9AA2] mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0B0B0D] border border-[#33343A] text-[#F5F5F3] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#9A9AA2] mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0B0B0D] border border-[#33343A] text-[#F5F5F3] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#F5C518] transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#E11D2E] text-[#F5F5F3] hover:bg-[#c11726] font-bold text-sm rounded py-2.5 mt-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#9A9AA2]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#F5C518] font-semibold hover:underline decoration-2 underline-offset-4"
        >
          Log in here
        </Link>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0B0B0D] px-4 py-12 min-h-screen">
      <Suspense fallback={<div className="text-sm text-[#9A9AA2]">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
