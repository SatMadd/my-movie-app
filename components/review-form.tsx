'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ReviewFormProps {
  movieId: number
  userId: string | undefined
  existingReview?: {
    rating: number
    body: string | null
  }
}

export default function ReviewForm({ movieId, userId, existingReview }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState<number>(existingReview?.rating || 10)
  const [body, setBody] = useState<string>(existingReview?.body || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  if (!userId) {
    return (
      <div className="bg-[#1A1B1F] border border-[#33343A] rounded-lg p-6 text-center">
        <p className="text-[#9A9AA2] text-sm">
          Please{' '}
          <a
            href={`/login?next=/movie/${movieId}`}
            className="text-[#F5C518] hover:underline font-bold"
          >
            log in
          </a>{' '}
          to write a community review.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSuccess(false)

    try {
      // Upsert the review (unique constraint on user_id + movie_id)
      const { error: submitError } = await supabase
        .from('reviews')
        .upsert(
          {
            user_id: userId,
            movie_id: movieId,
            rating: rating,
            body: body.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,movie_id' }
        )

      if (submitError) throw submitError

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      console.error('Failed to submit review:', err)
      setError(err.message || 'An error occurred while submitting your review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1A1B1F] border border-[#33343A] rounded-lg p-6 flex flex-col gap-4 shadow-sm"
    >
      <h3 className="text-lg font-bold text-[#F5F5F3]">
        {existingReview ? 'Update Your Review' : 'Write a Community Review'}
      </h3>

      {error && (
        <div className="bg-[#E11D2E]/10 border border-[#E11D2E]/20 text-[#E11D2E] text-xs rounded p-3 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded p-3 text-center">
          Review submitted successfully!
        </div>
      )}

      {/* Rating Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#9A9AA2]">
          Your Rating: <span className="text-[#F5C518] text-sm">{rating}/10</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
            const isSelected = val === rating
            return (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                className={`w-9 h-9 rounded text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#F5C518] text-[#0B0B0D] border-[#F5C518]'
                    : 'bg-[#0B0B0D] text-[#9A9AA2] border-[#33343A] hover:border-[#9A9AA2] hover:text-[#F5F5F3]'
                }`}
              >
                {val}
              </button>
            )
          })}
        </div>
      </div>

      {/* Review Body */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="review-body"
          className="text-xs font-bold uppercase tracking-wider text-[#9A9AA2]"
        >
          Review Content (optional)
        </label>
        <textarea
          id="review-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          className="w-full bg-[#0B0B0D] border border-[#33343A] text-[#F5F5F3] text-sm rounded p-3 focus:outline-none focus:border-[#F5C518] transition-colors"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="self-start bg-[#E11D2E] text-[#F5F5F3] hover:bg-[#c11726] font-bold text-sm px-6 py-2.5 rounded transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  )
}
