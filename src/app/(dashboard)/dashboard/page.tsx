"use client";

import { FileText, Users, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSurveys } from "@/features/surveys/api";

const stats = [
  { name: "Total Surveys", icon: FileText, value: "--", color: "text-blue-600" },
  { name: "Active Responses", icon: TrendingUp, value: "--", color: "text-green-600" },
  { name: "Total Participants", icon: Users, value: "--", color: "text-purple-600" },
  { name: "Completion Rate", icon: BarChart3, value: "--", color: "text-orange-600" },
];

export default function DashboardPage() {
  const { data: surveysData } = useSurveys({ limit: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your survey platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Surveys</CardTitle>
        </CardHeader>
        <CardContent>
          {surveysData?.data?.length ? (
            <div className="space-y-3">
              {surveysData.data.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{survey.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {survey.uniqueCode} - {survey.status}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {survey.responseCount} responses
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No surveys yet. Create your first survey to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
