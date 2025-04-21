import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PropertyDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/5">
          <Link href="/dashboard/property-search">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="aspect-video w-full rounded-lg" />
              ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4 mt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          <div>
            <div className="flex">
              <Skeleton className="h-10 w-[300px]" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-1" />
              <Skeleton className="h-4 w-full mt-1" />
              <Skeleton className="h-4 w-full mt-1" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-5 w-[100px] mb-1" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-[120px] mb-1" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex justify-between mb-3">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-3 mb-4">
                    <Skeleton className="h-16 w-24 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-[150px] mb-1" />
                      <Skeleton className="h-4 w-[100px] mb-1" />
                      <Skeleton className="h-3 w-[180px]" />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <ul className="mt-2 space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-[250px]" />
                    </li>
                  ))}
              </ul>
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
