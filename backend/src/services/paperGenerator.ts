import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const QuestionSchema = z.object({
  number: z.number(),
  text: z.string().min(5),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().positive(),
  type: z.string(),
  options: z.array(z.string()).optional(),
});

const SectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

const GeneratedPaperSchema = z.object({
  schoolName: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
  timeAllowed: z.string(),
  maxMarks: z.number().positive(),
  generalInstructions: z.string(),
  sections: z.array(SectionSchema).min(1),
  answerKey: z.array(z.object({ questionNumber: z.string(), answer: z.string() })),
});

const SECTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const DIFFICULTIES: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

const normalizeQuestionType = (type: string): string => {
  const lower = type.toLowerCase();
  if (lower.includes('multiple') || lower.includes('mcq')) return 'mcq';
  if (lower.includes('short')) return 'short';
  if (lower.includes('long')) return 'long';
  if (lower.includes('diagram') || lower.includes('graph')) return 'diagram';
  if (lower.includes('numerical') || lower.includes('problem')) return 'numerical';
  if (lower.includes('essay')) return 'essay';
  if (lower.includes('writing') || lower.includes('creative')) return 'essay';
  if (lower.includes('vocabulary') || lower.includes('word')) return 'short';
  return 'short';
};

const parseUploadedDocument = (content: string): {
  passages: string[];
  existingQuestions: string[];
  vocabulary: string[];
  writingPrompts: string[];
} => {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const passages: string[] = [];
  const existingQuestions: string[] = [];
  const vocabulary: string[] = [];
  const writingPrompts: string[] = [];

  let inVocab = false;
  let inPassage = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.includes('vocabulary') || lower.includes('vocab list')) {
      inVocab = true;
      inPassage = false;
      continue;
    }

    if (lower.includes('passage') || lower.includes('reading passage')) {
      inPassage = true;
      inVocab = false;
    }

    if (lower.includes('short question') || lower.includes('writing prompt') || lower.includes('end of')) {
      inVocab = false;
      inPassage = false;
    }

    if (/^\d+[\.)]\s+.{10,}/.test(line)) {
      existingQuestions.push(line.replace(/^\d+[\.)]\s+/, '').trim());
      continue;
    }

    if (lower.startsWith('imagine') || lower.startsWith('write a') || lower.startsWith('describe')) {
      writingPrompts.push(line);
      continue;
    }

    if (inVocab && (line.startsWith('-') || line.startsWith('*'))) {
      vocabulary.push(line.replace(/^[-*]\s*/, '').trim());
      continue;
    }

    if (line.length > 40 && !lower.includes('title:') && !lower.includes('end of')) {
      passages.push(line);
      if (inPassage) {
        continue;
      }
    }
  }

  return { passages, existingQuestions, vocabulary, writingPrompts };
};

const getMCQOptions = (index: number): string[] => {
  const sets = [
    ['A. Increases proportionally', 'B. Decreases inversely', 'C. Remains constant', 'D. Cannot be determined'],
    ['A. Always true', 'B. Sometimes true', 'C. Never true', 'D. Depends on conditions'],
    ['A. The first option', 'B. The second option', 'C. Both A and B', 'D. Neither A nor B'],
    ['A. Primary cause', 'B. Secondary effect', 'C. Direct result', 'D. Indirect consequence'],
  ];

  return sets[index % sets.length];
};

