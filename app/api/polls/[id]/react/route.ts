import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { type } = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 })
    }

    if (!["likes", "trending"].includes(type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if poll exists
    const poll = await db.collection("polls").findOne({
      _id: new ObjectId(id),
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Increment reaction count
    const updateField = `reactions.${type}`
    await db.collection("polls").updateOne({ _id: new ObjectId(id) }, { $inc: { [updateField]: 1 } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding reaction:", error)
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
  }
}

