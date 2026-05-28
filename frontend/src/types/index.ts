export type JobStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
}

export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface Assignment {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  gradeLevel: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  uploadedFileContent?: string;
  status: AssignmentStatus;
  jobId?: string;
  paperId?: string;
  failureReason?: string;
  createdAt?: string;
}

export interface GeneratedQuestion {
  number: number;
  text: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  type: 'mcq' | 'short' | 'long' | 'diagram' | 'numerical' | 'essay';
}

export interface GeneratedSection {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface AnswerKeyItem {
  questionNumber: string;
  answer: string;
}

export interface GeneratedPaper {
  _id?: string;
  id?: string;
  assignmentId?: string;
  schoolName: string;
  subject: string;
  gradeLevel: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: GeneratedSection[];
  answerKey: AnswerKeyItem[];
  createdAt?: string;
}

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  gradeLevel: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  uploadedFileContent?: string;
  uploadedFile?: File | null;
}

export interface CreateAssignmentResponse {
  assignmentId: string;
  jobId: string;
}

export interface AssignmentPaperResponse {
  status?: AssignmentStatus;
  assignment?: Assignment;
  paper?: GeneratedPaper;
  message?: string;
  failureReason?: string;
}

export interface AppState {
  assignments: Assignment[];
  currentJobId: string | null;
  currentAssignmentId: string | null;
  jobStatus: JobStatus;
  generatedPaper: GeneratedPaper | null;
  uploadedFile: File | null;
  setAssignments: (assignments: Assignment[]) => void;
  setJobStatus: (status: JobStatus) => void;
  setGeneratedPaper: (paper: GeneratedPaper | null) => void;
  setCurrentAssignmentId: (id: string | null) => void;
  setCurrentJobId: (id: string | null) => void;
  setAssignmentStatus: (assignmentId: string, status: AssignmentStatus) => void;
}
