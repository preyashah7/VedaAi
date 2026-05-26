import { z } from 'zod';

export const questionTypeOptions = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Essay Questions',
] as const;

export const questionTypeKeyOptions = [
  'mcq',
  'short',
  'long',
  'diagram',
  'numerical',
  'essay',
] as const;

const todayStart = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const questionTypeSchema = z.object({
  type: z.enum(questionTypeOptions),
  count: z.number().int().min(1),
  marks: z.number().int().min(1),
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  subject: z.string().trim().min(1, 'Subject is required'),
  gradeLevel: z.string().trim().min(1, 'Grade/Class is required'),
  schoolName: z.string().trim().min(1, 'School name is required'),
  dueDate: z.coerce.date().refine((date) => date >= todayStart(), {
    message: 'Due date cannot be in the past',
  }),
  questionTypes: z.array(questionTypeSchema).min(1, 'Add at least one question type'),
  additionalInstructions: z.string().trim().optional().default(''),
  uploadedFileContent: z.string().trim().optional().default(''),
});

export const generatedQuestionSchema = z.object({
  number: z.number().int().min(1),
  text: z.string().min(1),
  options: z.array(z.string().min(1)).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().int().min(1),
  type: z.enum(['mcq', 'short', 'long', 'diagram', 'numerical', 'essay']),
});

export const generatedSectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(generatedQuestionSchema).min(1),
});

export const generatedAnswerKeySchema = z.object({
  questionNumber: z.string().min(1),
  answer: z.string().min(1),
});

export const generatedPaperSchema = z.object({
  schoolName: z.string().min(1),
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  timeAllowed: z.string().min(1),
  maxMarks: z.number().int().min(1),
  generalInstructions: z.string().min(1),
  sections: z.array(generatedSectionSchema).min(1),
  answerKey: z.array(generatedAnswerKeySchema).min(1),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type GeneratedPaperInput = z.infer<typeof generatedPaperSchema>;
export type GeneratedQuestionInput = z.infer<typeof generatedQuestionSchema>;
export type GeneratedSectionInput = z.infer<typeof generatedSectionSchema>;
export type QuestionTypeInput = z.infer<typeof questionTypeSchema>;
export type QuestionTypeLabel = (typeof questionTypeOptions)[number];
export type QuestionTypeKind = (typeof questionTypeKeyOptions)[number];
