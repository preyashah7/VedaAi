import { create } from 'zustand';
import type { AppState, Assignment, AssignmentStatus, GeneratedPaper, JobStatus } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  assignments: [],
  currentJobId: null,
  currentAssignmentId: null,
  jobStatus: 'idle',
  generatedPaper: null,
  setAssignments: (assignments: Assignment[]) => set({ assignments }),
  setJobStatus: (jobStatus: JobStatus) => set({ jobStatus }),
  setGeneratedPaper: (generatedPaper: GeneratedPaper | null) => set({ generatedPaper }),
  setCurrentAssignmentId: (currentAssignmentId: string | null) => set({ currentAssignmentId }),
  setCurrentJobId: (currentJobId: string | null) => set({ currentJobId }),
  setAssignmentStatus: (assignmentId: string, status: AssignmentStatus) =>
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        (assignment.id ?? assignment._id) === assignmentId ? { ...assignment, status } : assignment
      ),
    })),
}));
