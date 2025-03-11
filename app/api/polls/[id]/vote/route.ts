import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { optionId } = await request.json()

    if (!ObjectId.isValid(id) || !ObjectId.isValid(optionId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if poll exists and hasn't expired
    const poll = await db.collection("polls").findOne({
      _id: new ObjectId(id),
      expiresAt: { $gt: new Date() },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found or has expired" }, { status: 404 })
    }

    // Check if option exists in poll
    const optionExists = poll.options.some((option: any) => option._id.toString() === optionId)

    if (!optionExists) {
      return NextResponse.json({ error: "Option not found in poll" }, { status: 400 })
    }

    // Increment vote count for the selected option
    await db.collection("polls").updateOne(
      {
        _id: new ObjectId(id),
        "options._id": new ObjectId(optionId),
      },
      { $inc: { "options.$.votes": 1 } },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error voting on poll:", error)
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}

