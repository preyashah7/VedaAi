import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAssignmentSchema, generatedPaperSchema, type CreateAssignmentInput, type GeneratedPaperInput } from '../lib/schemas';

const formatQuestionTypes = (assignment: CreateAssignmentInput): string => {
  return assignment.questionTypes
    .map((questionType) => `- ${questionType.type}: ${questionType.count} questions, ${questionType.marks} mark each`)
    .join('\n');
};

const buildPrompt = (assignment: CreateAssignmentInput): string => {
  const questionTypes = formatQuestionTypes(assignment);
  const referenceMaterial = assignment.uploadedFileContent.trim() || 'None provided';
  const additionalInstructions = assignment.additionalInstructions.trim() || 'None';

  return [
    'You are an expert exam paper generator for Indian schools. Generate a complete, realistic question paper.',
    '',
    `School: ${assignment.schoolName}`,
    `Subject: ${assignment.subject}`,
    `Grade/Class: ${assignment.gradeLevel}`,
    'Question types and counts:',
    questionTypes,
    `Additional instructions: ${additionalInstructions}`,
    `Reference material: ${referenceMaterial}`,
    '',
    'Generate a complete question paper with REAL, subject-appropriate questions (not placeholders).',
    'Organize into sections based on question type (Section A = MCQ, Section B = Short Answer, etc.).',
    'Include a complete answer key.',
    '',
    'Return ONLY valid JSON matching this exact structure:',
    '{',
    '  "schoolName": "string",',
    '  "subject": "string",',
    '  "gradeLevel": "string",',
    '  "timeAllowed": "2 hours",',
    '  "maxMarks": number,',
    '  "generalInstructions": "string",',
    '  "sections": [',
    '    {',
    '      "title": "Section A",',
    '      "instruction": "Choose the correct option. Each question carries 1 mark.",',
    '      "questions": [',
    '        {',
    '          "number": 1,',
    '          "text": "Full question text here",',
    '          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],',
    '          "difficulty": "easy|medium|hard",',
    '          "marks": 1,',
    '          "type": "mcq|short|long|diagram|numerical"',
    '        }',
    '      ]',
    '    }',
    '  ],',
    '  "answerKey": [',
    '    { "questionNumber": "1", "answer": "Full answer here" }',
    '  ]',
    '}',
  ].join('\n');
};

const shouldTryNextModel = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('404 Not Found') ||
    message.includes('not found for API version') ||
    message.includes('not supported for generateContent') ||
    message.includes('429 Too Many Requests') ||
    message.includes('Quota exceeded') ||
    message.includes('retry in')
  );
};

export const generateQuestionPaper = async (assignment: CreateAssignmentInput): Promise<GeneratedPaperInput> => {
  const validatedInput = createAssignmentSchema.parse(assignment);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const requestedModel = process.env.GEMINI_MODEL?.trim();
  const modelCandidates = [
    requestedModel,
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  const client = new GoogleGenerativeAI(apiKey);

  let lastError: unknown;
  for (const modelName of modelCandidates) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(buildPrompt(validatedInput));
      const rawText = result.response.text();
      const parsed = JSON.parse(rawText) as unknown;
      return generatedPaperSchema.parse(parsed);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextModel(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to generate paper with any Gemini model');
};
