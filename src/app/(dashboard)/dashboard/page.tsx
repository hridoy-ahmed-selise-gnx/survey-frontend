"use client";

import Link from "next/link";
import { FileText, Users, BarChart3, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/features/dashboard/api";
import type { SurveyStatus } from "@/types/survey";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "secondary",
  Published: "default",
  Closed: "destructive",
  Archived: "outline",
};

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
  const stats = data?.data;

  const statCards = [
    {
      name: "Total Surveys",
      icon: FileText,
      value: stats?.totalSurveys ?? 0,
      color: "text-blue-600",
    },
    {
      name: "Active Surveys",
      icon: Activity,
      value: stats?.activeSurveys ?? 0,
      color: "text-green-600",
    },
    {
      name: "Total Responses",
      icon: TrendingUp,
      value: stats?.totalResponses ?? 0,
      color: "text-purple-600",
    },
    {
      name: "Completion Rate",
      icon: BarChart3,
      value: stats ? `${stats.completionRate}%` : "0%",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your survey platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Survey Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : stats?.statusBreakdown?.length ? (
              <div className="space-y-3">
                {stats.statusBreakdown.map((item) => {
                  const total = stats.totalSurveys || 1;
                  const percentage = Math.round((item.count / total) * 100);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant[item.status] ?? "outline"}>
                            {item.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.count} survey{item.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Participants</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">{stats?.totalParticipants ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Unique respondents</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="font-medium">{stats?.completedResponses ?? 0}</p>
                    <p className="text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {(stats?.totalResponses ?? 0) - (stats?.completedResponses ?? 0)}
                    </p>
                    <p className="text-muted-foreground">In Progress / Abandoned</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats?.recentActivity?.length ? (
            <div className="space-y-3">
              {stats.recentActivity.map((survey) => (
                <Link
                  key={survey.surveyId}
                  href={`/surveys/${survey.surveyId}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{survey.surveyTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {survey.uniqueCode}
                      {" - "}
                      <Badge variant={statusVariant[survey.status] ?? "outline"} className="ml-1">
                        {survey.status}
                      </Badge>
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{survey.responseCount} responses</p>
                    <p>{survey.questionCount} questions</p>
                  </div>
                </Link>
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
