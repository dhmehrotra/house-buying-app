"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAllCodes, addCode, generateCode, type InviteCode } from "@/lib/invite-code-fix"

export default function FixPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [newCode, setNewCode] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadCodes()
  }, [])

  const loadCodes = () => {
    const allCodes = getAllCodes()
    setCodes(allCodes)
    setMessage(`Loaded ${allCodes.length} invite codes`)
  }

  const handleAddCode = () => {
    if (!newCode || !newEmail) {
      setMessage("Please enter both code and email")
      return
    }

    addCode(newCode, newEmail)
    setNewCode("")
    setNewEmail("")
    loadCodes()
    setMessage(`Added code: ${newCode}`)
  }

  const handleGenerateCode = () => {
    const code = generateCode()
    setNewCode(code)
    setMessage(`Generated code: ${code}`)
  }

  const handleAddFXN3N11Q = () => {
    addCode("FXN3N11Q", "buyer35@gmail.com")
    loadCodes()
    setMessage("Added special code FXN3N11Q")
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Emergency Invite Code Fix</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Invite Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="code">Invite Code</Label>
                <Input
                  id="code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Enter code"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerateCode} className="w-full">
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <Button onClick={handleAddCode} className="w-full">
              Add Code
            </Button>

            <div className="pt-2 border-t">
              <Button variant="outline" onClick={handleAddFXN3N11Q} className="w-full">
                Force Add FXN3N11Q
              </Button>
            </div>

            {message && <div className="p-2 bg-blue-50 text-blue-800 rounded text-sm">{message}</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Invite Codes ({codes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center text-gray-500">No codes found</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {codes.map((code, index) => (
                <div key={index} className="p-2 border rounded flex justify-between">
                  <div>
                    <div className="font-mono font-bold">{code.code}</div>
                    <div className="text-sm text-gray-500">{code.email}</div>
                  </div>
                  <div className="text-sm">
                    {code.status === "pending" ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-red-600">Used</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" onClick={loadCodes} className="w-full mt-4">
            Refresh Codes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
