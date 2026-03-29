"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { toast } from "sonner";
import {
  Plus,
  Eye,
  Send,
  Trash2,
  XCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSurvey,
  usePublishSurvey,
  useCloseSurvey,
  useDeleteSurvey,
} from "@/features/surveys/api";
import { AddQuestionDialog } from "@/features/surveys/builder/add-question-dialog";
import { SortableQuestionList } from "@/features/surveys/builder/sortable-question-list";
import { SurveyPreviewDialog } from "@/features/surveys/preview/survey-preview-dialog";
import { DeleteSurveyDialog } from "@/features/surveys/delete-survey-dialog";
import { PublishSurveyDialog } from "@/features/surveys/publish-survey-dialog";
import { ShareSurveyDialog } from "@/features/surveys/share-survey-dialog";
import { ResponseList } from "@/features/surveys/responses/response-list";
import type { SurveyStatus } from "@/types/survey";

const statusVariant: Record<SurveyStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "secondary",
  Published: "default",
  Closed: "destructive",
  Archived: "outline",
};

export default function SurveyDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useSurvey(id);
  const publishSurvey = usePublishSurvey();
  const closeSurvey = useCloseSurvey();
  const deleteSurvey = useDeleteSurvey();

  const tabValues = ["builder", "logic", "settings", "responses"] as const;
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabValues).withDefault("builder")
  );

  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const survey = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!survey) {
    return <p className="text-muted-foreground">Survey not found</p>;
  }

  const handlePublish = () => {
    publishSurvey.mutate(id, {
      onSuccess: () => {
        toast.success("Survey published successfully");
        setPublishDialogOpen(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to publish"),
    });
  };

  const handleClose = () => {
    closeSurvey.mutate(id, {
      onSuccess: () => toast.success("Survey closed"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to close survey"),
    });
  };

  const handleDelete = () => {
    deleteSurvey.mutate(id, {
      onSuccess: () => {
        toast.success("Survey deleted");
        router.push("/surveys");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete survey"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{survey.title}</h1>
            <Badge variant={statusVariant[survey.status]}>{survey.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {survey.uniqueCode} | {survey.defaultLanguage === "en" ? "English" : "Bangla"}
          </p>
          {survey.description && (
            <p className="mt-2 text-muted-foreground">{survey.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {survey.status === "Published" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
          {survey.status === "Draft" && (
            <Button
              size="sm"
              onClick={() => setPublishDialogOpen(true)}
              disabled={publishSurvey.isPending || survey.questions.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
          {survey.status === "Published" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={closeSurvey.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Close
            </Button>
          )}
          {survey.status !== "Published" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteSurvey.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tabValues[number])}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="logic">Logic</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="responses">Responses ({survey.responseCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-4 space-y-4">
          {survey.questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <p className="mb-4 text-muted-foreground">
                  No questions yet. Add your first question to get started.
                </p>
                <Button onClick={() => setAddQuestionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <SortableQuestionList
                surveyId={id}
                questions={survey.questions}
                isDraft={survey.status === "Draft"}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setAddQuestionOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </>
          )}

          <AddQuestionDialog
            surveyId={id}
            open={addQuestionOpen}
            onOpenChange={setAddQuestionOpen}
            nextSortOrder={survey.questions.length}
          />
        </TabsContent>

        <TabsContent value="logic" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Skip logic and branching rules will be configured here.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Survey settings, branding, and custom domain configuration.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <ResponseList surveyId={id} />
        </TabsContent>
      </Tabs>

      <SurveyPreviewDialog
        survey={survey}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <PublishSurveyDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        surveyTitle={survey.title}
        questionCount={survey.questions.length}
        onConfirm={handlePublish}
        isPending={publishSurvey.isPending}
      />

      <DeleteSurveyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        surveyTitle={survey.title}
        onConfirm={handleDelete}
        isPending={deleteSurvey.isPending}
      />

      <ShareSurveyDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        uniqueCode={survey.uniqueCode}
        surveyTitle={survey.title}
      />
    </div>
  );
}
