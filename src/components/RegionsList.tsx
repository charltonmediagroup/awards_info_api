"use client"

import { useEffect, useState } from "react"

interface RegionsListProps {
  regions: string[]
}

export default function RegionsList({ regions }: RegionsListProps) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000")

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(`Copied to clipboard:\n${text}`)
  }

  return (
    <div className="space-y-2 mt-4">
      {regions.map(region => {
        const apiUrl = `${baseUrl}/api/awards/${region}`
        return (
          <div key={region} className="flex items-center justify-between border p-2 rounded bg-slate-100">
            <span className="font-medium">{region}</span>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(apiUrl)}
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy API URL
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
