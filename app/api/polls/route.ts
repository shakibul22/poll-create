import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { question, options, expiresIn, hideResults, isPrivate } = await request.json()

    // Validation
    if (!question || !options || options.length < 2 || !expiresIn) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Create poll options with vote count of 0
    const pollOptions = options.map((text:any) => ({
      _id: new ObjectId(),
      text,
      votes: 0,
    }))

    // Create poll
    const poll = {
      question,
      options: pollOptions,
      expiresAt,
      hideResults,
      isPrivate,
      createdAt: new Date(),
      reactions: { likes: 0, trending: 0 },
      comments: [],
    }

    const result = await db.collection("polls").insertOne(poll)

    return NextResponse.json({
      success: true,
      pollId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating poll:", error)
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
  }
}

