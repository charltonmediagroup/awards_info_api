"use client"

import React, { useState, useEffect } from "react"

type Award = {
    icon: string
    name: string
    description: string
    url: string
    industries: Record<string, number>
    recognitions: Record<string, number>
}

type AwardsJson = {
    awards: Award[]
    industries: string[]
    recognitions: string[]
    synonyms: Record<string, string[]>
}

const AwardsEditor = ({ initialData, region }: { initialData: AwardsJson; region: string }) => {
    const [industries, setIndustries] = useState<string[]>(initialData.industries || [])
    const [recognitions, setRecognitions] = useState<string[]>(initialData.recognitions || [])
    const [awards, setAwards] = useState<Award[]>(initialData.awards || [])
    const [synonyms, setSynonyms] = useState<Record<string, string[]>>({})

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [editingIndustry, setEditingIndustry] = useState<string | null>(null)
    const [editingRecognition, setEditingRecognition] = useState<string | null>(null)
    const [tempValue, setTempValue] = useState<string>("")
    const [confirmDelete, setConfirmDelete] = useState<{ type: string; key: string | number } | null>(null)

    // ---------- AWARD CRUD ----------
    const addAward = () => {
        setAwards(prev => [
            ...prev,
            { url: "https://www.awards.info/", icon: "✨", name: "New Award", description: "Description here...", industries: {}, recognitions: {} },
        ])
    }
    const deleteAward = (index: number) => {
        setAwards(prev => prev.filter((_, i) => i !== index))
        setConfirmDelete(null)
    }

    // ---------- VALUE UPDATES ----------
    const setIndustryValue = (awardIndex: number, industry: string, value: number) => {
        setAwards(prev =>
            prev.map((award, i) => (i === awardIndex ? { ...award, industries: { ...award.industries, [industry]: value } } : award))
        )
    }
    const setRecognitionValue = (awardIndex: number, rec: string, value: number) => {
        setAwards(prev =>
            prev.map((award, i) => (i === awardIndex ? { ...award, recognitions: { ...award.recognitions, [rec]: value } } : award))
        )
    }

    // ---------- ADD TO AWARD ----------
    const addIndustryToAward = (awardIndex: number, industry: string) => {
        setAwards(prev =>
            prev.map((award, i) => (i === awardIndex ? { ...award, industries: { ...award.industries, [industry]: 50 } } : award))
        )
    }
    const addRecognitionToAward = (awardIndex: number, rec: string) => {
        setAwards(prev =>
            prev.map((award, i) => (i === awardIndex ? { ...award, recognitions: { ...award.recognitions, [rec]: 50 } } : award))
        )
    }

    // ---------- GLOBAL CRUD ----------
    const addIndustry = () => setIndustries(prev => [...prev, "New Industry"])
    const saveIndustry = (oldName: string, newName: string) => {
        setIndustries(prev => prev.map(ind => (ind === oldName ? newName : ind)))
        setAwards(prev =>
            prev.map(award => {
                const updatedIndustries = { ...award.industries }
                if (oldName in updatedIndustries) {
                    updatedIndustries[newName] = updatedIndustries[oldName]
                    delete updatedIndustries[oldName]
                }
                return { ...award, industries: updatedIndustries }
            })
        )
        setEditingIndustry(null)
    }
    const deleteIndustry = (name: string) => {
        setIndustries(prev => prev.filter(i => i !== name))
        setAwards(prev =>
            prev.map(award => {
                const { [name]: _, ...rest } = award.industries
                return { ...award, industries: rest }
            })
        )
        setConfirmDelete(null)
    }

    const addRecognition = () => setRecognitions(prev => [...prev, "New Recognition"])
    const saveRecognition = (oldName: string, newName: string) => {
        setRecognitions(prev => prev.map(rec => (rec === oldName ? newName : rec)))
        setAwards(prev =>
            prev.map(award => {
                const updatedRecs = { ...award.recognitions }
                if (oldName in updatedRecs) {
                    updatedRecs[newName] = updatedRecs[oldName]
                    delete updatedRecs[oldName]
                }
                return { ...award, recognitions: updatedRecs }
            })
        )
        setEditingRecognition(null)
    }
    const deleteRecognition = (name: string) => {
        setRecognitions(prev => prev.filter(r => r !== name))
        setAwards(prev =>
            prev.map(award => {
                const { [name]: _, ...rest } = award.recognitions
                return { ...award, recognitions: rest }
            })
        )
        setConfirmDelete(null)
    }

    const handleAddSynonym = (industry: string, keyword: string) => {
        setSynonyms(prev => ({
            ...prev,
            [industry]: [...(prev[industry] || []), keyword],
        }))
    }
    const handleRemoveSynonym = (industry: string, idx: number) => {
        setSynonyms(prev => ({
            ...prev,
            [industry]: prev[industry].filter((_, i) => i !== idx),
        }))
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/awards/${region}`)
                if (!res.ok) throw new Error("Failed to fetch region data")

                const data = await res.json()

                setIndustries(data.industries || [])
                setRecognitions(data.recognitions || [])
                setAwards(data.awards || [])
                setSynonyms(data.synonyms || {})
            } catch (err: any) {
                console.error("Fetch error:", err)
                setError("Could not load region data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [region])

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/awards/${region}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer cmg_token`
                },
                body: JSON.stringify({
                    awards,
                    industries,
                    recognitions,
                    synonyms
                }),
            })
            console.log("PUT URL:", `/api/awards/${region}`)

            if (!res.ok) throw new Error("Failed to save")
            alert("Saved ✅")
        } catch (err) {
            alert("Error saving ❌")
            console.error(err)
        }
    }

    return (
        <div className="p-6 space-y-6 mx-[10%]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Awards JSON Editor 🏆 ({region})</h1>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6 h-[calc(100vh-100px)]">
                {/* Industries */}
                <div className="col-span-1 p-4 border border-slate-700 rounded-lg shadow bg-slate-800 overflow-y-auto scrollbar-dark">
                    <h2 className="text-xl font-semibold mb-3">Industries</h2>
                    {industries.map(ind => (
                        <div key={ind} className="flex items-center gap-2 mb-2">
                            {editingIndustry === ind ? (
                                <>
                                    <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border rounded px-2 py-1 flex-1" />
                                    <button onClick={() => saveIndustry(ind, tempValue)} className="px-2 py-1 bg-green-500 text-white rounded">✔</button>
                                    <button onClick={() => setEditingIndustry(null)} className="px-2 py-1 bg-gray-500 text-white rounded">✕</button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{ind}</span>
                                    <button onClick={() => { setEditingIndustry(ind); setTempValue(ind) }} className="px-2 py-1 bg-yellow-400 text-white rounded">Edit</button>
                                    {confirmDelete?.type === "industry" && confirmDelete.key === ind ? (
                                        <>
                                            <button onClick={() => deleteIndustry(ind)} className="px-2 py-1 bg-red-500 text-white rounded">Confirm?</button>
                                            <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 bg-gray-500 text-white rounded">Cancel</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setConfirmDelete({ type: "industry", key: ind })} className="px-2 py-1 bg-red-400 text-white rounded">✕</button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    <button onClick={addIndustry} className="px-3 py-1 bg-blue-500 text-white rounded">+ Add Industry</button>
                </div>

                {/* Recognitions */}
                <div className="col-span-1 p-4 border border-slate-700 rounded-lg shadow bg-slate-800 overflow-y-auto scrollbar-dark">
                    <h2 className="text-xl font-semibold mb-3">Recognitions</h2>
                    {recognitions.map(rec => (
                        <div key={rec} className="flex items-center gap-2 mb-2">
                            {editingRecognition === rec ? (
                                <>
                                    <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="border rounded px-2 py-1 flex-1" />
                                    <button onClick={() => saveRecognition(rec, tempValue)} className="px-2 py-1 bg-green-500 text-white rounded">✔</button>
                                    <button onClick={() => setEditingRecognition(null)} className="px-2 py-1 bg-gray-500 text-white rounded">✕</button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{rec}</span>
                                    <button onClick={() => { setEditingRecognition(rec); setTempValue(rec) }} className="px-2 py-1 bg-yellow-400 text-white rounded">Edit</button>
                                    {confirmDelete?.type === "recognition" && confirmDelete.key === rec ? (
                                        <>
                                            <button onClick={() => deleteRecognition(rec)} className="px-2 py-1 bg-red-500 text-white rounded">Confirm?</button>
                                            <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 bg-gray-500 text-white rounded">Cancel</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setConfirmDelete({ type: "recognition", key: rec })} className="px-2 py-1 bg-red-400 text-white rounded">✕</button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    <button onClick={addRecognition} className="px-3 py-1 bg-blue-500 text-white rounded">+ Add Recognition</button>
                </div>
                {/* ---------- SYNONYMS SECTION ---------- */}
                <div className="col-span-1 p-4 border border-slate-700 rounded-lg shadow bg-slate-800 overflow-y-auto scrollbar-dark">
                    <h2 className="text-xl font-semibold mb-4">Synonyms</h2>

                    {Object.entries(synonyms).map(([keyword, words]) => (
                        <div key={keyword} className="my-10">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">{keyword}</h3>
                                <button
                                    onClick={() =>
                                        setSynonyms(prev => {
                                            const updated = { ...prev }
                                            delete updated[keyword] // ✅ remove entire keyword
                                            return updated
                                        })
                                    }
                                    className="text-red-400 text-xs hover:text-red-700"
                                >
                                    Delete Keyword ✕
                                </button>
                            </div>

                            {/* Synonym pills */}
                            <div className="flex flex-wrap gap-2">
                                {words.length > 0 ? (
                                    words.map((w, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-full text-sm"
                                        >
                                            <input
                                                type="text"
                                                value={w}
                                                onChange={(e) => {
                                                    const newValue = e.target.value
                                                    setSynonyms(prev => {
                                                        const updated = { ...prev }
                                                        updated[keyword][i] = newValue
                                                        return updated
                                                    })
                                                }}
                                                className="bg-transparent outline-none w-auto"
                                            />
                                            <button
                                                onClick={() =>
                                                    setSynonyms(prev => ({
                                                        ...prev,
                                                        [keyword]: prev[keyword].filter((_, idx) => idx !== i),
                                                    }))
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">No synonyms yet</p>
                                )}
                            </div>

                            {/* Add synonym input */}
                            <button
                                onClick={() =>
                                    setSynonyms(prev => ({
                                        ...prev,
                                        [keyword]: [...(prev[keyword] || []), ""],
                                    }))
                                }
                                className="mt-2 text-sm px-2 py-1 bg-blue-500 text-white rounded"
                            >
                                + Add Synonym
                            </button>
                        </div>
                    ))}

                    {/* Add new keyword */}
                    <div className="mt-6">
                        <select
                            className="px-2 py-1 border bg-slate-700 rounded text-sm"
                            value="" // always reset after change
                            onChange={(e) => {
                                const selected = e.target.value
                                if (selected) {
                                    setSynonyms(prev => ({
                                        ...prev,
                                        [selected]: [], // new keyword with empty synonyms
                                    }))
                                }
                            }}
                        >
                            <option value="">+ Add Keyword</option>
                            {recognitions
                                .filter(r => !(r in synonyms)) // only recognitions not already used
                                .map(r => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

            </div>

            {/* Awards */}
            <div className="my-[50px] grid h-[calc(100vh-100px)]">
                <div className="overflow-y-auto bg-slate-700 rounded-md p-4 scrollbar-dark">
                    <h2 className="text-xl font-semibold mb-3">Awards</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {awards.map((award, index) => {
                            const activeIndustries = Object.entries(award.industries).filter(([_, v]) => v > 0)
                            const availableIndustries = industries.filter(ind => !(ind in award.industries))
                            const activeRecognitions = Object.entries(award.recognitions).filter(([_, v]) => v > 0)
                            const availableRecognitions = recognitions.filter(rec => !(rec in award.recognitions))

                            return (
                                <div key={index} className="px-4 py-6 border border-slate-700 rounded-lg shadow bg-slate-800">
                                    <div className="flex justify-between items-center">
                                        <input type="text" value={award.name} onChange={e => setAwards(prev => prev.map((a, i) => i === index ? { ...a, name: e.target.value } : a))} className="border rounded px-2 py-1 text-lg flex-1" />
                                        {confirmDelete?.type === "award" && confirmDelete.key === index ? (
                                            <div className="flex gap-2 ml-3">
                                                <button onClick={() => deleteAward(index)} className="px-3 py-1 bg-red-500 text-white rounded">Confirm?</button>
                                                <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 bg-gray-500 text-white rounded">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDelete({ type: "award", key: index })} className="ml-3 px-3 py-1 bg-red-400 text-white rounded">Delete</button>
                                        )}
                                    </div>
                                    <textarea rows={3} value={award.description} onChange={e => setAwards(prev => prev.map((a, i) => i === index ? { ...a, description: e.target.value } : a))} className="border rounded px-2 py-1 mt-2 w-full" />
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="w-16 text-sm">Image/icon</span>
                                        <input
                                            type="text"
                                            value={award.icon}
                                            onChange={e =>
                                                setAwards(prev =>
                                                    prev.map((a, i) =>
                                                        i === index ? { ...a, icon: e.target.value } : a
                                                    )
                                                )
                                            }
                                            className="border rounded px-2 py-1 flex-1"
                                            placeholder="e.g. ✨ or https://example.com/icon.png"
                                        />

                                        {/* Preview */}
                                        {award.icon && (
                                            award.icon.startsWith("http") ? (
                                                <img
                                                    src={award.icon}
                                                    alt="icon"
                                                    className="w-15 h-15 object-contain rounded"
                                                />
                                            ) : (
                                                <span className="text-xl">{award.icon}</span>
                                            )
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="w-16">URL</span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="text"
                                                value={award.url || ""}
                                                onChange={e =>
                                                    setAwards(prev =>
                                                        prev.map((a, i) => (i === index ? { ...a, url: e.target.value } : a))
                                                    )
                                                }
                                                className="border rounded px-2 py-1 flex-1"
                                                placeholder="https://example.com"
                                            />
                                            {award.url && (
                                                <button
                                                    onClick={() => window.open(award.url, "_blank")}
                                                    className="px-2 py-1 bg-blue-500 text-white rounded"
                                                >
                                                    Visit
                                                </button>
                                            )}
                                        </div>

                                    </div>

                                    <h3 className="font-semibold mt-4">Industries</h3>
                                    {activeIndustries.map(([ind, value]) => (
                                        <div key={ind} className="flex items-center gap-3 mt-1">
                                            <span className="w-32">{ind}</span>
                                            <input type="range" min="0" max="100" value={value} onChange={e => setIndustryValue(index, ind, Number(e.target.value))} className="flex-1" />
                                            <span className="w-10 text-right">{value}</span>
                                        </div>
                                    ))}
                                    {availableIndustries.length > 0 && (
                                        <select
                                            className="border border-slate-700 rounded px-2 py-1 mt-2 w-full bg-slate-900 text-white"
                                            defaultValue=""
                                            onChange={e => {
                                                if (e.target.value) addIndustryToAward(index, e.target.value)
                                                e.target.value = ""
                                            }}
                                        >
                                            <option value="" disabled className="bg-slate-900 text-white">
                                                + Add Industry
                                            </option>
                                            {availableIndustries.map(ind => (
                                                <option key={ind} value={ind} className="bg-slate-900 text-white">
                                                    {ind}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    <h3 className="font-semibold mt-4">Recognitions</h3>
                                    {activeRecognitions.map(([rec, value]) => (
                                        <div key={rec} className="flex items-center gap-3 mt-1">
                                            <span className="w-32">{rec}</span>
                                            <input type="range" min="0" max="100" value={value} onChange={e => setRecognitionValue(index, rec, Number(e.target.value))} className="flex-1" />
                                            <span className="w-10 text-right">{value}</span>
                                        </div>
                                    ))}
                                    {availableRecognitions.length > 0 && (
                                        <select
                                            className="border border-slate-700 rounded px-2 py-1 mt-2 w-full bg-slate-900 text-white"
                                            defaultValue=""
                                            onChange={e => {
                                                if (e.target.value) addRecognitionToAward(index, e.target.value)
                                                e.target.value = ""
                                            }}
                                        >
                                            <option value="" disabled className="bg-slate-900 text-white">
                                                + Add Recognition
                                            </option>
                                            {availableRecognitions.map(rec => (
                                                <option key={rec} value={rec} className="bg-slate-900 text-white">
                                                    {rec}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={addAward} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">+ Add Award</button>
                </div>
            </div>

            {/* JSON Output */}
            <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
                <h2 className="font-semibold mb-2">Updated JSON ({region}):</h2>
                <pre className="text-sm whitespace-pre-wrap">{JSON.stringify({ industries, recognitions, awards, synonyms }, null, 2)}</pre>
            </div>
        </div>
    )
}

export default AwardsEditor
