"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveys } from "@/features/surveys/api";

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: surveysData, isLoading } = useSurveys({ limit: 100 });

  useEffect(() => {
    const firstSurvey = surveysData?.data?.[0];
    if (firstSurvey) {
      router.replace(`/analytics/${firstSurvey.id}`);
    }
  }, [surveysData, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">
            Real-time dashboards, cross-tabulation, and data visualization
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!surveysData?.data?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">
            Real-time dashboards, cross-tabulation, and data visualization
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No surveys found. Create a survey to view analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
