import 'dotenv/config';
import { Worker } from 'bullmq';
import { connectDatabase } from '../lib/db';
import { getRedisClient } from '../lib/redis';
import { AssignmentModel } from '../models/Assignment';
import { GeneratedPaperModel } from '../models/GeneratedPaper';
import { generateQuestionPaper } from '../services/gemini';
import { broadcastToRoom } from '../services/websocket';
import { generatedPaperSchema, type CreateAssignmentInput } from '../lib/schemas';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/vedaai';
const connection = getRedisClient(redisUrl);

const main = async (): Promise<void> => {
  await connectDatabase(mongoUri);

  const worker = new Worker(
    'generate-paper',
    async (job) => {
      const assignmentId = job.data.assignmentId as string;
      const assignment = await AssignmentModel.findById(assignmentId).lean();
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      if (!assignment.dueDate) {
        throw new Error('Assignment due date is missing');
      }

      await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'processing' });
      broadcastToRoom(assignmentId, { type: 'JOB_STARTED', assignmentId });

      const assignmentInput = {
        title: assignment.title,
        subject: assignment.subject,
        gradeLevel: assignment.gradeLevel,
        schoolName: assignment.schoolName,
        dueDate: assignment.dueDate,
        questionTypes: assignment.questionTypes as CreateAssignmentInput['questionTypes'],
        additionalInstructions: assignment.additionalInstructions,
        uploadedFileContent: assignment.uploadedFileContent,
      } satisfies CreateAssignmentInput;

      const generatedPaper = await generateQuestionPaper({
        ...assignmentInput,
      });

      const validatedPaper = generatedPaperSchema.parse(generatedPaper);
      const paperDocument = await GeneratedPaperModel.create({
        assignmentId,
        ...validatedPaper,
      });

      const cacheKey = `paper:${assignmentId}`;
      await connection.set(cacheKey, JSON.stringify(paperDocument.toJSON()), 'EX', 3600);

      await AssignmentModel.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        paperId: paperDocument._id,
      });

      const paperId = paperDocument._id.toString();
      broadcastToRoom(assignmentId, { type: 'JOB_COMPLETE', assignmentId, paperId });

      return { paperId };
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on('failed', async (job, error) => {
    if (!job) {
      return;
    }

    const assignmentId = job.data.assignmentId as string;
    await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'failed' });
    broadcastToRoom(assignmentId, { type: 'JOB_FAILED', assignmentId, error: error.message });
  });

  const shutdown = async (): Promise<void> => {
    await worker.close();
    await connection.quit();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

void main();
