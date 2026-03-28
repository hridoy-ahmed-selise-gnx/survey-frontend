"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateSurvey } from "@/features/surveys/api";

const createSurveySchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional(),
  defaultLanguage: z.enum(["en", "bn"]),
});

type CreateSurveyForm = z.infer<typeof createSurveySchema>;

export default function NewSurveyPage() {
  const router = useRouter();
  const createSurvey = useCreateSurvey();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSurveyForm>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: { defaultLanguage: "en" },
  });

  const onSubmit = (data: CreateSurveyForm) => {
    createSurvey.mutate(data, {
      onSuccess: (survey) => {
        toast.success("Survey created successfully");
        router.push(`/surveys/${survey.id}`);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to create survey");
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create New Survey</h1>
        <p className="text-muted-foreground">Set up the basics for your survey</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
          <CardDescription>
            You can add questions and configure logic after creating the survey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Survey Title</Label>
              <Input
                id="title"
                placeholder="e.g., Customer Satisfaction Survey Q1 2026"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the survey purpose..."
                rows={4}
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select
                value={watch("defaultLanguage")}
                onValueChange={(val) => setValue("defaultLanguage", val as "en" | "bn")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bangla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSurvey.isPending}>
                {createSurvey.isPending ? "Creating..." : "Create Survey"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