const getSubjectTemplate = (type: string, subject: string, index: number): string => {
  const normalizedType = type.toLowerCase();
  const subjectTemplates: Record<string, string[]> = {
    mcq: [
      `Which of the following best describes a key concept in ${subject}?`,
      `What is the primary principle behind ${subject}?`,
      `Which statement about ${subject} is most accurate?`,
      `The study of ${subject} is most closely associated with:`,
      `What is the correct definition related to ${subject}?`,
    ],
    short: [
      `Define an important term from ${subject} in your own words.`,
      `Explain the significance of a core concept in ${subject}.`,
      `What are two key features you have studied in ${subject}?`,
      `Describe a process or event relevant to ${subject}.`,
      `How does a major concept in ${subject} apply to real life?`,
    ],
    long: [
      `Discuss in detail a major theme in ${subject} with suitable examples.`,
      `Explain the importance of a central concept in ${subject} and its real-world applications.`,
      `Write a comprehensive note on a significant topic from ${subject}.`,
      `Analyze the role of a key concept in the broader context of ${subject}.`,
    ],
    diagram: [
      `Draw and label a diagram illustrating a key concept from ${subject}.`,
      `Represent the relationship between two concepts in ${subject} using a labelled diagram.`,
      `Illustrate a process from ${subject} with a well-labelled diagram.`,
    ],
    numerical: [
      `Calculate the result using a formula from ${subject}. Show all working steps.`,
      `Solve the following problem from ${subject}: Given the values provided, find the answer.`,
      `Using principles of ${subject}, find the missing value in the given scenario.`,
    ],
    essay: [
      `Write an essay on an important topic from ${subject}, using examples where relevant.`,
      `Discuss the significance of a major concept in ${subject} in detail.`,
      `Explain a key issue from ${subject} with suitable supporting points.`,
    ],
    default: [
      `Answer the following question based on your knowledge of ${subject}.`,
      `Explain an important concept from ${subject}.`,
      `Describe a significant topic from ${subject}.`,
    ],
  };

  const key = normalizedType.includes('multiple') || normalizedType.includes('mcq')
    ? 'mcq'
    : normalizedType.includes('short')
      ? 'short'
      : normalizedType.includes('long')
        ? 'long'
        : normalizedType.includes('diagram') || normalizedType.includes('graph')
          ? 'diagram'
          : normalizedType.includes('numerical') || normalizedType.includes('problem')
            ? 'numerical'
            : normalizedType.includes('essay')
              ? 'essay'
              : 'default';

  const bank = subjectTemplates[key];
  return bank[index % bank.length];
};

const getSectionInstruction = (type: string): string => {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes('multiple') || normalizedType.includes('mcq')) return 'Choose the correct option. Each question carries equal marks.';
  if (normalizedType.includes('short')) return 'Answer all questions briefly in 2-3 sentences each.';
  if (normalizedType.includes('long') || normalizedType.includes('essay')) return 'Attempt the questions. Support answers with examples. Minimum 150 words each.';
  if (normalizedType.includes('diagram') || normalizedType.includes('graph')) return 'Draw neat, well-labelled diagrams. Unlabelled diagrams will not receive full marks.';
  if (normalizedType.includes('numerical') || normalizedType.includes('problem')) return 'Show all working steps clearly. Marks are awarded for correct method even if final answer is wrong.';
  if (normalizedType.includes('vocabulary') || normalizedType.includes('word')) return 'Answer based on the context of the passage provided.';
  if (normalizedType.includes('writing') || normalizedType.includes('creative')) return 'Write in complete sentences. Focus on clarity, structure, and relevance to the passage.';
  return 'Attempt all questions carefully.';
};

