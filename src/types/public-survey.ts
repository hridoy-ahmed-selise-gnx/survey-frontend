export interface SurveyResponseDto {
  readonly id: string;
  readonly respondentId: string;
  readonly status: string;
  readonly languageUsed: string | null;
  readonly source: string;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly answers: readonly ResponseAnswerDto[];
}

export interface ResponseAnswerDto {
  readonly id: string;
  readonly questionId: string;
  readonly questionTitle: string;
  readonly questionType: string;
  readonly answerValue: unknown;
  readonly timeSpentMs: number | null;
  readonly answeredAt: string;
}

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
