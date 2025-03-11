import Link from "next/link"
import { PlusCircle, Clock, Eye, Share2 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Anonymous Poll Creator</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Create anonymous polls that disappear after a set time. No login required.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Poll
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-blue-500" />}
              title="Temporary Polls"
              description="Polls automatically expire after your chosen time limit (1, 12, or 24 hours)."
            />
            <FeatureCard
              icon={<Eye className="h-8 w-8 text-blue-500" />}
              title="Anonymous Voting"
              description="No login required. Vote anonymously and see results instantly."
            />
            <FeatureCard
              icon={<Share2 className="h-8 w-8 text-blue-500" />}
              title="Easy Sharing"
              description="Each poll gets a unique link that you can share with anyone."
            />
          </div>

          <div className="mt-16 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
              <li>Create a poll with multiple options and set an expiration time</li>
              <li>Share the unique link with friends, colleagues, or community</li>
              <li>Everyone can vote anonymously - no accounts needed</li>
              <li>View real-time results until the poll expires</li>
              <li>Once expired, the poll and all its data disappear forever</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

