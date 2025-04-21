"use client"

import { useState, useEffect } from "react"
import { Building2, RefreshCw, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getCodes, saveCodes, addTestCode } from "@/lib/invite-code-direct"

export default function DebugPage() {
  const { toast } = useToast()
  const [allCodes, setAllCodes] = useState<any[]>([])
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>({})
  const [sessionStorageData, setSessionStorageData] = useState<Record<string, any>>({})
  const [cookieData, setCookieData] = useState<Record<string, any>>({})
  const [newCode, setNewCode] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRealtorId, setNewRealtorId] = useState("r1")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = () => {
    setIsLoading(true)
    try {
      // Load invite codes
      const codes = getCodes()
      setAllCodes(codes)

      // Load localStorage data
      const localData: Record<string, any> = {}
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            try {
              localData[key] = JSON.parse(localStorage.getItem(key) || "null")
            } catch (e) {
              localData[key] = localStorage.getItem(key)
            }
          }
        }
      }
      setLocalStorageData(localData)

      // Load sessionStorage data
      const sessionData: Record<string, any> = {}
      if (typeof window !== "undefined" && window.sessionStorage) {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key) {
            try {
              sessionData[key] = JSON.parse(sessionStorage.getItem(key) || "null")
            } catch (e) {
              sessionData[key] = sessionStorage.getItem(key)
            }
          }
        }
      }
      setSessionStorageData(sessionData)

      // Load cookie data
      const cookieObj: Record<string, any> = {}
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";")
        for (const cookie of cookies) {
          const [key, value] = cookie.trim().split("=")
          if (key && value) {
            try {
              cookieObj[key] = JSON.parse(decodeURIComponent(value))
            } catch (e) {
              cookieObj[key] = decodeURIComponent(value)
            }
          }
        }
      }
      setCookieData(cookieObj)

      toast({
        title: "Data Loaded",
        description: `Found ${codes.length} invite codes`,
      })
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncStorage = () => {
    try {
      // Get the codes from our direct system
      const codes = getCodes()

      // Save to all storage types
      saveCodes(codes)

      // Reload data
      loadAllData()

      toast({
        title: "Storage Synced",
        description: `Synced ${codes.length} invite codes across all storage types`,
      })
    } catch (error) {
      console.error("Error syncing storage:", error)
      toast({
        title: "Error",
        description: "Failed to sync storage",
        variant: "destructive",
      })
    }
  }

  const addCode = () => {
    if (!newCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a code",
        variant: "destructive",
      })
      return
    }

    try {
      const code = addTestCode(newCode.trim(), newEmail.trim() || "test@example.com", newRealtorId.trim() || "r1")

      toast({
        title: "Code Added",
        description: `Added code: ${code.code}`,
      })

      // Reload data
      loadAllData()

      // Clear form
      setNewCode("")
      setNewEmail("")
    } catch (error) {
      console.error("Error adding code:", error)
      toast({
        title: "Error",
        description: "Failed to add code",
        variant: "destructive",
      })
    }
  }

  const clearAllStorage = () => {
    if (!confirm("Are you sure you want to clear all storage? This will delete all invite codes.")) {
      return
    }

    try {
      // Clear localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.clear()
      }

      // Clear sessionStorage
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.clear()
      }

      // Clear cookies
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";")
        for (const cookie of cookies) {
          const [key] = cookie.trim().split("=")
          if (key) {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
          }
        }
      }

      toast({
        title: "Storage Cleared",
        description: "All storage has been cleared",
      })

      // Reload data
      loadAllData()
    } catch (error) {
      console.error("Error clearing storage:", error)
      toast({
        title: "Error",
        description: "Failed to clear storage",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="text-xl">
          <span className="font-normal">BuyHome</span> <span className="font-bold text-accent">ABC</span>{" "}
          <span className="font-normal">to</span> <span className="font-bold text-primary">XYZ</span>
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-6">Debug & Storage Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Invite Codes</CardTitle>
            <CardDescription>Manage invite codes across all storage types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">All Invite Codes ({allCodes.length})</h3>
                <Button variant="outline" size="sm" onClick={loadAllData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-md">
                {allCodes.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No invite codes found</div>
                ) : (
                  <div className="divide-y">
                    {allCodes.map((code, index) => (
                      <div key={index} className="p-2 text-sm">
                        <div className="font-mono font-bold">{code.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {code.email} - {code.status} - {code.realtorId}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">Add New Code</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label htmlFor="newCode" className="sr-only">
                      Code
                    </Label>
                    <Input
                      id="newCode"
                      placeholder="Enter code (e.g., ABC123)"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newEmail" className="sr-only">
                      Email
                    </Label>
                    <Input
                      id="newEmail"
                      placeholder="Email (optional)"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={addCode} className="w-full">
                  Add Code
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={syncStorage}>
              <Save className="h-4 w-4 mr-2" />
              Sync Storage
            </Button>
            <Button variant="destructive" onClick={clearAllStorage}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Storage
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Inspector</CardTitle>
            <CardDescription>View all data in browser storage</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="localStorage">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="localStorage" className="flex-1">
                  localStorage
                </TabsTrigger>
                <TabsTrigger value="sessionStorage" className="flex-1">
                  sessionStorage
                </TabsTrigger>
                <TabsTrigger value="cookies" className="flex-1">
                  Cookies
                </TabsTrigger>
              </TabsList>

              <TabsContent value="localStorage" className="max-h-96 overflow-y-auto">
                {Object.keys(localStorageData).length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No localStorage data found</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(localStorageData).map(([key, value]) => (
                      <div key={key} className="border rounded-md p-2">
                        <div className="font-semibold text-sm">{key}</div>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sessionStorage" className="max-h-96 overflow-y-auto">
                {Object.keys(sessionStorageData).length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No sessionStorage data found</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(sessionStorageData).map(([key, value]) => (
                      <div key={key} className="border rounded-md p-2">
                        <div className="font-semibold text-sm">{key}</div>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cookies" className="max-h-96 overflow-y-auto">
                {Object.keys(cookieData).length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No cookie data found</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(cookieData).map(([key, value]) => (
                      <div key={key} className="border rounded-md p-2">
                        <div className="font-semibold text-sm">{key}</div>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={loadAllData} className="w-full" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh All Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
          <CardDescription>Steps to fix invite code issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Common Issues</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Invite codes not showing up in buyer signup page</li>
                <li>Invite codes created by realtors not being recognized</li>
                <li>Storage inconsistency between pages</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Fix Steps</h3>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li>
                  <strong>Sync Storage:</strong> Click the "Sync Storage" button to ensure all invite codes are saved
                  across all storage types.
                </li>
                <li>
                  <strong>Add Missing Code:</strong> If you know the specific invite code that's not working, add it
                  manually using the "Add Code" form.
                </li>
                <li>
                  <strong>Clear and Reset:</strong> As a last resort, clear all storage and then add the necessary codes
                  manually.
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h3 className="text-sm font-semibold text-yellow-800">Important Note</h3>
              <p className="text-xs text-yellow-700 mt-1">
                The system now includes hardcoded default codes (WELCOME1, BUYHOME2, LFG9FX5W, AWWEAXMA, FXN3N11Q) that
                should always be available. If you're still having issues, try using one of these codes or add your
                specific code manually.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