const generateQuestionsForType = (
  questionType: QuestionType,
  subject: string,
  docData: ReturnType<typeof parseUploadedDocument> | null,
  sectionIndex: number
): Question[] => {
  const normalizedType = questionType.type.toLowerCase();
  const questions: Question[] = [];

  for (let index = 0; index < questionType.count; index += 1) {
    const difficulty = DIFFICULTIES[index % DIFFICULTIES.length];
    let text = '';
    let options: string[] | undefined;

    if (docData) {
      if (normalizedType.includes('multiple') || normalizedType.includes('mcq')) {
        if (docData.vocabulary.length > 0) {
          const word = docData.vocabulary[index % docData.vocabulary.length];
          text = `What is the meaning of the word "${word}" as used in the passage?`;
          options = [
            'A. A type of object or tool',
            `B. ${word.charAt(0).toUpperCase() + word.slice(1)}-related concept`,
            'C. Relating to financial records',
            'D. A feeling of contentment',
          ];
        } else if (docData.passages.length > 0) {
          const passage = docData.passages[index % docData.passages.length];
          const snippet = passage.length > 60 ? `${passage.substring(0, 60)}...` : passage;
          text = `According to the passage, which statement is correct about: "${snippet}"?`;
          options = [
            'A. The statement is entirely true as written',
            'B. The statement applies only on specific occasions',
            'C. The statement is a metaphor for something else',
            'D. The statement contradicts an earlier claim',
          ];
        }
      } else if (normalizedType.includes('short')) {
        if (docData.existingQuestions.length > index) {
          text = docData.existingQuestions[index];
        } else if (docData.passages.length > 0) {
          const passage = docData.passages[index % docData.passages.length];
          const templates = [
            `Based on the passage, explain: "${passage.substring(0, 50)}..."`,
            `What does the author mean when writing about "${subject}"?`,
            'Identify and explain one key idea from the passage.',
            'How does the passage describe the role of the main subject?',
            'What evidence in the passage supports the main theme?',
          ];
          text = templates[index % templates.length];
        }
      } else if (normalizedType.includes('long') || normalizedType.includes('essay')) {
        if (docData.writingPrompts.length > 0) {
          text = docData.writingPrompts[index % docData.writingPrompts.length];
        } else if (docData.passages.length > 0) {
          text = 'Using evidence from the passage, write a detailed analysis of the main theme. Support your answer with at least two specific references from the text. (Minimum 150 words)';
        }
      } else if (normalizedType.includes('vocabulary') || normalizedType.includes('word')) {
        if (docData.vocabulary.length > 0) {
          const word = docData.vocabulary[index % docData.vocabulary.length];
          text = `Use the word "${word}" in a sentence of your own that shows you understand its meaning.`;
        }
      } else if (normalizedType.includes('writing') || normalizedType.includes('creative')) {
        if (docData.writingPrompts.length > 0) {
          text = docData.writingPrompts[index % docData.writingPrompts.length];
        } else {
          text = 'Write a short paragraph (4-6 sentences) continuing the story or theme presented in the passage.';
        }
      } else if (normalizedType.includes('diagram') || normalizedType.includes('graph')) {
        text = getSubjectTemplate(questionType.type, subject, index);
      } else if (normalizedType.includes('numerical') || normalizedType.includes('problem')) {
        text = getSubjectTemplate(questionType.type, subject, index);
      }
    }

    if (!text) {
      text = getSubjectTemplate(questionType.type, subject, index);
      if (normalizedType.includes('multiple') || normalizedType.includes('mcq')) {
        options = getMCQOptions(index);
      }
    }

    questions.push({
      number: index + 1,
      text,
      difficulty,
      marks: questionType.marks,
      type: normalizeQuestionType(questionType.type),
      options,
    });
  }

  return questions;
};

const buildPrompt = (params: GenerationParams): string => {
  const hasDocument = Boolean(params.uploadedFileContent && params.uploadedFileContent.trim().length > 50);
  const documentSection = hasDocument
    ? `
━━━ UPLOADED DOCUMENT / PASSAGE ━━━
${params.uploadedFileContent}
━━━ END OF DOCUMENT ━━━

CRITICAL INSTRUCTION: You MUST generate all questions directly from the above document.
- For comprehension/reading questions: quote or paraphrase specific lines from the passage.
- For vocabulary questions: pick words that actually appear in the document.
- For writing prompts: refer to characters, places, or events from the document.
- For short answer questions: answers must be found within the document text.
- Do NOT invent content unrelated to the document.
`
    : `Subject context: ${params.subject} for Grade/Class ${params.gradeLevel}. Generate subject-appropriate questions.`;

  const qtFormatted = params.questionTypes
    .map((questionType) => `  - ${questionType.type}: ${questionType.count} question(s), ${questionType.marks} mark(s) each`)
    .join('\n');

  const totalMarks = params.questionTypes.reduce((sum, questionType) => sum + questionType.count * questionType.marks, 0);

  return [
    'You are an expert question paper generator for Indian schools.',
    '',
    documentSection,
    '',
    'Paper details:',
    `  School: ${params.schoolName}`,
    `  Subject: ${params.subject}`,
    `  Grade/Class: ${params.gradeLevel}`,
    `  Total marks: ${totalMarks}`,
    '',
    'Question types required:',
    qtFormatted,
    '',
    `Additional instructions from teacher: ${params.additionalInstructions || 'None'}`,
    '',
    'Rules:',
    '1. Generate REAL, complete questions - no placeholders like "Question about topic".',
    `2. ${hasDocument ? 'All questions must be traceable to the uploaded document.' : 'Questions must be appropriate for the subject and grade level.'}`,
    '3. Distribute difficulty: roughly 40% easy, 40% medium, 20% hard across each section.',
    '4. For MCQ type: always include options array with exactly 4 options (A. B. C. D. format).',
    '5. For non-MCQ: omit the options field entirely.',
    '6. Section titles: Section A, Section B, etc. matching question type order.',
    '7. Answer key must have one entry per question using format "Section A - Q1".',
    '8. generalInstructions should be realistic (2-3 sentences, exam-appropriate).',
    '',
    'Return ONLY valid JSON with no markdown fences, no extra text, matching this exact structure:',
    '{',
    '  "schoolName": "string",',
    '  "subject": "string",',
    '  "gradeLevel": "string",',
    '  "timeAllowed": "string (e.g. 2 Hours 30 Minutes)",',
    '  "maxMarks": number,',
    '  "generalInstructions": "string",',
    '  "sections": [',
    '    {',
    '      "title": "Section A",',
    '      "instruction": "string",',
    '      "questions": [',
    '        {',
    '          "number": 1,',
    '          "text": "Full question text here",',
    '          "options": ["A. option1", "B. option2", "C. option3", "D. option4"],',
    '          "difficulty": "easy",',
    '          "marks": 1,',
    '          "type": "mcq"',
    '        }',
    '      ]',
    '    }',
    '  ],',
    '  "answerKey": [',
    '    { "questionNumber": "Section A - Q1", "answer": "Full answer here" }',
    '  ]',
    '}',
  ].join('\n');
};

