"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-muted-foreground">
          System, application, and data cleaning audit trail
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Viewer</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          View user activity logs, system events, and data cleaning history.
        </CardContent>
      </Card>
    </div>
  );
}
