"use client";

import {
  GripVertical,
  Settings2,
  Trash2,
  CheckSquare,
  List,
  ChevronDown,
  Grid3X3,
  SlidersHorizontal,
  ArrowUpDown,
  Type,
  Video,
  MousePointer,
  Image,
  Clock,
  Mic,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuestionDto, QuestionType } from "@/types/survey";

const questionTypeConfig: Record<
  QuestionType,
  { label: string; icon: React.ElementType; color: string }
> = {
  McqSingle: { label: "Single Choice", icon: CheckSquare, color: "bg-blue-100 text-blue-700" },
  McqMulti: { label: "Multiple Choice", icon: List, color: "bg-blue-100 text-blue-700" },
  Dropdown: { label: "Dropdown", icon: ChevronDown, color: "bg-blue-100 text-blue-700" },
  Matrix: { label: "Matrix / Grid", icon: Grid3X3, color: "bg-purple-100 text-purple-700" },
  LikertScale: { label: "Likert Scale", icon: SlidersHorizontal, color: "bg-purple-100 text-purple-700" },
  Slider: { label: "Slider", icon: SlidersHorizontal, color: "bg-purple-100 text-purple-700" },
  RankingSimple: { label: "Ranking", icon: ArrowUpDown, color: "bg-orange-100 text-orange-700" },
  RankingDragDrop: { label: "Drag & Drop Ranking", icon: ArrowUpDown, color: "bg-orange-100 text-orange-700" },
  TextShort: { label: "Short Text", icon: Type, color: "bg-green-100 text-green-700" },
  TextLong: { label: "Long Text", icon: Type, color: "bg-green-100 text-green-700" },
  TextComment: { label: "Comment Box", icon: Type, color: "bg-green-100 text-green-700" },
  Video: { label: "Video", icon: Video, color: "bg-red-100 text-red-700" },
  Hotspot: { label: "Hotspot / Click Map", icon: MousePointer, color: "bg-red-100 text-red-700" },
  ImageOption: { label: "Image Options", icon: Image, color: "bg-red-100 text-red-700" },
  ReactionTime: { label: "Reaction Time", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  FillBlanks: { label: "Fill in Blanks", icon: Type, color: "bg-yellow-100 text-yellow-700" },
  Audio: { label: "Audio Response", icon: Mic, color: "bg-yellow-100 text-yellow-700" },
  Nps: { label: "NPS", icon: Star, color: "bg-pink-100 text-pink-700" },
  ConstantSum: { label: "Constant Sum", icon: SlidersHorizontal, color: "bg-pink-100 text-pink-700" },
};

interface QuestionCardProps {
  readonly question: QuestionDto;
  readonly index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const config = questionTypeConfig[question.type];
  const Icon = config.icon;

  return (
    <Card className="group relative">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <button className="cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {index}
        </span>

        <Badge variant="secondary" className={config.color}>
          <Icon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>

        {question.isRequired && (
          <Badge variant="destructive" className="text-xs">
            Required
          </Badge>
        )}

        <div className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-sm">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pl-16">
        <p className="font-medium">{question.title}</p>
        {question.description && (
          <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
        )}

        {question.options.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {question.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-2 rounded border px-3 py-1.5 text-sm"
              >
                {option.mediaUrl && (
                  <img
                    src={option.mediaUrl}
                    alt=""
                    className="h-6 w-6 rounded object-cover"
                  />
                )}
                <span>{option.label}</span>
                {option.isOther && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Other
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
