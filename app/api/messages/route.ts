import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    // Get the thread_id from the URL
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get("thread_id")

    if (!threadId) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 })
    }

    // Retrieve the messages
    const messages = await openai.beta.threads.messages.list(threadId)

    return NextResponse.json({ messages: messages.data })
  } catch (error) {
    console.error("Error retrieving messages:", error)

    return NextResponse.json(
      {
        error: "Failed to retrieve messages",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
