"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { useReorderQuestions } from "@/features/surveys/api";
import { QuestionCard } from "@/features/surveys/builder/question-card";
import type { QuestionDto } from "@/types/survey";

interface SortableQuestionItemProps {
  readonly surveyId: string;
  readonly question: QuestionDto;
  readonly index: number;
  readonly isDraft: boolean;
}

function SortableQuestionItem({ surveyId, question, index, isDraft }: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionCard
        surveyId={surveyId}
        question={question}
        index={index}
        isDraft={isDraft}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface SortableQuestionListProps {
  readonly surveyId: string;
  readonly questions: readonly QuestionDto[];
  readonly isDraft: boolean;
}

export function SortableQuestionList({ surveyId, questions, isDraft }: SortableQuestionListProps) {
  const reorderQuestions = useReorderQuestions();

  const [localOrder, setLocalOrder] = useState<readonly QuestionDto[] | null>(null);
  const sortedQuestions = localOrder ?? [...questions].sort((a, b) => a.sortOrder - b.sortOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        setLocalOrder(null);
        return;
      }

      const oldIndex = sortedQuestions.findIndex((q) => q.id === active.id);
      const newIndex = sortedQuestions.findIndex((q) => q.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        setLocalOrder(null);
        return;
      }

      const reordered = [...sortedQuestions];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      setLocalOrder(reordered);

      const orderPayload = reordered.map((q, i) => ({
        questionId: q.id,
        sortOrder: i,
      }));

      reorderQuestions.mutate(
        { surveyId, questions: orderPayload },
        {
          onSuccess: () => {
            setLocalOrder(null);
          },
          onError: (err) => {
            setLocalOrder(null);
            toast.error(err instanceof Error ? err.message : "Failed to reorder questions");
          },
        }
      );
    },
    [sortedQuestions, surveyId, reorderQuestions]
  );

  if (!isDraft) {
    return (
      <div className="space-y-3">
        {sortedQuestions.map((question, index) => (
          <QuestionCard
            key={question.id}
            surveyId={surveyId}
            question={question}
            index={index + 1}
            isDraft={false}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedQuestions.map((q) => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {sortedQuestions.map((question, index) => (
            <SortableQuestionItem
              key={question.id}
              surveyId={surveyId}
              question={question}
              index={index + 1}
              isDraft={isDraft}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
