import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function OrganizationPageSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Search */}
      <Skeleton className="h-10 w-full" />

      <div className="h-[600px] space-y-4">
        {/* CEO Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Divisions */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5" />
                  <div>
                    <Skeleton className="h-6 w-40 mb-1" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Department skeleton */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="ml-6 space-y-2">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <Card key={j}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}