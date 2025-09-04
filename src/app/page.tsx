import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {/* Logo or image placeholder */}
        {/* Welcome message */}
        <h1 className="text-4xl font-bold text-center sm:text-left">
          Welcome to Awards Info
        </h1>
        <p className="text-lg text-center sm:text-left max-w-md">
          Manage and view awards for different regions. Please log in to edit or add new regions.
        </p>

        {/* Action buttons */}
        <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/awards"
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View Regions
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-gray-500">
        &copy; {new Date().getFullYear()} Awards Info. All rights reserved.
      </footer>
    </div>
  )
}
