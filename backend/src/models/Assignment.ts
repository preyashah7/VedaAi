import { Schema, model, type InferSchemaType } from 'mongoose';

const questionTypeSchema = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: '', trim: true },
    gradeLevel: { type: String, default: '', trim: true },
    schoolName: { type: String, default: '', trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [questionTypeSchema], default: [] },
    additionalInstructions: { type: String, default: '', trim: true },
    uploadedFileContent: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String, default: '' },
    paperId: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper', default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type AssignmentDocument = InferSchemaType<typeof assignmentSchema> & {
  _id: unknown;
};

export const AssignmentModel = model('Assignment', assignmentSchema);
