export type SurveyStatus = "Draft" | "Published" | "Closed" | "Archived";

export type QuestionType =
  | "McqSingle"
  | "McqMulti"
  | "Dropdown"
  | "Matrix"
  | "LikertScale"
  | "Slider"
  | "RankingSimple"
  | "RankingDragDrop"
  | "TextShort"
  | "TextLong"
  | "TextComment"
  | "Video"
  | "Hotspot"
  | "ImageOption"
  | "ReactionTime"
  | "FillBlanks"
  | "Audio"
  | "Nps"
  | "ConstantSum";

export interface SurveyDto {
  readonly id: string;
  readonly uniqueCode: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: SurveyStatus;
  readonly defaultLanguage: string;
  readonly customCss: string | null;
  readonly customDomain: string | null;
  readonly publishedAt: string | null;
  readonly closedAt: string | null;
  readonly questionCount: number;
  readonly responseCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SurveyDetailDto extends Omit<SurveyDto, "questionCount" | "responseCount"> {
  readonly sections: readonly SectionDto[];
  readonly questions: readonly QuestionDto[];
  readonly responseCount: number;
}

export interface SectionDto {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly sortOrder: number;
  readonly randomize: boolean;
}

export interface QuestionDto {
  readonly id: string;
  readonly sectionId: string | null;
  readonly type: QuestionType;
  readonly title: string;
  readonly description: string | null;
  readonly isRequired: boolean;
  readonly sortOrder: number;
  readonly config: Record<string, unknown> | null;
  readonly options: readonly AnswerOptionDto[];
}

export interface AnswerOptionDto {
  readonly id: string;
  readonly label: string;
  readonly value: string | null;
  readonly sortOrder: number;
  readonly mediaUrl: string | null;
  readonly isOther: boolean;
  readonly config: Record<string, unknown> | null;
}

export interface CreateSurveyRequest {
  readonly title: string;
  readonly description?: string;
  readonly defaultLanguage: string;
}

export interface UpdateSurveyRequest {
  readonly title: string;
  readonly description?: string;
  readonly customCss?: string;
  readonly customDomain?: string;
}

export interface CreateQuestionRequest {
  readonly surveyId: string;
  readonly sectionId?: string;
  readonly type: QuestionType;
  readonly title: string;
  readonly description?: string;
  readonly isRequired: boolean;
  readonly sortOrder: number;
  readonly config?: Record<string, unknown>;
  readonly options?: readonly CreateAnswerOptionRequest[];
}

export interface UpdateQuestionRequest {
  readonly surveyId: string;
  readonly questionId: string;
  readonly title: string;
  readonly description?: string;
  readonly isRequired: boolean;
  readonly config?: Record<string, unknown>;
  readonly options?: readonly UpdateAnswerOptionRequest[];
}

export interface UpdateAnswerOptionRequest {
  readonly id?: string;
  readonly label: string;
  readonly value?: string;
  readonly sortOrder: number;
  readonly mediaUrl?: string;
  readonly isOther: boolean;
  readonly config?: Record<string, unknown>;
}

export interface CreateAnswerOptionRequest {
  readonly label: string;
  readonly value?: string;
  readonly sortOrder: number;
  readonly mediaUrl?: string;
  readonly isOther: boolean;
  readonly config?: Record<string, unknown>;
}
