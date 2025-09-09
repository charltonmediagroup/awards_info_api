import AwardsEditor from "@/components/AwardsEditor"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function AwardsPage({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params

    const session = await getServerSession(authOptions)
    if (!session) return (
        <div>
            <p>Please log in to edit awards.</p>
            <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                Login
            </Link>
        </div>
    )

    let initialData
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/awards/${region}`)
        if (!res.ok) throw new Error("Region not found")
        initialData = await res.json()
    } catch (err) {
        console.warn(`⚠️ Could not fetch data for region "${region}". Using fallback.`, err)
        initialData = { awards: [], industries: [], recognitions: [] }
    }

    return <AwardsEditor initialData={initialData} region={region} />
}
