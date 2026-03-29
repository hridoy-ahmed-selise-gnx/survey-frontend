"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { useSubmitPublicResponse } from "./api";
import type { SurveyDetailDto, QuestionDto } from "@/types/survey";

interface PublicSurveyFormProps {
  readonly survey: SurveyDetailDto;
}

function getRespondentId(): string {
  const key = "survey_respondent_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}

export function PublicSurveyForm({ survey }: PublicSurveyFormProps) {
  const [answers, setAnswers] = useState<ReadonlyMap<string, unknown>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ReadonlySet<string>>(new Set());
  const submitResponse = useSubmitPublicResponse(survey.id);

  const sortedQuestions = [...survey.questions].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const updateAnswer = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, value);
      return next;
    });
    setValidationErrors((prev) => {
      if (!prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  }, []);

  const handleSubmit = () => {
    const missingRequired = sortedQuestions
      .filter((q) => q.isRequired)
      .filter((q) => {
        const val = answers.get(q.id);
        if (val === undefined || val === null || val === "") return true;
        if (Array.isArray(val) && val.length === 0) return true;
        return false;
      })
      .map((q) => q.id);

    if (missingRequired.length > 0) {
      setValidationErrors(new Set(missingRequired));
      toast.error("Please answer all required questions");
      return;
    }

    const respondentId = getRespondentId();
    const formattedAnswers = sortedQuestions
      .filter((q) => answers.has(q.id))
      .map((q) => ({
        questionId: q.id,
        answerValue: answers.get(q.id),
      }));

    submitResponse.mutate(
      {
        surveyId: survey.id,
        respondentId,
        languageUsed: survey.defaultLanguage,
        source: "Link",
        answers: formattedAnswers,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to submit"),
      }
    );
  };

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-semibold">Thank you!</h2>
          <p className="mt-2 text-muted-foreground">
            Your response has been recorded successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{survey.title}</h1>
        {survey.description && (
          <p className="text-muted-foreground">{survey.description}</p>
        )}
      </div>

      <Separator />

      <div className="space-y-6">
        {sortedQuestions.map((question, index) => (
          <Card
            key={question.id}
            className={
              validationErrors.has(question.id)
                ? "border-destructive"
                : undefined
            }
          >
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">
                    {question.title}
                    {question.isRequired && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </p>
                  {question.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {question.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="ml-8">
                <QuestionInput
                  question={question}
                  value={answers.get(question.id)}
                  onChange={(val) => updateAnswer(question.id, val)}
                />
              </div>

              {validationErrors.has(question.id) && (
                <p className="ml-8 text-sm text-destructive">
                  This question is required
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={submitResponse.isPending}
      >
        {submitResponse.isPending ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  readonly question: QuestionDto;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
}) {
  switch (question.type) {
    case "McqSingle":
      return (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={onChange}
        >
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`q-${option.id}`} />
              <Label htmlFor={`q-${option.id}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "McqMulti":
      return (
        <div className="space-y-2">
          {question.options.map((option) => {
            const selected = (value as readonly string[]) ?? [];
            const isChecked = selected.includes(option.id);
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`q-${option.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...selected, option.id]
                      : selected.filter((id) => id !== option.id);
                    onChange(next);
                  }}
                />
                <Label htmlFor={`q-${option.id}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case "Dropdown":
      return (
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">Select an option...</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "TextShort":
      return (
        <Input
          placeholder="Your answer"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "TextLong":
    case "TextComment":
      return (
        <Textarea
          placeholder="Your answer"
          rows={3}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "Nps":
      return (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={`flex h-10 w-10 items-center justify-center rounded border text-sm font-medium transition-colors ${
                value === i
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      );

    case "Slider": {
      const min = (question.config?.min as number) ?? 0;
      const max = (question.config?.max as number) ?? 100;
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            value={(value as number) ?? min}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min}</span>
            <span className="font-medium text-foreground">
              {(value as number) ?? min}
            </span>
            <span>{max}</span>
          </div>
        </div>
      );
    }

    case "LikertScale": {
      const options =
        question.options.length > 0
          ? question.options
          : [
              { id: "1", label: "Strongly Disagree" },
              { id: "2", label: "Disagree" },
              { id: "3", label: "Neutral" },
              { id: "4", label: "Agree" },
              { id: "5", label: "Strongly Agree" },
            ];
      return (
        <div className="flex gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex-1 rounded border px-2 py-2 text-center text-xs transition-colors ${
                value === option.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    }

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
          <p className="text-xs text-muted-foreground">
            Drag-and-drop ranking is not yet supported in the public form.
          </p>
        </div>
      );

    case "ConstantSum": {
      const sums = (value as Record<string, number>) ?? {};
      return (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center gap-3">
              <Label className="w-32 shrink-0 font-normal">{option.label}</Label>
              <Input
                type="number"
                min={0}
                className="w-24"
                value={sums[option.id] ?? ""}
                onChange={(e) => {
                  const next = { ...sums, [option.id]: Number(e.target.value) };
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    default:
      return (
        <Input
          placeholder="Your answer"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
