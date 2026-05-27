import { Router, type Request, type Response } from 'express';
import { Types } from 'mongoose';
import { generatePaperQueue } from '../queues/queue';
import { AssignmentModel } from '../models/Assignment';
import { GeneratedPaperModel } from '../models/GeneratedPaper';
import { getRedisClient } from '../lib/redis';
import { createAssignmentSchema } from '../lib/schemas';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const redisClient = getRedisClient(redisUrl);

const router = Router();

const getIdParam = (value: string | string[] | undefined): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  return null;
};

router.post('/', async (request: Request, response: Response) => {
  const parsed = createAssignmentSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: 'Validation failed', issues: parsed.error.flatten() });
  }

  const assignment = await AssignmentModel.create({
    ...parsed.data,
    status: 'pending',
  });

  const job = await generatePaperQueue.add('generate-paper', {
    assignmentId: assignment._id.toString(),
  });

  assignment.jobId = job.id ?? '';
  await assignment.save();

  return response.status(201).json({
    assignmentId: assignment._id.toString(),
    jobId: job.id ?? '',
  });
});

router.get('/', async (_request: Request, response: Response) => {
  const assignments = await AssignmentModel.find().sort({ createdAt: -1 }).lean();
  return response.json(assignments);
});

router.get('/:id', async (request: Request, response: Response) => {
  const id = getIdParam(request.params.id);
  if (!id) {
    return response.status(400).json({ message: 'Invalid assignment id' });
  }
  if (!Types.ObjectId.isValid(id)) {
    return response.status(400).json({ message: 'Invalid assignment id' });
  }

  const assignment = await AssignmentModel.findById(id).lean();
  if (!assignment) {
    return response.status(404).json({ message: 'Assignment not found' });
  }

  return response.json(assignment);
});

router.get('/:id/paper', async (request: Request, response: Response) => {
  const id = getIdParam(request.params.id);
  if (!id) {
    return response.status(400).json({ message: 'Invalid assignment id' });
  }
  if (!Types.ObjectId.isValid(id)) {
    return response.status(400).json({ message: 'Invalid assignment id' });
  }

  const assignment = await AssignmentModel.findById(id).lean();
  if (!assignment) {
    return response.status(404).json({ message: 'Assignment not found' });
  }

  const cacheKey = `paper:${id}`;
  const cachedPaper = await redisClient.get(cacheKey);
  if (cachedPaper) {
    return response.json(JSON.parse(cachedPaper) as unknown);
  }

  const paper = await GeneratedPaperModel.findOne({ assignmentId: id }).lean();
  if (paper) {
    await redisClient.set(cacheKey, JSON.stringify(paper), 'EX', 3600);
    return response.json(paper);
  }

  if (assignment.status === 'failed') {
    return response.status(409).json({
      message: 'Paper generation failed',
      status: assignment.status,
      failureReason: assignment.failureReason ?? 'Unknown error',
      assignment,
    });
  }

  if (assignment.status === 'processing' || assignment.status === 'pending') {
    return response.status(202).json({
      status: assignment.status,
      assignment,
    });
  }

  return response.status(404).json({ message: 'Generated paper not found' });
});

router.delete('/:id', async (request: Request, response: Response) => {
  const id = getIdParam(request.params.id);
  if (!id) {
    return response.status(400).json({ message: 'Invalid assignment id' });
  }
  if (!Types.ObjectId.isValid(id)) {
    return response.status(400).json({ message: 'Invalid assignment id' });
  }

  await GeneratedPaperModel.deleteOne({ assignmentId: id });
  await AssignmentModel.findByIdAndDelete(id);
  await redisClient.del(`paper:${id}`);

  return response.json({ success: true });
});

export default router;
