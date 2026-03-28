"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">
          Real-time dashboards, cross-tabulation, and data visualization
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          Select a survey to view real-time response analytics, cross-tabulation,
          and visualization charts.
        </CardContent>
      </Card>
    </div>
  );
}
