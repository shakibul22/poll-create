"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Share2, MessageSquare, ThumbsUp, Flame } from "lucide-react"

export default function PollPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedOption, setSelectedOption] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reactions, setReactions] = useState({ likes: 0, trending: 0 })
  const [userReactions, setUserReactions] = useState({ liked: false, trending: false })
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check if user prefers dark mode
    if (typeof window !== "undefined") {
      const isDark =
        localStorage.getItem("darkMode") === "true" || window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add("dark")
      }
    }

    // Check if user has already voted
    const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}")
    if (votedPolls[id]) {
      setHasVoted(true)
      setSelectedOption(votedPolls[id])
    }

    fetchPoll()
  }, [id])

  const fetchPoll = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/polls/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Poll not found or has expired")
        }
        throw new Error("Failed to load poll")
      }

      const data = await response.json()
      setPoll(data)
      setComments(data.comments || [])
      setReactions({
        likes: data.reactions?.likes || 0,
        trending: data.reactions?.trending || 0,
      })

      // Calculate time left
      updateTimeLeft(data.expiresAt)

      // Start timer to update time left
      const timer = setInterval(() => {
        if (!updateTimeLeft(data.expiresAt)) {
          clearInterval(timer)
          router.refresh() // Refresh to show expired state
        }
      }, 1000)

      return () => clearInterval(timer)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateTimeLeft = (expiresAt) => {
    const now = new Date().getTime()
    const expiration = new Date(expiresAt).getTime()
    const difference = expiration - now

    if (difference <= 0) {
      setTimeLeft("Expired")
      return false
    }

    const hours = Math.floor(difference / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    return true
  }

  const handleVote = async () => {
    if (!selectedOption || hasVoted) return

    try {
      const response = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId: selectedOption }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit vote")
      }

      // Save vote to localStorage
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}")
      votedPolls[id] = selectedOption
      localStorage.setItem("votedPolls", JSON.stringify(votedPolls))

      setHasVoted(true)

      // Refresh poll data to get updated results
      fetchPoll()
    } catch (err) {
      setError("Failed to submit your vote. Please try again.")
    }
  }

  const handleReaction = async (type) => {
    try {
      // Don't allow toggling off a reaction for simplicity
      if (userReactions[type]) return

      const response = await fetch(`/api/polls/${id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        throw new Error("Failed to add reaction")
      }

      // Update local state
      setUserReactions({ ...userReactions, [type]: true })
      setReactions({ ...reactions, [type]: reactions[type] + 1 })
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return

    try {
      const response = await fetch(`/api/polls/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const newComment = await response.json()
      setComments([...comments, newComment])
      setComment("")
    } catch (err) {
      console.error(err)
    }
  }

  const copyToClipboard = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("darkMode", String(newMode))

    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{error}</h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">This poll may have expired or doesn't exist.</p>

            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create a New Poll
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!poll) return null

  const canSeeResults = !poll.hideResults || hasVoted || timeLeft === "Expired"
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{timeLeft}</span>
            </div>

            <button
              onClick={copyToClipboard}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Share2 className="h-4 w-4 mr-1" />
              {copied ? "Copied!" : "Share"}
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{poll.question}</h1>

          <div className="mb-8">
            {poll.options.map((option) => {
              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

              return (
                <div key={option._id} className="mb-4">
                  <div
                    onClick={() => !hasVoted && setSelectedOption(option._id)}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
                      hasVoted
                        ? "border-gray-300 dark:border-gray-600"
                        : selectedOption === option._id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900 dark:text-white">{option.text}</div>

                      {canSeeResults && (
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{percentage}%</div>
                      )}
                    </div>

                    {canSeeResults && (
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    )}

                    {canSeeResults && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {option.votes} {option.votes === 1 ? "vote" : "votes"}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {!hasVoted && timeLeft !== "Expired" && (
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className={`w-full px-6 py-3 mb-6 font-medium rounded-lg transition-colors ${
                selectedOption
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              Submit Vote
            </button>
          )}

          <div className="flex items-center justify-between border-t border-b py-4 border-gray-200 dark:border-gray-700 mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleReaction("liked")}
                className={`flex items-center text-sm ${
                  userReactions.liked
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                disabled={userReactions.liked}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{reactions.likes}</span>
              </button>

              <button
                onClick={() => handleReaction("trending")}
                className={`flex items-center text-sm ${
                  userReactions.trending
                    ? "text-orange-500 dark:text-orange-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
                }`}
                disabled={userReactions.trending}
              >
                <Flame className="h-4 w-4 mr-1" />
                <span>{reactions.trending}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{comments.length}</span>
              </button>
            </div>
          </div>

          {showComments && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Comments</h3>

              <div className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  maxLength={500}
                ></textarea>

                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className={`px-4 py-2 mt-2 font-medium rounded-lg transition-colors ${
                    comment.trim()
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  Add Comment
                </button>
              </div>

              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-900 dark:text-white">{comment.text}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Anonymous • {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

