import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function TableSkeleton() {
  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-[200px] animate-pulse rounded bg-muted" />
          <div className="h-8 w-[100px] animate-pulse rounded bg-muted" />
        </div>
        <div className="border rounded-lg">
          <div className="border-b">
            <div className="grid grid-cols-4 gap-4 p-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          </div>
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 animate-pulse rounded bg-muted"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-8 w-full animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <TableSkeleton />
    </div>
  )
}