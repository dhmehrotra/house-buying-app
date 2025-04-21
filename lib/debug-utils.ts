// Utility for comprehensive debugging

export function dumpLocalStorage(prefix = "DEBUG"): void {
  if (typeof window === "undefined") return

  console.log(`[${prefix}] DUMPING ALL LOCALSTORAGE KEYS:`)

  try {
    // List all keys
    const allKeys = Object.keys(localStorage)
    console.log(`[${prefix}] Found ${allKeys.length} keys in localStorage`)

    for (const key of allKeys) {
      try {
        const value = localStorage.getItem(key)
        console.log(`[${prefix}] Key: ${key}`)

        // Try to parse as JSON if possible
        if (value) {
          try {
            const parsed = JSON.parse(value)
            console.log(`[${prefix}] Value (parsed):`, parsed)
          } catch {
            // Not JSON, show as string
            console.log(`[${prefix}] Value (string):`, value)
          }
        } else {
          console.log(`[${prefix}] Value: null or empty`)
        }
      } catch (err) {
        console.error(`[${prefix}] Error reading key ${key}:`, err)
      }
    }
  } catch (error) {
    console.error(`[${prefix}] Error dumping localStorage:`, error)
  }
}

export function inspectObject(obj: any, label = "INSPECT"): void {
  console.log(`[${label}] Object inspection:`)
  console.log(`[${label}] Type: ${typeof obj}`)
  console.log(`[${label}] Value:`, obj)

  if (obj && typeof obj === "object") {
    console.log(`[${label}] Keys: ${Object.keys(obj).join(", ")}`)
    console.log(`[${label}] JSON:`, JSON.stringify(obj, null, 2))
  }
}

export function createVisualDebugElement(data: any): HTMLElement {
  const debugDiv = document.createElement("div")
  debugDiv.style.position = "fixed"
  debugDiv.style.bottom = "10px"
  debugDiv.style.right = "10px"
  debugDiv.style.width = "400px"
  debugDiv.style.maxHeight = "80vh"
  debugDiv.style.overflowY = "auto"
  debugDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
  debugDiv.style.color = "#00ff00"
  debugDiv.style.fontFamily = "monospace"
  debugDiv.style.fontSize = "12px"
  debugDiv.style.padding = "10px"
  debugDiv.style.borderRadius = "5px"
  debugDiv.style.zIndex = "9999"

  const closeButton = document.createElement("button")
  closeButton.textContent = "Close"
  closeButton.style.position = "absolute"
  closeButton.style.top = "5px"
  closeButton.style.right = "5px"
  closeButton.style.backgroundColor = "#ff3333"
  closeButton.style.color = "white"
  closeButton.style.border = "none"
  closeButton.style.borderRadius = "3px"
  closeButton.style.padding = "3px 6px"
  closeButton.onclick = () => document.body.removeChild(debugDiv)

  const heading = document.createElement("h3")
  heading.textContent = "Debug Information"
  heading.style.marginTop = "0"
  heading.style.color = "white"

  const content = document.createElement("pre")
  content.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2)

  debugDiv.appendChild(closeButton)
  debugDiv.appendChild(heading)
  debugDiv.appendChild(content)

  return debugDiv
}

export function showVisualDebug(data: any): void {
  if (typeof window === "undefined") return

  const debugElement = createVisualDebugElement(data)
  document.body.appendChild(debugElement)
}
