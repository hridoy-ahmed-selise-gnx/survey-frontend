export interface SubmitResponseRequest {
  readonly surveyId: string;
  readonly respondentId: string;
  readonly languageUsed: string;
  readonly source: string;
  readonly answers: readonly AnswerSubmission[];
}

export interface AnswerSubmission {
  readonly questionId: string;
  readonly answerValue: unknown;
  readonly timeSpentMs?: number;
}

export interface ResponseDto {
  readonly id: string;
  readonly surveyId: string;
  readonly respondentId: string;
  readonly status: string;
  readonly languageUsed: string | null;
  readonly completedAt: string | null;
}
