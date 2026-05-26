import { Schema, model, type InferSchemaType } from 'mongoose';

const generatedQuestionSchema = new Schema(
  {
    number: { type: Number, required: true, min: 1 },
    text: { type: String, required: true },
    options: { type: [String], default: undefined },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    marks: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      enum: ['mcq', 'short', 'long', 'diagram', 'numerical', 'essay'],
      required: true,
    },
  },
  { _id: false }
);

const generatedSectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [generatedQuestionSchema], required: true },
  },
  { _id: false }
);

const generatedAnswerKeySchema = new Schema(
  {
    questionNumber: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const generatedPaperSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    generalInstructions: { type: String, required: true },
    sections: { type: [generatedSectionSchema], required: true },
    answerKey: { type: [generatedAnswerKeySchema], required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type GeneratedPaperDocument = InferSchemaType<typeof generatedPaperSchema> & {
  _id: unknown;
};

export const GeneratedPaperModel = model('GeneratedPaper', generatedPaperSchema);
