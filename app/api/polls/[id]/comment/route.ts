import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { text } = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if poll exists
    const poll = await db.collection("polls").findOne({
      _id: new ObjectId(id),
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Create comment
    const comment = {
      text: text.trim(),
      createdAt: new Date(),
    }

    // Add comment to poll
    await db.collection("polls").updateOne({ _id: new ObjectId(id) }, { $push: { comments: comment } })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

