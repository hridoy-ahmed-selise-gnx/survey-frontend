"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import {
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveyResponses } from "@/features/surveys/api";
import type { SurveyResponseDto, ResponseAnswerDto } from "@/types/public-survey";

interface ResponseListProps {
  readonly surveyId: string;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Completed: "default",
  InProgress: "secondary",
  Abandoned: "destructive",
  Excluded: "outline",
};

function formatAnswerValue(answer: ResponseAnswerDto): string {
  const val = answer.answerValue;
  if (val === null || val === undefined) return "-";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return "-";
    return entries.map(([k, v]) => `${k}: ${v}`).join(", ");
  }
  return String(val);
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return "-";
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function ResponseRow({ response }: { readonly response: SurveyResponseDto }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs">
              {response.respondentId.slice(0, 8)}...
            </span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant[response.status] ?? "outline"}>
            {response.status}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">{response.source}</TableCell>
        <TableCell>{response.answers.length}</TableCell>
        <TableCell className="text-muted-foreground">
          {response.completedAt
            ? new Date(response.completedAt).toLocaleString()
            : "-"}
        </TableCell>
        <TableCell className="text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(response.startedAt, response.completedAt)}
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/20 p-0">
            <div className="space-y-2 p-4">
              {response.answers.map((answer) => (
                <div
                  key={answer.id}
                  className="rounded-md border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{answer.questionTitle}</p>
                      <p className="text-sm">{formatAnswerValue(answer)}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {answer.questionType}
                    </Badge>
                  </div>
                  {answer.timeSpentMs != null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Time spent:{" "}
                      {answer.timeSpentMs < 1000
                        ? `${answer.timeSpentMs}ms`
                        : `${(answer.timeSpentMs / 1000).toFixed(1)}s`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function ResponseList({ surveyId }: ResponseListProps) {
  const [page, setPage] = useQueryState("rp", parseAsInteger.withDefault(1));
  const { data, isLoading } = useSurveyResponses(surveyId, { page, limit: 20 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const responses = data?.data ?? [];
  const meta = data?.meta;

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No responses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your survey link to start collecting responses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {meta
          ? `${meta.total} response${meta.total !== 1 ? "s" : ""}`
          : `${responses.length} response${responses.length !== 1 ? "s" : ""}`}
      </p>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Respondent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Answers</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <ResponseRow key={response.id} response={response} />
            ))}
          </TableBody>
        </Table>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
