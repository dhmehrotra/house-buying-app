"use client"

import { useReducer, useEffect, useCallback, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import type { ChatState, ChatAction, ChatMessage } from "@/types/chat"

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  threadId: null,
  isOpen: true,
  error: null,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading,
      }
    case "SET_THREAD_ID":
      return {
        ...state,
        threadId: action.threadId,
      }
    case "TOGGLE_CHAT":
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      }
    default:
      return state
  }
}

export function useChat(pageContext?: string) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const [currentContext, setCurrentContext] = useState(pageContext || "general")

  // Initialize thread ID from session storage or create a new one
  useEffect(() => {
    const storedThreadId = sessionStorage.getItem("chatThreadId")
    if (storedThreadId) {
      dispatch({ type: "SET_THREAD_ID", threadId: storedThreadId })
    } else {
      const newThreadId = uuidv4()
      sessionStorage.setItem("chatThreadId", newThreadId)
      dispatch({ type: "SET_THREAD_ID", threadId: newThreadId })
    }
  }, [])

  // Load chat history from session storage
  useEffect(() => {
    const storedMessages = sessionStorage.getItem("chatMessages")
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages)
      parsedMessages.forEach((message: any) => {
        dispatch({
          type: "ADD_MESSAGE",
          message: {
            ...message,
            createdAt: new Date(message.createdAt),
          },
        })
      })
    }
  }, [])

  // Save messages to session storage when they change
  useEffect(() => {
    if (state.messages.length > 0) {
      sessionStorage.setItem("chatMessages", JSON.stringify(state.messages))
    }
  }, [state.messages])

  // Update context if pageContext changes
  useEffect(() => {
    if (pageContext) {
      setCurrentContext(pageContext)
    }
  }, [pageContext])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !state.threadId) return

      const userMessage: ChatMessage = {
        id: uuidv4(),
        content,
        role: "user",
        createdAt: new Date(),
      }

      dispatch({ type: "ADD_MESSAGE", message: userMessage })
      dispatch({ type: "SET_LOADING", isLoading: true })
      dispatch({ type: "SET_ERROR", error: null })

      try {
        // Call the API endpoint with context information
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
            thread_id: state.threadId,
            context: currentContext,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        // Simulate a delay for the assistant's response (in a real app, you'd poll for the run completion)
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            content: getContextualResponse(content, currentContext),
            role: "assistant",
            createdAt: new Date(),
          }
          dispatch({ type: "ADD_MESSAGE", message: assistantMessage })
          dispatch({ type: "SET_LOADING", isLoading: false })
        }, 1500)
      } catch (error) {
        console.error("Error sending message:", error)
        dispatch({
          type: "SET_ERROR",
          error: error instanceof Error ? error.message : "An error occurred",
        })
        dispatch({ type: "SET_LOADING", isLoading: false })
      }
    },
    [state.threadId, currentContext],
  )

  const toggleChat = useCallback(() => {
    dispatch({ type: "TOGGLE_CHAT" })
  }, [])

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isOpen: state.isOpen,
    error: state.error,
    sendMessage,
    toggleChat,
    context: currentContext,
  }
}

// Contextual responses based on the current page
function getContextualResponse(message: string, context: string): string {
  // Base responses that could apply to any context
  const baseResponses = [
    "I'm here to help with your home buying journey. What specific questions do you have?",
    "I can provide information and guidance throughout your home buying process.",
    "Feel free to ask me any questions about your home buying journey.",
  ]

  // Context-specific responses
  switch (context) {
    case "pre-qualification":
      if (message.toLowerCase().includes("credit")) {
        return "Your credit score is a key factor in the pre-qualification process. Lenders typically look for scores of 620 or higher, though some loan programs may accept lower scores."
      } else if (message.toLowerCase().includes("document") || message.toLowerCase().includes("need")) {
        return "For pre-qualification, you'll typically need: recent pay stubs, W-2s or tax returns from the past two years, bank statements, and information about your assets and debts."
      } else if (message.toLowerCase().includes("time") || message.toLowerCase().includes("long")) {
        return "The pre-qualification process can be quite quick - sometimes just a few minutes if done online. A more thorough pre-approval might take a few days as the lender verifies your information."
      }
      return "I can help you understand the pre-qualification process. This step helps determine how much home you can afford based on your financial situation."

    case "needs-assessment":
      if (message.toLowerCase().includes("neighborhood") || message.toLowerCase().includes("area")) {
        return "When considering neighborhoods, think about your priorities: school quality, commute time, amenities, safety, and future growth. I can help you evaluate different areas based on your specific needs."
      } else if (message.toLowerCase().includes("renovation") || message.toLowerCase().includes("fixer")) {
        return "Considering a fixer-upper? Factor in renovation costs, timeline, and your tolerance for living through construction. Some loan programs like FHA 203k can help finance both the purchase and renovations."
      } else if (message.toLowerCase().includes("timeline") || message.toLowerCase().includes("when")) {
        return "Your timeline is important for planning. Are you looking to move quickly or do you have flexibility? This affects everything from your search strategy to negotiation leverage."
      }
      return "I can help you identify your home buying needs and priorities. What specific aspects of your lifestyle, preferences, or future plans should we consider in your home search?"

    case "property-search":
      if (message.toLowerCase().includes("filter") || message.toLowerCase().includes("criteria")) {
        return "Effective search filters include price range, location, home size, bedrooms/bathrooms, property type, and specific features. I recommend starting with your must-haves and then adding nice-to-haves."
      } else if (message.toLowerCase().includes("mls") || message.toLowerCase().includes("listing")) {
        return "MLS listings provide comprehensive property information. Pay attention to days on market, price history, and listing descriptions for insights. Photos can tell you a lot, but virtual tours offer even better perspective."
      } else if (
        message.toLowerCase().includes("type") ||
        message.toLowerCase().includes("condo") ||
        message.toLowerCase().includes("townhouse")
      ) {
        return "Different property types have unique considerations. Single-family homes offer privacy but more maintenance, condos have amenities but HOA fees, and townhouses balance both aspects."
      }
      return "I can help you navigate property searches effectively. What type of properties are you interested in, and what features are most important to you?"

    case "property-selection":
      if (message.toLowerCase().includes("tour") || message.toLowerCase().includes("visit")) {
        return "When touring homes, take notes and photos to remember details. Consider visiting at different times of day to check noise levels, lighting, and neighborhood activity. Don't hesitate to schedule second viewings for properties you're serious about."
      } else if (message.toLowerCase().includes("virtual") || message.toLowerCase().includes("video")) {
        return "Virtual tours are great for initial screening. Look for 3D tours that let you navigate freely, and ask if the agent can do a live video walkthrough to show you specific details you're curious about."
      } else if (message.toLowerCase().includes("offer") || message.toLowerCase().includes("ready")) {
        return "Signs you're ready to make an offer include: the property meets your must-haves, you've seen it in person, you've reviewed comparable sales, and you have your financing in order."
      }
      return "I can help you evaluate properties you're considering and prepare for making offers. What specific properties are you interested in, or what aspects of the selection process do you need help with?"

    default:
      // Return a random base response for general context
      return baseResponses[Math.floor(Math.random() * baseResponses.length)]
  }
}
