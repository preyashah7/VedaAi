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

export const generateQuestionPaper = async (assignment: CreateAssignmentInput): Promise<GeneratedPaperInput> => {
  const validatedInput = createAssignmentSchema.parse(assignment);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(buildPrompt(validatedInput));
  const rawText = result.response.text();
  const parsed = JSON.parse(rawText) as unknown;
  return generatedPaperSchema.parse(parsed);
};
