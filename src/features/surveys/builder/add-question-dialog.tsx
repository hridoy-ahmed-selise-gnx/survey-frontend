"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateQuestion } from "@/features/surveys/api";
import type { QuestionType } from "@/types/survey";

const questionTypeGroups = [
  {
    label: "Closed-Ended (MCQ)",
    types: [
      { value: "McqSingle", label: "Single Select" },
      { value: "McqMulti", label: "Multi Select" },
      { value: "Dropdown", label: "Dropdown" },
    ],
  },
  {
    label: "Matrix & Scales",
    types: [
      { value: "Matrix", label: "Matrix / Grid" },
      { value: "LikertScale", label: "Likert Scale" },
      { value: "Slider", label: "Slider" },
    ],
  },
  {
    label: "Ranking",
    types: [
      { value: "RankingSimple", label: "Simple Ranking" },
      { value: "RankingDragDrop", label: "Drag & Drop" },
    ],
  },
  {
    label: "Open-Ended Text",
    types: [
      { value: "TextShort", label: "Short Text" },
      { value: "TextLong", label: "Long Text" },
      { value: "TextComment", label: "Comment Box" },
    ],
  },
  {
    label: "Media & Visual",
    types: [
      { value: "Video", label: "Video" },
      { value: "Hotspot", label: "Hotspot / Click Map" },
      { value: "ImageOption", label: "Image Options" },
    ],
  },
  {
    label: "Behavioral",
    types: [
      { value: "ReactionTime", label: "Reaction Time" },
      { value: "FillBlanks", label: "Fill in Blanks" },
      { value: "Audio", label: "Audio Response" },
    ],
  },
  {
    label: "Templates",
    types: [
      { value: "Nps", label: "NPS (0-10)" },
      { value: "ConstantSum", label: "Constant Sum" },
    ],
  },
] as const;

const needsOptions = new Set<QuestionType>([
  "McqSingle", "McqMulti", "Dropdown", "Matrix",
  "LikertScale", "RankingSimple", "RankingDragDrop",
  "ImageOption", "ConstantSum",
]);

const schema = z.object({
  type: z.string().min(1, "Select a question type"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isRequired: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  readonly surveyId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly nextSortOrder: number;
}

export function AddQuestionDialog({ surveyId, open, onOpenChange, nextSortOrder }: Props) {
  const createQuestion = useCreateQuestion();
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "", title: "", description: "", isRequired: false },
  });

  const selectedType = watch("type") as QuestionType;
  const showOptions = needsOptions.has(selectedType);

  const addOption = () => setOptions((prev) => [...prev, `Option ${prev.length + 1}`]);
  const removeOption = (index: number) => setOptions((prev) => prev.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));

  const onSubmit = (data: FormValues) => {
    createQuestion.mutate(
      {
        surveyId,
        type: data.type as QuestionType,
        title: data.title,
        description: data.description,
        isRequired: data.isRequired,
        sortOrder: nextSortOrder,
        options: showOptions
          ? options.map((label, i) => ({
              label,
              sortOrder: i,
              isOther: false,
            }))
          : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Question added");
          reset();
          setOptions(["Option 1", "Option 2"]);
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to add question"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>Choose a question type and configure it.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={watch("type")}
              onValueChange={(val) => setValue("type", val ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {questionTypeGroups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.types.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-title">Question Title</Label>
            <Input id="q-title" placeholder="Enter your question..." {...register("title")} />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-desc">Description (optional)</Label>
            <Textarea id="q-desc" placeholder="Additional context..." rows={2} {...register("description")} />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="required"
              checked={watch("isRequired")}
              onCheckedChange={(val) => setValue("isRequired", val)}
            />
            <Label htmlFor="required">Required</Label>
          </div>

          {showOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
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
            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? "Adding..." : "Add Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
