"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

export default function CreatePoll() {
  const router = useRouter()
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [expiresIn, setExpiresIn] = useState("3600") // Default: 1 hour in seconds
  const [hideResults, setHideResults] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options]
      newOptions.splice(index, 1)
      setOptions(newOptions)
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!question.trim()) {
      setError("Please enter a question")
      return
    }

    const filteredOptions = options.filter((opt) => opt.trim() !== "")
    if (filteredOptions.length < 2) {
      setError("Please provide at least two options")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          options: filteredOptions,
          expiresIn: Number.parseInt(expiresIn),
          hideResults,
          isPrivate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create poll")
      }

      const data = await response.json()
      router.push(`/poll/${data.pollId}`)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create a New Poll</h1>

          {error && <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Question
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={200}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poll Options</label>

              {options.map((option, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label="Remove option"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}

              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </button>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="expiresIn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poll Duration
              </label>
              <select
                id="expiresIn"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="3600">1 hour</option>
                <option value="43200">12 hours</option>
                <option value="86400">24 hours</option>
              </select>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hideResults"
                  checked={hideResults}
                  onChange={(e) => setHideResults(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hideResults" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Hide results until poll expires
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Private poll (only accessible via link)
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating Poll..." : "Create Poll"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

