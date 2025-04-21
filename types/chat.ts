export type MessageRole = "user" | "assistant" | "system"

export interface ChatMessage {
  id: string
  content: string
  role: MessageRole
  createdAt: Date
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  threadId: string | null
  isOpen: boolean
  error: string | null
}

export type ChatAction =
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_THREAD_ID"; threadId: string }
  | { type: "TOGGLE_CHAT" }
  | { type: "SET_ERROR"; error: string | null }
