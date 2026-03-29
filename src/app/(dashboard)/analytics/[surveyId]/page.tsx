"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSurveys } from "@/features/surveys/api";
import { useSurveyAnalytics } from "@/features/dashboard/api";

const PIE_COLORS = ["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#dc2626", "#ca8a04"];

function formatDuration(ms: number | null): string {
  if (ms === null) return "--";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function AnalyticsSurveyPage({
  params,
}: {
  readonly params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = use(params);
  const router = useRouter();

  const { data: surveysData } = useSurveys({ limit: 100 });
  const { data: analyticsData, isLoading } = useSurveyAnalytics(surveyId);
  const analytics = analyticsData?.data;

  const handleSurveyChange = (newSurveyId: string | null) => {
    if (newSurveyId) {
      router.push(`/analytics/${newSurveyId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">
            Real-time dashboards, cross-tabulation, and data visualization
          </p>
        </div>
        <Select value={surveyId} onValueChange={handleSurveyChange}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select a survey..." />
          </SelectTrigger>
          <SelectContent>
            {surveysData?.data?.map((survey) => (
              <SelectItem key={survey.id} value={survey.id}>
                {survey.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">{analytics.title}</h2>
            <Badge variant={analytics.status === "Published" ? "default" : "secondary"}>
              {analytics.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Responses
                </CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.totalResponses}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.completedResponses}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Completion Time
                </CardTitle>
                <Clock className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatDuration(analytics.averageTimeMs)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Responses Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.responsesByDate.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[...analytics.responsesByDate]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value: string) =>
                          new Date(value).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(String(value)).toLocaleDateString()
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Responses"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">
                    No response data yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.responsesBySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[...analytics.responsesBySource]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="source"
                        label={({ name, value }) =>
                          `${name}: ${value}`
                        }
                      >
                        {analytics.responsesBySource.map((_, index) => (
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">
                    No response data yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {analytics.questionAnalytics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Question Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {analytics.questionAnalytics.map((q, index) => (
                  <div key={q.questionId} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {index + 1}
                      </span>
                      <p className="font-medium">{q.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {q.type}
                      </Badge>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {q.totalAnswers} answer{q.totalAnswers !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {q.optionDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={Math.max(120, q.optionDistribution.length * 40)}>
                        <BarChart
                          data={[...q.optionDistribution]}
                          layout="vertical"
                          margin={{ left: 120 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={110}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Open-ended question - {q.totalAnswers} response{q.totalAnswers !== 1 ? "s" : ""}
                        {q.averageTimeMs !== null && ` | Avg. time: ${formatDuration(q.averageTimeMs)}`}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analytics.abandonedResponses > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>Drop-off</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {analytics.abandonedResponses} respondent{analytics.abandonedResponses !== 1 ? "s" : ""}{" "}
                  started but did not complete the survey (
                  {analytics.totalResponses > 0
                    ? Math.round(
                        (analytics.abandonedResponses / analytics.totalResponses) * 100
                      )
                    : 0}
                  % abandonment rate).
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load analytics data.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
