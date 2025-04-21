import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// The Assistant ID to use
const ASSISTANT_ID = "asst_pQF4GN1BkLKrkZL4QHY278km"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { message, thread_id } = body

    // Validate the required fields
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!thread_id) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 })
    }

    // Add the user message to the thread
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message,
    })

    // Create a run using the specified assistant
    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: ASSISTANT_ID,
    })

    // Return the full run object
    return NextResponse.json({ run })
  } catch (error) {
    // Log the error for debugging
    console.error("Error in chat API:", error)

    // Return an appropriate error response
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
