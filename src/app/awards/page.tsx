"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import NewRegionForm from "@/components/NewRegionForm"

export default function RegionsPageClient() {
  const [regions, setRegions] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/regions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.regions)) {
          setRegions(data.regions)
        }
      })
      .catch(console.error)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  const toProperCase = (str: string) =>
    str.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Available Regions</h1>

      <div className="space-y-2 max-w-md">
        {regions.map(region => {
          const apiUrl = `${baseUrl}/api/awards/${region}`
          return (
            <div key={region} className="flex items-center gap-2">
              <Link
                href={`/awards/${region}`}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
              >
                {toProperCase(region)}
              </Link>
              <button
                onClick={() => copyToClipboard(apiUrl)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy API URL
              </button>
            </div>
          )
        })}

        <NewRegionForm onCreated={(region) => setRegions(prev => [...prev, region])} />
      </div>
    </div>
  )
}
