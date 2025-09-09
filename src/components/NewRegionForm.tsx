"use client"

import { useState } from "react"

interface Props {
  onCreated?: (region: string) => void
}

export default function NewRegionForm({ onCreated }: Props) {
  const [region, setRegion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!region.trim()) return

    const safeRegion = region.trim().replace(/\s+/g, "-").toLowerCase()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/awards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: safeRegion }) // ✅ send region
      })

      const data = await res.json()

      if (res.ok) {
        onCreated?.(safeRegion)
        setRegion("")
      } else {
        setError(data.error || "Failed to create region")
      }
    } catch (err) {
      console.error("Error creating region:", err)
      setError("Unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New Region"
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
          disabled={loading}
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Region"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
