"use client"

import { useState } from "react"

interface Props {
  onCreated?: (region: string) => void
}

export default function NewRegionForm({ onCreated }: Props) {
  const [name, setName] = useState("")

  const handleCreate = async () => {
    if (!name.trim()) return

    // Convert to URL-safe filename
    const safeName = name.trim().replace(/\s+/g, "-").toLowerCase()

    try {
      const res = await fetch("/api/awards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: safeName })
      })
      if (res.ok) {
        onCreated?.(safeName)
        setName("")
      } else {
        alert("Failed to create region")
      }
    } catch (err) {
      console.error(err)
      alert("Error creating region")
    }
  }

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="New Region"
        value={name}
        onChange={e => setName(e.target.value)}
        className="flex-1 px-3 py-2 border rounded"
      />
      <button
        onClick={handleCreate}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add Region
      </button>
    </div>
  )
}
