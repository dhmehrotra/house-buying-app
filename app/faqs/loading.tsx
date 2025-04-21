import { Skeleton } from "@/components/ui/skeleton"

export default function FAQsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <header className="border-b">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container py-12">
        <Skeleton className="h-10 w-72 mx-auto mb-12" />

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Section Skeletons */}
          {[1, 2, 3, 4].map((section) => (
            <section key={section}>
              <Skeleton className="h-8 w-48 mb-6" />

              <div className="space-y-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-50 p-6 rounded-lg">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
