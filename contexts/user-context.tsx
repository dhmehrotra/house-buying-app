"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"

// Update the User type to include id field for better tracking
type User = {
  id?: string
  firstName: string
  lastName: string
  email: string
  role: "buyer" | "realtor"
  currentStep?: number
  completedSteps?: number[]
  savedProperties?: string[]
  viewingRequests?: string[]
}

type UserContextType = {
  user: User | null
  setUser: (user: Partial<User> | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

function createUser(userData: Partial<User>): User {
  return {
    id: `user_${Date.now()}`,
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    role: userData.role || "buyer",
    currentStep: 1, // Ensure new users start at step 1
    completedSteps: [],
    savedProperties: [],
    viewingRequests: [],
    ...userData,
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userState = useRef(user)
  userState.current = user

  useEffect(() => {
    // Load user from localStorage on initial render
    const storedUser = localStorage.getItem("buyhome_user")
    if (storedUser) {
      setUserState(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Enhance the useEffect that saves user data to also generate an ID if not present
  useEffect(() => {
    // Save user to localStorage whenever it changes
    if (user) {
      // Ensure user has an ID
      if (!user.id) {
        const updatedUser = {
          ...user,
          id: `user_${Date.now()}`,
        }
        setUserState(updatedUser)
        return // The next useEffect run will save this updated user
      }

      localStorage.setItem("buyhome_user", JSON.stringify(user))
      // Also set a cookie for the middleware
      document.cookie = `buyhome_user=${JSON.stringify(user)}; path=/; max-age=86400`
    } else {
      // Clear the cookie if user is null
      document.cookie = "buyhome_user=; path=/; max-age=0"
    }
  }, [user])

  const setUser = (userData: Partial<User> | null) => {
    if (!userData) {
      userState.current = null
      localStorage.removeItem("buyhome_user")
      document.cookie = "buyhome_user=; path=/; max-age=0"
      setUserState(null)
      return
    }

    // If we're updating an existing user, preserve their current step
    // unless a new step is explicitly provided
    if (userState.current && userData.currentStep === undefined) {
      userData.currentStep = userState.current.currentStep
    }

    const newUser = createUser(userData)
    userState.current = newUser
    setUserState(newUser)

    // Save to localStorage and cookie
    localStorage.setItem("buyhome_user", JSON.stringify(newUser))
    document.cookie = `buyhome_user=${JSON.stringify(newUser)}; path=/; max-age=86400`
  }

  return <UserContext.Provider value={{ user, setUser, isLoading }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
