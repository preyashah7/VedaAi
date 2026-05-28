import type { Assignment, AssignmentPaperResponse, CreateAssignmentPayload, CreateAssignmentResponse, GeneratedPaper } from '@/types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const ensureOk = async (response: Response): Promise<Response> => {
  if (response.ok) {
    return response;
  }

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(payload?.message ?? 'Request failed');
};

export const fetchAssignments = async (): Promise<Assignment[]> => {
  const response = await fetch(`${apiBaseUrl}/api/assignments`, { cache: 'no-store' });
  await ensureOk(response);
  return (await response.json()) as Assignment[];
};

export const createAssignment = async (payload: CreateAssignmentPayload): Promise<CreateAssignmentResponse> => {
  const hasFile = payload.uploadedFile instanceof File;

  const response = await fetch(
    `${apiBaseUrl}/api/assignments`,
    hasFile
      ? {
          method: 'POST',
          body: (() => {
            const formData = new FormData();
            formData.append('title', payload.title);
            formData.append('schoolName', payload.schoolName);
            formData.append('subject', payload.subject);
            formData.append('gradeLevel', payload.gradeLevel);
            formData.append('dueDate', payload.dueDate);
            formData.append('questionTypes', JSON.stringify(payload.questionTypes));
            formData.append('additionalInstructions', payload.additionalInstructions ?? '');
            formData.append('uploadedFileContent', payload.uploadedFileContent ?? '');
            if (payload.uploadedFile) {
              formData.append('file', payload.uploadedFile);
            }
            return formData;
          })(),
        }
      : {
          method: 'POST',
          headers: jsonHeaders,
          body: JSON.stringify(payload),
        }
  );
  await ensureOk(response);
  return (await response.json()) as CreateAssignmentResponse;
};

export const fetchAssignment = async (assignmentId: string): Promise<Assignment> => {
  const response = await fetch(`${apiBaseUrl}/api/assignments/${assignmentId}`, { cache: 'no-store' });
  await ensureOk(response);
  return (await response.json()) as Assignment;
};

export const fetchAssignmentPaper = async (assignmentId: string): Promise<GeneratedPaper | AssignmentPaperResponse> => {
  const response = await fetch(`${apiBaseUrl}/api/assignments/${assignmentId}/paper`, { cache: 'no-store' });
  if (response.status === 202 || response.status === 409) {
    return (await response.json()) as AssignmentPaperResponse;
  }

  await ensureOk(response);
  return (await response.json()) as GeneratedPaper;
};

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
  await ensureOk(response);
};

export const regenerateAssignment = async (payload: CreateAssignmentPayload): Promise<CreateAssignmentResponse> => {
  return createAssignment(payload);
};
