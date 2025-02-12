// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          University Data Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Access, analyze, and compare university data with our intuitive platform.
          Perfect for students and researchers.
        </p>
        <div className="space-x-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            Create account
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
            <p className="text-gray-600">Up to 3 universities</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Premium Plan</h3>
            <p className="text-gray-600">Unlimited universities</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Data Export</h3>
            <p className="text-gray-600">Export to Excel & CSV</p>
          </div>
        </div>
      </div>
    </div>
  )
}