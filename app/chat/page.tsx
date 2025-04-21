"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string>("")
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)

  // Create a new thread when the component mounts
  useEffect(() => {
    const createThread = async () => {
      try {
        const response = await fetch("/api/thread", {
          method: "POST",
        })
        const data = await response.json()
        setThreadId(data.thread.id)
      } catch (error) {
        console.error("Error creating thread:", error)
      }
    }

    if (!threadId) {
      createThread()
    }
  }, [threadId])

  // Poll for run completion and fetch messages
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const checkRunStatus = async () => {
      if (!runId || !threadId) return

      try {
        const response = await fetch(`/api/run-status?thread_id=${threadId}&run_id=${runId}`)
        const data = await response.json()

        if (data.run.status === "completed") {
          // Run is complete, fetch messages
          setRunId(null)
          fetchMessages()
          setLoading(false)
        } else if (data.run.status === "failed" || data.run.status === "cancelled") {
          // Run failed or was cancelled
          setRunId(null)
          setLoading(false)
          console.error("Run failed or was cancelled:", data.run)
        }
      } catch (error) {
        console.error("Error checking run status:", error)
        setRunId(null)
        setLoading(false)
      }
    }

    if (runId) {
      // Poll every 1 second
      intervalId = setInterval(checkRunStatus, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [runId, threadId])

  const fetchMessages = async () => {
    if (!threadId) return

    try {
      const response = await fetch(`/api/messages?thread_id=${threadId}`)
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !threadId || loading) return

    try {
      setLoading(true)
      // Add user message to UI immediately
      setMessages((prev) => [...prev, { role: "user", content: [{ text: { value: input } }] }])
      setInput("")

      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          thread_id: threadId,
        }),
      })

      const data = await response.json()
      setRunId(data.run.id)
    } catch (error) {
      console.error("Error sending message:", error)
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Chat with BuyHome Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500">Start a conversation with the assistant</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.content.map((content: any, i: number) => (
                      <p key={i}>{content.text?.value}</p>
                    ))}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-200 text-gray-800">
                  <p>Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading || !threadId}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !threadId}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
