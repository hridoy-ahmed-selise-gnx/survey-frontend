"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateSurvey } from "@/features/surveys/api";
import type { SurveyDetailDto } from "@/types/survey";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  description: z.string().optional(),
  customCss: z.string().optional(),
  customDomain: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EditSurveyForm({ survey }: { readonly survey: SurveyDetailDto }) {
  const updateSurvey = useUpdateSurvey();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: survey.title,
      description: survey.description ?? "",
      customCss: survey.customCss ?? "",
      customDomain: survey.customDomain ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: survey.title,
      description: survey.description ?? "",
      customCss: survey.customCss ?? "",
      customDomain: survey.customDomain ?? "",
    });
  }, [survey, reset]);

  const onSubmit = (data: FormValues) => {
    updateSurvey.mutate(
      {
        id: survey.id,
        title: data.title,
        description: data.description || undefined,
        customCss: data.customCss || undefined,
        customDomain: data.customDomain || undefined,
      },
      {
        onSuccess: () => toast.success("Survey settings updated"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to update survey"),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Settings</CardTitle>
        <CardDescription>Update your survey's general information and branding.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="s-title">Title</Label>
            <Input
              id="s-title"
              placeholder="Survey Title"
              {...register("title")}
              disabled={survey.status !== "Draft"}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-desc">Description</Label>
            <Textarea
              id="s-desc"
              placeholder="Survey description..."
              rows={3}
              {...register("description")}
              disabled={survey.status !== "Draft"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-css">Custom CSS</Label>
            <Textarea
              id="s-css"
              className="font-mono text-sm"
              placeholder=".survey-container { background: #f0f0f0; }"
              rows={5}
              {...register("customCss")}
              disabled={survey.status !== "Draft"}
            />
            <p className="text-xs text-muted-foreground">Apply custom styles to your survey.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-domain">Custom Domain</Label>
            <Input
              id="s-domain"
              placeholder="survey.yourdomain.com"
              {...register("customDomain")}
              disabled={survey.status !== "Draft"}
            />
          </div>

          {survey.status === "Draft" ? (
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateSurvey.isPending}>
                {updateSurvey.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground pt-4">
              Basic settings can only be edited when the survey is in Draft status.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
