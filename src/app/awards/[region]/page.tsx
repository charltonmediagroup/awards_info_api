import fs from "fs"
import path from "path"
import AwardsEditor from "@/components/AwardsEditor"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

const awardsDir = path.join(process.cwd(), "src/data/awards")

export default async function AwardsPage({ params }: { params: { region: string } }) {
    // Check login
    const session = await getServerSession(authOptions)
    if (!session) return <div>
        <p>Please log in to edit awards.</p>
        <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            Login
        </Link>
    </div>


    const { region } = params

    let initialData
    try {
        const filePath = path.join(awardsDir, `${region}.json`)
        const fileContents = fs.readFileSync(filePath, "utf8")
        initialData = JSON.parse(fileContents)
    } catch (err) {
        console.warn(`⚠️ No JSON found for region: ${region}, using default.json`)
        const defaultPath = path.join(awardsDir, "default", "default.json")
        const defaultContents = fs.readFileSync(defaultPath, "utf8")
        initialData = JSON.parse(defaultContents)
    }

    return <AwardsEditor initialData={initialData} region={region} />
}
