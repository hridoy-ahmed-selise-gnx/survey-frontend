"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SurveyDetailDto, QuestionDto } from "@/types/survey";

interface SurveyPreviewDialogProps {
  readonly survey: SurveyDetailDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function QuestionPreview({
  question,
  index,
}: {
  readonly question: QuestionDto;
  readonly index: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {index}
        </span>
        <div className="flex-1">
          <p className="font-medium">
            {question.title}
            {question.isRequired && <span className="ml-1 text-destructive">*</span>}
          </p>
          {question.description && (
            <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
          )}
        </div>
      </div>

      <div className="ml-8">{renderQuestionInput(question)}</div>
    </div>
  );
}

function renderQuestionInput(question: QuestionDto) {
  switch (question.type) {
    case "McqSingle":
      return (
        <RadioGroup disabled>
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`preview-${option.id}`} />
              <Label htmlFor={`preview-${option.id}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "McqMulti":
      return (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox id={`preview-${option.id}`} disabled />
              <Label htmlFor={`preview-${option.id}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );

    case "Dropdown":
      return (
        <select
          disabled
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Select an option...</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.value ?? option.label}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "TextShort":
      return <Input disabled placeholder="Short answer text" />;

    case "TextLong":
    case "TextComment":
      return <Textarea disabled placeholder="Long answer text" rows={3} />;

    case "Nps":
      return (
        <div className="flex gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              disabled
              className="flex h-10 w-10 items-center justify-center rounded border text-sm font-medium hover:bg-muted"
            >
              {i}
            </button>
          ))}
        </div>
      );

    case "Slider":
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={100}
            disabled
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
      );

    case "LikertScale":
      return (
        <div className="flex gap-2">
          {(question.options.length > 0
            ? question.options
            : [
                { id: "1", label: "Strongly Disagree" },
                { id: "2", label: "Disagree" },
                { id: "3", label: "Neutral" },
                { id: "4", label: "Agree" },
                { id: "5", label: "Strongly Agree" },
              ]
          ).map((option) => (
            <button
              key={option.id}
              disabled
              className="flex-1 rounded border px-2 py-2 text-center text-xs hover:bg-muted"
            >
              {option.label}
            </button>
          ))}
        </div>
      );

    case "RankingSimple":
    case "RankingDragDrop":
      return (
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <div
              key={option.id}
              className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{i + 1}.</span>
              {option.label}
            </div>
          ))}
        </div>
      );

    case "Matrix":
      return (
        <div className="overflow-x-auto">
          <p className="text-sm text-muted-foreground">
            Matrix question preview not available
          </p>
        </div>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          {question.type} question preview
        </p>
      );
  }
}

export function SurveyPreviewDialog({
  survey,
  open,
  onOpenChange,
}: SurveyPreviewDialogProps) {
  const sortedQuestions = [...survey.questions].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Preview</DialogTitle>
            <Badge variant="outline">
              {survey.defaultLanguage === "en" ? "English" : "Bangla"}
            </Badge>
          </div>
          <DialogDescription>
            This is how respondents will see your survey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{survey.title}</h2>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </div>

        <Separator />

        {sortedQuestions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No questions added yet.
          </p>
        ) : (
          <div className="space-y-6">
            {sortedQuestions.map((question, index) => (
              <QuestionPreview
                key={question.id}
                question={question}
                index={index + 1}
              />
            ))}
          </div>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button disabled className="w-full sm:w-auto">
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
