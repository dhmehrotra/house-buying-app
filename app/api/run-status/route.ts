import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    // Get the thread_id and run_id from the URL
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get("thread_id")
    const runId = searchParams.get("run_id")

    if (!threadId || !runId) {
      return NextResponse.json({ error: "Thread ID and Run ID are required" }, { status: 400 })
    }

    // Retrieve the run status
    const run = await openai.beta.threads.runs.retrieve(threadId, runId)

    return NextResponse.json({ run })
  } catch (error) {
    console.error("Error retrieving run status:", error)

    return NextResponse.json(
      {
        error: "Failed to retrieve run status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
