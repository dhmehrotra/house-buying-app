"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Filter, Search, XCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRealtor, type Buyer } from "@/contexts/realtor-context"

export default function ClientsPage() {
  const { realtor, buyers } = useRealtor()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(statusParam || "all")

  // Filter buyers by realtor
  const realtorBuyers = buyers.filter((buyer) => buyer.realtorId === realtor?.id)

  // Apply filters
  const filteredBuyers = realtorBuyers.filter((buyer) => {
    // Status filter
    if (statusFilter !== "all" && buyer.status !== statusFilter) {
      return false
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return buyer.name.toLowerCase().includes(searchLower) || buyer.email.toLowerCase().includes(searchLower)
    }

    return true
  })

  // Get counts by status
  const activeBuyersCount = realtorBuyers.filter((buyer) => buyer.status === "Active").length
  const completedBuyersCount = realtorBuyers.filter((buyer) => buyer.status === "Completed").length
  const inactiveBuyersCount = realtorBuyers.filter((buyer) => buyer.status === "Inactive").length

  // Helper function to render status badge
  const renderStatusBadge = (status: Buyer["status"]) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500">{status}</Badge>
      case "Completed":
        return <Badge className="bg-blue-500">{status}</Badge>
      case "Inactive":
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to render step indicator
  const renderStep = (step: number) => {
    const stepText = `Step ${step}/9`

    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${(step / 9) * 100}%` }}></div>
        </div>
        <span className="text-xs font-medium">{stepText}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Clients</h1>
        <p className="text-muted-foreground">Manage and track your clients' home buying journey.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className={`${statusFilter === "Active" ? "border-green-500" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeBuyersCount}</div>
            <Button
              variant="ghost"
              className="mt-2 h-8 text-sm p-0 text-green-600"
              onClick={() => setStatusFilter("Active")}
            >
              <Filter className="mr-1 h-3 w-3" />
              Filter Active
            </Button>
          </CardContent>
        </Card>

        <Card className={`${statusFilter === "Completed" ? "border-blue-500" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedBuyersCount}</div>
            <Button
              variant="ghost"
              className="mt-2 h-8 text-sm p-0 text-blue-600"
              onClick={() => setStatusFilter("Completed")}
            >
              <Filter className="mr-1 h-3 w-3" />
              Filter Completed
            </Button>
          </CardContent>
        </Card>

        <Card className={`${statusFilter === "Inactive" ? "border-gray-500" : ""}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inactiveBuyersCount}</div>
            <Button
              variant="ghost"
              className="mt-2 h-8 text-sm p-0 text-gray-600"
              onClick={() => setStatusFilter("Inactive")}
            >
              <Filter className="mr-1 h-3 w-3" />
              Filter Inactive
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>View and manage all your clients in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                  className="h-10 w-10"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Clear filters</span>
                </Button>
              )}
            </div>

            {filteredBuyers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuyers.map((buyer) => (
                      <TableRow key={buyer.id}>
                        <TableCell className="font-medium">{buyer.name}</TableCell>
                        <TableCell>{buyer.email}</TableCell>
                        <TableCell>{renderStep(buyer.currentStep)}</TableCell>
                        <TableCell>{renderStatusBadge(buyer.status)}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/realtor/clients/${buyer.id}`}>
                              View <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                {searchTerm || statusFilter !== "all" ? (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No clients found</h3>
                    <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No clients yet</h3>
                    <p className="text-muted-foreground mt-1">Invite new buyers to get started</p>
                    <Button className="mt-4 bg-accent hover:bg-accent/90" asChild>
                      <Link href="/realtor/new-buyer">Invite New Buyer</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
