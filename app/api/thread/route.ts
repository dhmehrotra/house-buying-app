import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Create a new thread
    const thread = await openai.beta.threads.create()

    return NextResponse.json({ thread })
  } catch (error) {
    console.error("Error creating thread:", error)

    return NextResponse.json(
      {
        error: "Failed to create thread",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
