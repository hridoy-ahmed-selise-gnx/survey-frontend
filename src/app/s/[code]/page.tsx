"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { usePublicSurvey } from "@/features/surveys/public/api";
import { PublicSurveyForm } from "@/features/surveys/public/public-survey-form";

export default function PublicSurveyPage({
  params,
}: {
  readonly params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { data, isLoading, isError } = usePublicSurvey(code);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data?.success || !data.data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Survey Not Available</h2>
            <p className="mt-2 text-muted-foreground">
              This survey may have been closed or does not exist. Please check
              the link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const survey = data.data;

  return (
    <div className="min-h-screen bg-background">
      {survey.customCss && <style dangerouslySetInnerHTML={{ __html: survey.customCss }} />}
      <div className="p-6 pb-16">
        <PublicSurveyForm survey={survey} />
      </div>
    </div>
  );
}
