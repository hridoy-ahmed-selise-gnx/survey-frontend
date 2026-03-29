"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Trash2, MoreHorizontal, Eye, BarChart3, Link2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSurveys, useDeleteSurvey } from "@/features/surveys/api";
import { DeleteSurveyDialog } from "@/features/surveys/delete-survey-dialog";
import type { SurveyStatus, SurveyDto } from "@/types/survey";

const statusVariant: Record<SurveyStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "secondary",
  Published: "default",
  Closed: "destructive",
  Archived: "outline",
};

export default function SurveysPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSurveys({ page, limit: 20, search });
  const deleteSurvey = useDeleteSurvey();

  const [deleteTarget, setDeleteTarget] = useState<SurveyDto | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSurvey.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Survey deleted");
        setDeleteTarget(null);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete survey"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Surveys</h1>
          <p className="text-muted-foreground">Manage and create surveys</p>
        </div>
        <Link href="/surveys/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length ? (
                  data.data.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell>
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="font-medium hover:underline"
                        >
                          {survey.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {survey.uniqueCode}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[survey.status]}>
                          {survey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{survey.questionCount}</TableCell>
                      <TableCell>{survey.responseCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/surveys/${survey.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/analytics?surveyId=${survey.id}`)}
                            >
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Analytics
                            </DropdownMenuItem>
                            {survey.status === "Published" && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  const url = `${window.location.origin}/s/${survey.uniqueCode.toLowerCase()}`;
                                  try {
                                    await navigator.clipboard.writeText(url);
                                    toast.success("Link copied to clipboard");
                                  } catch {
                                    toast.error("Failed to copy link");
                                  }
                                }}
                              >
                                <Link2 className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                            )}
                            {survey.status !== "Published" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(survey)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No surveys found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {deleteTarget && (
        <DeleteSurveyDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          surveyTitle={deleteTarget.title}
          onConfirm={handleDelete}
          isPending={deleteSurvey.isPending}
        />
      )}
    </div>
  );
}
