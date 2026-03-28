"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  GripVertical,
  Settings2,
  Eye,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurvey, usePublishSurvey } from "@/features/surveys/api";
import { AddQuestionDialog } from "@/features/surveys/builder/add-question-dialog";
import { QuestionCard } from "@/features/surveys/builder/question-card";
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
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);

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
      onSuccess: () => toast.success("Survey published successfully"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to publish"),
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
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          {survey.status === "Draft" && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishSurvey.isPending || survey.questions.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="builder">
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
              <div className="space-y-3">
                {[...survey.questions]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index + 1}
                    />
                  ))}
              </div>
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
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Response analytics and data management.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
