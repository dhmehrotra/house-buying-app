"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllCodes, findCode, addTestCode, clearAllCodes } from "@/lib/invite-code-production"
import { dumpAllStorage, STORAGE_KEYS } from "@/lib/storage-service"

export default function DebugInviteCodesPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [codes, setCodes] = useState<any[]>([])
  const [searchCode, setSearchCode] = useState("")
  const [searchResult, setSearchResult] = useState<any>(null)
  const [testCode, setTestCode] = useState({
    code: "",
    email: "",
    realtorId: "r1",
  })
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [keyContent, setKeyContent] = useState<any>(null)
  const [storageType, setStorageType] = useState<"localStorage" | "sessionStorage" | "cookies">("localStorage")

  // Load all codes and storage keys on mount
  useEffect(() => {
    loadCodes()
    loadStorageKeys()
  }, [storageType])

  const loadCodes = () => {
    try {
      const allCodes = getAllCodes()
      setCodes(allCodes)
      console.log("[DebugPage] Loaded", allCodes.length, "invite codes")
    } catch (error) {
      console.error("[DebugPage] Error loading codes:", error)
      toast({
        title: "Error",
        description: "Failed to load invite codes",
        variant: "destructive",
      })
    }
  }

  const loadStorageKeys = () => {
    if (typeof window === "undefined") return

    try {
      let keys: string[] = []

      if (storageType === "localStorage" && window.localStorage) {
        keys = Object.keys(localStorage).sort()
      } else if (storageType === "sessionStorage" && window.sessionStorage) {
        keys = Object.keys(sessionStorage).sort()
      } else if (storageType === "cookies" && typeof document !== "undefined") {
        keys = document.cookie
          .split(";")
          .map((cookie) => cookie.trim().split("=")[0])
          .filter(Boolean)
          .sort()
      }

      setLocalStorageKeys(keys)
    } catch (error) {
      console.error(`[DebugPage] Error loading ${storageType} keys:`, error)
    }
  }

  const viewStorageKey = (key: string) => {
    if (typeof window === "undefined") return

    try {
      let value = null

      if (storageType === "localStorage" && window.localStorage) {
        value = localStorage.getItem(key)
      } else if (storageType === "sessionStorage" && window.sessionStorage) {
        value = sessionStorage.getItem(key)
      } else if (storageType === "cookies" && typeof document !== "undefined") {
        const cookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${key}=`))
          ?.split("=")[1]

        if (cookieValue) {
          value = decodeURIComponent(cookieValue)
        }
      }

      if (value) {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(value)
          setKeyContent(parsed)
        } catch {
          // Not JSON, show as string
          setKeyContent(value)
        }
      } else {
        setKeyContent(null)
      }

      setSelectedKey(key)
    } catch (error) {
      console.error(`[DebugPage] Error viewing ${storageType} key ${key}:`, error)
      toast({
        title: "Error",
        description: `Failed to view ${storageType} key: ${key}`,
        variant: "destructive",
      })
    }
  }

  const handleSearch = () => {
    if (!searchCode.trim()) return

    try {
      const result = findCode(searchCode)
      setSearchResult(result)

      if (result) {
        toast({
          title: "Code Found",
          description: `Found code: ${result.code} for ${result.email}`,
        })
      } else {
        toast({
          title: "Code Not Found",
          description: "No matching invite code found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[DebugPage] Error searching for code:", error)
      toast({
        title: "Error",
        description: "Failed to search for invite code",
        variant: "destructive",
      })
    }
  }

  const handleAddTest = () => {
    if (!testCode.code.trim() || !testCode.email.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please enter both code and email",
        variant: "destructive",
      })
      return
    }

    try {
      const newCode = addTestCode(testCode.code, testCode.email, testCode.realtorId)
      toast({
        title: "Test Code Added",
        description: `Added test code: ${newCode.code}`,
      })

      // Reset form and reload codes
      setTestCode({
        code: "",
        email: "",
        realtorId: "r1",
      })
      loadCodes()
    } catch (error) {
      console.error("[DebugPage] Error adding test code:", error)
      toast({
        title: "Error",
        description: "Failed to add test code",
        variant: "destructive",
      })
    }
  }

  const handleClearAll = () => {
    try {
      clearAllCodes()
      toast({
        title: "Codes Cleared",
        description: "All invite codes have been cleared",
      })
      loadCodes()
    } catch (error) {
      console.error("[DebugPage] Error clearing codes:", error)
      toast({
        title: "Error",
        description: "Failed to clear invite codes",
        variant: "destructive",
      })
    }
  }

  const dumpAllToConsole = () => {
    const allStorage = dumpAllStorage()
    console.log("[DebugPage] All storage:", allStorage)

    toast({
      title: "Dumped to Console",
      description: "All storage data has been dumped to the console",
    })
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Debug Invite Codes</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={dumpAllToConsole}>
            Dump All to Console
          </Button>
        </div>
      </div>

      <Tabs defaultValue="codes">
        <TabsList className="mb-4">
          <TabsTrigger value="codes">Invite Codes</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="codes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Invite Code</CardTitle>
                <CardDescription>Look up a specific invite code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter invite code"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>

                {searchResult && (
                  <div className="p-3 bg-gray-100 rounded-md">
                    <h3 className="font-bold mb-2">Result:</h3>
                    <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(searchResult, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Test Invite Code</CardTitle>
                <CardDescription>Create a test invite code for debugging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testCode">Code</Label>
                  <Input
                    id="testCode"
                    placeholder="Enter code (e.g., TEST123)"
                    value={testCode.code}
                    onChange={(e) => setTestCode({ ...testCode, code: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testEmail">Email</Label>
                  <Input
                    id="testEmail"
                    placeholder="Enter email"
                    value={testCode.email}
                    onChange={(e) => setTestCode({ ...testCode, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testRealtorId">Realtor ID</Label>
                  <Input
                    id="testRealtorId"
                    placeholder="Enter realtor ID"
                    value={testCode.realtorId}
                    onChange={(e) => setTestCode({ ...testCode, realtorId: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddTest} className="w-full">
                  Add Test Code
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Invite Codes ({codes.length})</CardTitle>
                <Button variant="destructive" size="sm" onClick={handleClearAll}>
                  Clear All Codes
                </Button>
              </div>
              <CardDescription>List of all invite codes in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {codes.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No invite codes found</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Code</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Realtor ID</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((code, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 font-mono">{code.code}</td>
                          <td className="p-2">{code.email}</td>
                          <td className="p-2">{code.realtorId}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                code.status === "pending" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {code.status}
                            </span>
                          </td>
                          <td className="p-2">{new Date(code.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={loadCodes}>
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <div className="mb-4">
            <div className="flex space-x-2 mb-2">
              <Button
                variant={storageType === "localStorage" ? "default" : "outline"}
                onClick={() => setStorageType("localStorage")}
              >
                localStorage
              </Button>
              <Button
                variant={storageType === "sessionStorage" ? "default" : "outline"}
                onClick={() => setStorageType("sessionStorage")}
              >
                sessionStorage
              </Button>
              <Button
                variant={storageType === "cookies" ? "default" : "outline"}
                onClick={() => setStorageType("cookies")}
              >
                Cookies
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{storageType} Keys</CardTitle>
                <CardDescription>All keys in {storageType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] overflow-y-auto border rounded-md">
                  {localStorageKeys.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No keys found in {storageType}</div>
                  ) : (
                    localStorageKeys.map((key) => (
                      <button
                        key={key}
                        onClick={() => viewStorageKey(key)}
                        className={`w-full text-left p-2 text-sm border-b hover:bg-gray-50 ${
                          selectedKey === key ? "bg-blue-50" : ""
                        }`}
                      >
                        {key}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={loadStorageKeys} className="w-full">
                  Refresh Keys
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{selectedKey ? `Key: ${selectedKey}` : "Select a key to view"}</CardTitle>
                <CardDescription>
                  {selectedKey
                    ? `Content of the selected key in ${storageType}`
                    : `Click on a key from the list to view its content`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] overflow-auto border rounded-md p-4 bg-gray-50">
                  {selectedKey ? (
                    typeof keyContent === "object" ? (
                      <pre className="text-xs">{JSON.stringify(keyContent, null, 2)}</pre>
                    ) : (
                      <div className="text-sm">{String(keyContent)}</div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No key selected</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fix Invite Code System</CardTitle>
                <CardDescription>Tools to fix common issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Sync Storage</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This will sync invite codes across all storage types (localStorage, sessionStorage, cookies).
                  </p>
                  <Button
                    onClick={() => {
                      try {
                        // Get all codes
                        const allCodes = getAllCodes()

                        // Force save to all storage types
                        if (typeof window !== "undefined") {
                          // Save to localStorage
                          if (window.localStorage) {
                            localStorage.setItem(STORAGE_KEYS.INVITE_CODES, JSON.stringify(allCodes))
                            localStorage.setItem(STORAGE_KEYS.INVITE_CODES_LEGACY, JSON.stringify(allCodes))
                          }

                          // Save to sessionStorage
                          if (window.sessionStorage) {
                            sessionStorage.setItem(STORAGE_KEYS.INVITE_CODES, JSON.stringify(allCodes))
                            sessionStorage.setItem(STORAGE_KEYS.INVITE_CODES_LEGACY, JSON.stringify(allCodes))
                          }

                          // Save to cookies
                          if (typeof document !== "undefined") {
                            const expires = new Date()
                            expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000)
                            document.cookie = `${STORAGE_KEYS.INVITE_CODES}=${encodeURIComponent(JSON.stringify(allCodes))};expires=${expires.toUTCString()};path=/`
                          }
                        }

                        toast({
                          title: "Storage Synced",
                          description: `Synced ${allCodes.length} codes across all storage types`,
                        })

                        loadCodes()
                        loadStorageKeys()
                      } catch (error) {
                        console.error("[DebugPage] Error syncing storage:", error)
                        toast({
                          title: "Error",
                          description: "Failed to sync storage",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    Sync Storage
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">Force Add Current Code</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add the code from the screenshots directly to the system.
                  </p>
                  <Button
                    onClick={() => {
                      const code = "AWWEAXMA"
                      const email = "buyer32@gmail.com"
                      const realtorId = "r1743501419125"

                      try {
                        const newCode = addTestCode(code, email, realtorId)
                        toast({
                          title: "Code Added",
                          description: `Added code: ${newCode.code} for ${email}`,
                        })
                        loadCodes()
                      } catch (error) {
                        console.error("[DebugPage] Error adding code:", error)
                        toast({
                          title: "Error",
                          description: "Failed to add code",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    Add AWWEAXMA for buyer32@gmail.com
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Information about the current environment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Storage Keys</h3>
                    <div className="text-sm">
                      <p>
                        <strong>Primary Storage:</strong> {STORAGE_KEYS.INVITE_CODES}
                      </p>
                      <p>
                        <strong>Legacy Storage:</strong> {STORAGE_KEYS.INVITE_CODES_LEGACY}
                      </p>
                      <p>
                        <strong>Pending Invites:</strong> {STORAGE_KEYS.PENDING_INVITES}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold mb-2">Debug Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          router.push("/signup/buyer")
                        }}
                      >
                        Go to Buyer Signup
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          router.push("/realtor/new-buyer")
                        }}
                      >
                        Go to Create Invite Code
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
