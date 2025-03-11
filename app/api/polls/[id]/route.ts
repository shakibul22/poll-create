import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const poll = await db.collection("polls").findOne({
      _id: new ObjectId(id),
      expiresAt: { $gt: new Date() }, // Only return non-expired polls
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found or has expired" }, { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Error fetching poll:", error)
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 })
  }
}

