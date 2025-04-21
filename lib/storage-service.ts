/**
 * Robust storage service that works consistently across environments
 * Handles cross-domain issues and provides fallbacks
 */

// Define storage keys
export const STORAGE_KEYS = {
  INVITE_CODES: "buyhome_invite_codes_v2",
  INVITE_CODES_LEGACY: "buyhome_invite_codes",
  PENDING_INVITES: "buyhome_pending_invites",
  REALTORS: "buyhome_all_realtors",
  BUYERS: "buyhome_all_buyers",
  USER: "buyhome_user",
  REALTOR: "buyhome_realtor",
  APP_INITIALIZED: "buyhome_app_initialized",
}

// Define storage types
export type StorageType = "localStorage" | "sessionStorage" | "cookie"

// Storage service configuration
const config = {
  defaultStorage: "localStorage" as StorageType,
  cookieExpireDays: 30,
  debug: true,
}

/**
 * Get item from storage with fallbacks
 */
export function getItem(key: string): string | null {
  try {
    // Try localStorage first
    if (typeof window !== "undefined" && window.localStorage) {
      const value = localStorage.getItem(key)
      if (value !== null) {
        logDebug(`Retrieved from localStorage: ${key}`)
        return value
      }
    }

    // Try sessionStorage next
    if (typeof window !== "undefined" && window.sessionStorage) {
      const value = sessionStorage.getItem(key)
      if (value !== null) {
        logDebug(`Retrieved from sessionStorage: ${key}`)
        return value
      }
    }

    // Try cookies as last resort
    if (typeof document !== "undefined") {
      const value = getCookie(key)
      if (value !== null) {
        logDebug(`Retrieved from cookie: ${key}`)
        return value
      }
    }

    logDebug(`No value found for key: ${key}`)
    return null
  } catch (error) {
    logError(`Error getting item ${key}:`, error)
    return null
  }
}

/**
 * Set item in storage with fallbacks
 */
export function setItem(key: string, value: string, type?: StorageType): boolean {
  try {
    const storageType = type || config.defaultStorage

    // Store in all available storage types for redundancy
    let success = false

    // Try localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(key, value)
        success = true
        logDebug(`Saved to localStorage: ${key}`)
      } catch (e) {
        logError(`Failed to save to localStorage: ${key}`, e)
      }
    }

    // Try sessionStorage
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.setItem(key, value)
        success = true
        logDebug(`Saved to sessionStorage: ${key}`)
      } catch (e) {
        logError(`Failed to save to sessionStorage: ${key}`, e)
      }
    }

    // Try cookies
    if (typeof document !== "undefined") {
      try {
        setCookie(key, value, config.cookieExpireDays)
        success = true
        logDebug(`Saved to cookie: ${key}`)
      } catch (e) {
        logError(`Failed to save to cookie: ${key}`, e)
      }
    }

    return success
  } catch (error) {
    logError(`Error setting item ${key}:`, error)
    return false
  }
}

/**
 * Remove item from all storage types
 */
export function removeItem(key: string): boolean {
  try {
    let success = false

    // Remove from localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.removeItem(key)
        success = true
        logDebug(`Removed from localStorage: ${key}`)
      } catch (e) {
        logError(`Failed to remove from localStorage: ${key}`, e)
      }
    }

    // Remove from sessionStorage
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.removeItem(key)
        success = true
        logDebug(`Removed from sessionStorage: ${key}`)
      } catch (e) {
        logError(`Failed to remove from sessionStorage: ${key}`, e)
      }
    }

    // Remove from cookies
    if (typeof document !== "undefined") {
      try {
        deleteCookie(key)
        success = true
        logDebug(`Removed from cookie: ${key}`)
      } catch (e) {
        logError(`Failed to remove from cookie: ${key}`, e)
      }
    }

    return success
  } catch (error) {
    logError(`Error removing item ${key}:`, error)
    return false
  }
}

/**
 * Get object from storage
 */
export function getObject<T>(key: string): T | null {
  try {
    const value = getItem(key)
    if (value === null) return null
    return JSON.parse(value) as T
  } catch (error) {
    logError(`Error parsing object for key ${key}:`, error)
    return null
  }
}

/**
 * Set object in storage
 */
export function setObject<T>(key: string, value: T, type?: StorageType): boolean {
  try {
    const jsonValue = JSON.stringify(value)
    return setItem(key, jsonValue, type)
  } catch (error) {
    logError(`Error stringifying object for key ${key}:`, error)
    return false
  }
}

// Cookie helpers
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const nameEQ = `${name}=`
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

// Logging helpers
function logDebug(message: string): void {
  if (config.debug && typeof console !== "undefined") {
    console.log(`[StorageService] ${message}`)
  }
}

function logError(message: string, error?: any): void {
  if (typeof console !== "undefined") {
    console.error(`[StorageService] ${message}`, error)
  }
}

// Export a function to dump all storage for debugging
export function dumpAllStorage(): Record<string, any> {
  const result: Record<string, any> = {
    localStorage: {},
    sessionStorage: {},
    cookies: {},
  }

  try {
    // Dump localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              result.localStorage[key] = JSON.parse(value)
            } catch {
              result.localStorage[key] = value
            }
          }
        } catch (e) {
          result.localStorage[key] = `[Error: ${e}]`
        }
      }
    }

    // Dump sessionStorage
    if (typeof window !== "undefined" && window.sessionStorage) {
      const keys = Object.keys(sessionStorage)
      for (const key of keys) {
        try {
          const value = sessionStorage.getItem(key)
          if (value) {
            try {
              result.sessionStorage[key] = JSON.parse(value)
            } catch {
              result.sessionStorage[key] = value
            }
          }
        } catch (e) {
          result.sessionStorage[key] = `[Error: ${e}]`
        }
      }
    }

    // Dump cookies
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";")
      for (const cookie of cookies) {
        if (cookie.trim()) {
          const [name, value] = cookie.trim().split("=")
          result.cookies[name] = decodeURIComponent(value)
        }
      }
    }
  } catch (error) {
    console.error("[StorageService] Error dumping storage:", error)
  }

  return result
}