const extractCleanJson = (text: string): string => {
  return text.replace(/```json[\s\S]*?```/g, (match) => match.slice(7, -3)).replace(/```/g, '').trim();
};

const normalizePaper = (paper: GeneratedPaper): GeneratedPaper => ({
  ...paper,
  sections: paper.sections.map((section) => ({
    ...section,
    questions: section.questions.map((question) => ({
      ...question,
      type: normalizeQuestionType(question.type),
    })),
  })),
});

const geminiGenerate = async (params: GenerationParams): Promise<GeneratedPaper> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(buildPrompt(params));
  const text = result.response.text();
  const clean = extractCleanJson(text);
  const parsed = JSON.parse(clean) as unknown;

  try {
    return normalizePaper(GeneratedPaperSchema.parse(parsed));
  } catch (error) {
    throw error;
  }
};

const templateGenerate = (params: GenerationParams): GeneratedPaper => {
  const hasDocument = Boolean(params.uploadedFileContent && params.uploadedFileContent.trim().length > 50);
  const docData = hasDocument ? parseUploadedDocument(params.uploadedFileContent ?? '') : null;

  const totalMarks = params.questionTypes.reduce((sum, questionType) => sum + questionType.count * questionType.marks, 0);
  const totalQuestions = params.questionTypes.reduce((sum, questionType) => sum + questionType.count, 0);
  const timeHours = Math.max(1, Math.ceil(totalQuestions / 10));
  const timeAllowed = timeHours === 1 ? '1 Hour' : `${timeHours} Hours`;

  const sections: Section[] = params.questionTypes.map((questionType, index) => ({
    title: `Section ${SECTION_LABELS[index] ?? String.fromCharCode(65 + index)}`,
    instruction: getSectionInstruction(questionType.type),
    questions: generateQuestionsForType(questionType, params.subject, docData, index),
  }));

  const answerKey = sections.flatMap((section) =>
    section.questions.map((question) => ({
      questionNumber: `${section.title} - Q${question.number}`,
      answer: docData && docData.passages.length > 0
        ? `Refer to the passage: "${docData.passages[0].substring(0, 80)}..."`
        : `Refer to ${params.subject} textbook. Standard answer applicable.`,
    }))
  );

  const generalInstructions = hasDocument
    ? 'Read the passage carefully before attempting questions. All questions are based on the provided material. Write answers in your own words unless quoting directly.'
    : 'All questions are compulsory unless stated otherwise. Write answers clearly and legibly. Mobile phones are not permitted in the examination hall.';

  return {
    schoolName: params.schoolName,
    subject: params.subject,
    gradeLevel: params.gradeLevel,
    timeAllowed,
    maxMarks: totalMarks,
    generalInstructions,
    sections,
    answerKey,
  };
};

export async function generateQuestionPaper(params: GenerationParams): Promise<GeneratedPaper> {
  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await geminiGenerate(params);
      console.log('generation mode: gemini');
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Gemini generation failed, falling back to template:', message);
    }
  }

  console.log('generation mode: template');
  return templateGenerate(params);
}

export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface Question {
  number: number;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  type: string;
  options?: string[];
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  gradeLevel: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: Section[];
  answerKey: Array<{ questionNumber: string; answer: string }>;
}

export interface GenerationParams {
  schoolName: string;
  subject: string;
  gradeLevel: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  uploadedFileContent?: string;
}