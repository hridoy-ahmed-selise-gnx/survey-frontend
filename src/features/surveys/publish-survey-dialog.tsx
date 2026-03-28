"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PublishSurveyDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly surveyTitle: string;
  readonly questionCount: number;
  readonly onConfirm: () => void;
  readonly isPending: boolean;
}

export function PublishSurveyDialog({
  open,
  onOpenChange,
  surveyTitle,
  questionCount,
  onConfirm,
  isPending,
}: PublishSurveyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Survey</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to publish &quot;{surveyTitle}&quot; with{" "}
            {questionCount} question{questionCount !== 1 ? "s" : ""}. Once
            published, the survey will be available for respondents. You will not
            be able to edit questions after publishing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Publishing..." : "Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
