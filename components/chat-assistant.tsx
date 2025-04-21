"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@/hooks/use-chat"
import type { ChatMessage as ChatMessageType } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatAssistantProps {
  context?: string
  className?: string
  minHeight?: string
}

export function ChatAssistant({ context = "general", className, minHeight = "400px" }: ChatAssistantProps) {
  const { messages, isLoading, isOpen, error, sendMessage, toggleChat } = useChat(context)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      sendMessage(inputValue)
      setInputValue("")
    }
  }

  const getContextTitle = () => {
    switch (context) {
      case "pre-qualification":
        return "Pre-Qualification Assistant"
      case "needs-assessment":
        return "Needs Assessment Assistant"
      case "property-search":
        return "Property Search Assistant"
      case "property-selection":
        return "Property Selection Assistant"
      default:
        return "Ask our AI Assistant"
    }
  }

  const getPlaceholderText = () => {
    switch (context) {
      case "pre-qualification":
        return "Ask about pre-qualification, financing options..."
      case "needs-assessment":
        return "Ask about home features, neighborhoods..."
      case "property-search":
        return "Ask about search filters, property types..."
      case "property-selection":
        return "Ask about property details, scheduling tours..."
      default:
        return "Type your message..."
    }
  }

  return (
    <div
      className={cn(`w-full bg-white rounded-lg shadow-md overflow-hidden`, className)}
      style={{ height: minHeight, minHeight: minHeight }}
    >
      {/* Chat container */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#ff6a00] text-white p-4 font-semibold flex items-center justify-between">
          <h2 className="text-lg">{getContextTitle()}</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: `calc(${minHeight} - 130px)` }}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 my-8">
              <p>{getWelcomeMessage(context)}</p>
            </div>
          ) : (
            messages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}
          {isLoading && (
            <div className="flex justify-center items-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#ff6a00]" />
            </div>
          )}
          {error && <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">{error}</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholderText()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#ff6a00] hover:bg-[#e05e00] text-white"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getWelcomeMessage(context: string): string {
  switch (context) {
    case "pre-qualification":
      return "Welcome! How can I help you with your pre-qualification and financial readiness questions?"
    case "needs-assessment":
      return "Welcome! I can help you identify your home buying needs and priorities. What questions do you have?"
    case "property-search":
      return "Welcome! I can help you navigate your property search. What would you like to know about finding the right home?"
    case "property-selection":
      return "Welcome! I can help you evaluate properties and prepare for making offers. What questions do you have?"
    default:
      return "Welcome! How can I help you with your home buying journey?"
  }
}

interface ChatMessageProps {
  message: ChatMessageType
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn("max-w-[80%] rounded-lg p-3", isUser ? "bg-gray-100 text-gray-900" : "bg-[#002b40] text-white")}
      >
        <p className="text-sm">{message.content}</p>
        <div className={cn("text-xs mt-1", isUser ? "text-gray-500" : "text-gray-300")}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
}
