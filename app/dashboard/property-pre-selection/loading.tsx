import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PropertySelectionLoading() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Main Content */}
        <div className="w-full md:w-2/3">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <Tabs defaultValue="saved">
            <TabsList className="mb-4 w-full grid grid-cols-3 md:grid-cols-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <TabsTrigger key={i} value={`tab-${i}`} disabled>
                    <Skeleton className="h-4 w-16" />
                  </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="saved">
              <div className="mb-4 flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>

              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="mb-4">
                    <div className="flex flex-col md:flex-row">
                      <Skeleton className="h-48 md:w-1/3" />
                      <div className="flex-1 p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-6 w-1/4 mb-2" />
                        <div className="flex gap-4 mt-1">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full md:w-1/3">
          {/* Educational Resources */}
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-2" />
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-3" />
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-8 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>

          {/* Message Your Realtor */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
