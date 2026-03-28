"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateQuestion } from "@/features/surveys/api";
import type { QuestionDto, QuestionType } from "@/types/survey";

const needsOptions = new Set<QuestionType>([
  "McqSingle", "McqMulti", "Dropdown", "Matrix",
  "LikertScale", "RankingSimple", "RankingDragDrop",
  "ImageOption", "ConstantSum",
]);

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isRequired: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditOption {
  readonly id?: string;
  readonly label: string;
}

interface Props {
  readonly surveyId: string;
  readonly question: QuestionDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function EditQuestionDialog({ surveyId, question, open, onOpenChange }: Props) {
  const updateQuestion = useUpdateQuestion();
  const showOptions = needsOptions.has(question.type);

  const [options, setOptions] = useState<readonly EditOption[]>(() =>
    question.options.map((o) => ({ id: o.id, label: o.label }))
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: question.title,
      description: question.description ?? "",
      isRequired: question.isRequired,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: question.title,
        description: question.description ?? "",
        isRequired: question.isRequired,
      });
      setOptions(question.options.map((o) => ({ id: o.id, label: o.label })));
    }
  }, [open, question, reset]);

  const addOption = () =>
    setOptions((prev) => [...prev, { label: `Option ${prev.length + 1}` }]);

  const removeOption = (index: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== index));

  const updateOptionLabel = (index: number, label: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, label } : o)));

  const onSubmit = (data: FormValues) => {
    updateQuestion.mutate(
      {
        surveyId,
        questionId: question.id,
        title: data.title,
        description: data.description,
        isRequired: data.isRequired,
        options: showOptions
          ? options.map((opt, i) => ({
              id: opt.id,
              label: opt.label,
              sortOrder: i,
              isOther: false,
            }))
          : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Question updated");
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to update question"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>Update question details and options.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eq-title">Question Title</Label>
            <Input
              id="eq-title"
              placeholder="Enter your question..."
              {...register("title")}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eq-desc">Description (optional)</Label>
            <Textarea
              id="eq-desc"
              placeholder="Additional context or instructions..."
              rows={2}
              {...register("description")}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="eq-required"
              checked={watch("isRequired")}
              onCheckedChange={(val) => setValue("isRequired", val)}
            />
            <Label htmlFor="eq-required">Required</Label>
          </div>

          {showOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id ?? i} className="flex items-center gap-2">
                    <Input
                      value={opt.label}
                      onChange={(e) => updateOptionLabel(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeOption(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="mr-1 h-3 w-3" />
                Add Option
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateQuestion.isPending}>
              {updateQuestion.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
