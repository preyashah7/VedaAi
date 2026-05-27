'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchAssignment, fetchAssignmentPaper, regenerateAssignment } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Assignment, GeneratedPaper } from '@/types';
import { QuestionSection } from './QuestionSection';
import { DownloadButton } from './DownloadButton';

interface PaperOutputProps {
  assignmentId: string;
}

export const PaperOutput = ({ assignmentId }: PaperOutputProps): JSX.Element => {
  const router = useRouter();
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const jobStatus = useAppStore((state) => state.jobStatus);
  const currentAssignmentId = useAppStore((state) => state.currentAssignmentId);
  const setGeneratedPaper = useAppStore((state) => state.setGeneratedPaper);
  const setCurrentAssignmentId = useAppStore((state) => state.setCurrentAssignmentId);
  const setCurrentJobId = useAppStore((state) => state.setCurrentJobId);
  const setJobStatus = useAppStore((state) => state.setJobStatus);
  useWebSocket(jobStatus === 'processing' ? assignmentId : null);

  const loadPaper = async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const assignmentResult = await fetchAssignment(assignmentId);
      setAssignment(assignmentResult);
      if (assignmentResult.status === 'failed') {
        setJobStatus('failed');
      }
      const paperResponse = await fetchAssignmentPaper(assignmentId);
      if ('sections' in paperResponse) {
        setPaper(paperResponse);
        setGeneratedPaper(paperResponse);
        setJobStatus('completed');
      } else if (paperResponse.paper) {
        setPaper(paperResponse.paper);
        setGeneratedPaper(paperResponse.paper);
        setJobStatus('completed');
      } else if (paperResponse.status === 'processing') {
        setJobStatus('processing');
      } else if (paperResponse.status === 'failed') {
        setLoadError(paperResponse.failureReason ?? 'Paper generation failed');
        setJobStatus('failed');
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load question paper');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPaper();
  }, [assignmentId]);

  useEffect(() => {
    if (jobStatus === 'completed' && currentAssignmentId === assignmentId && !paper) {
      void loadPaper();
    }
  }, [assignmentId, currentAssignmentId, jobStatus, paper]);

  const assignmentPayload = useMemo(() => {
    if (!assignment) {
      return null;
    }

    return {
      title: assignment.title,
      schoolName: assignment.schoolName,
      subject: assignment.subject,
      gradeLevel: assignment.gradeLevel,
      dueDate: assignment.dueDate,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      uploadedFileContent: assignment.uploadedFileContent,
    };
  }, [assignment]);

  const handleRegenerate = async (): Promise<void> => {
    if (!assignmentPayload) {
      return;
    }

    setIsRegenerating(true);
    setLoadError(null);
    try {
      const response = await regenerateAssignment(assignmentPayload);
      setCurrentAssignmentId(response.assignmentId);
      setCurrentJobId(response.jobId);
      setJobStatus('processing');
      router.push(`/assignments/${response.assignmentId}/paper`);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to regenerate paper');
      setJobStatus('failed');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center rounded-3xl border border-[#E5E5E5] bg-white shadow-soft">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#F1D2C8] border-t-veda-red" />
          <p className="mt-4 text-sm font-medium text-veda-label">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (loadError || !paper) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#E5E5E5] bg-white p-8 text-center shadow-soft">
        <p className="text-lg font-semibold text-veda-dark">Failed to load the paper</p>
        <p className="mt-2 text-sm text-veda-label">{loadError ?? 'No paper was returned by the server.'}</p>
        <button
          type="button"
          onClick={() => void loadPaper()}
          className="mt-6 rounded-full bg-veda-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)]"
        >
          Retry
        </button>
      </div>
    );
  }

  const paperFileName = `${paper.schoolName.replace(/\s+/g, '_')}_QuestionPaper.pdf`;
  const isProcessing = jobStatus === 'processing' && currentAssignmentId === assignmentId;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#E5E5E5] bg-white p-5 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm leading-6 text-veda-label">
          Certainly! {paper.subject} here are customized Question Paper for your {paper.gradeLevel} {paper.subject} classes on the chapters your school requested.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAnswerKey((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] px-5 py-3 text-sm font-semibold text-veda-dark transition hover:bg-[#FAFAF7]"
          >
            <Eye size={16} />
            {showAnswerKey ? 'Hide Answer Key' : 'Answer Key'}
          </button>
          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={isRegenerating}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] px-5 py-3 text-sm font-semibold text-veda-dark transition hover:bg-[#FAFAF7] disabled:opacity-70"
          >
            <RefreshCcw size={16} />
            Regenerate
          </button>
          <DownloadButton paperRef={paperRef} fileName={paperFileName} />
        </div>
      </div>

      {isProcessing ? (
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 text-center shadow-soft">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#F1D2C8] border-t-veda-red" />
          <p className="mt-4 text-lg font-semibold text-veda-dark">Generating your question paper...</p>
          <p className="mt-2 text-sm text-veda-label">This may take 20-30 seconds</p>
        </div>
      ) : null}

      <div ref={paperRef} className="mx-auto max-w-[800px] rounded-3xl bg-white p-4 shadow-soft md:p-10 print:shadow-none">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-veda-dark md:text-2xl">{paper.schoolName}</h1>
          <p className="mt-1 text-sm text-veda-dark md:text-[14px]">Subject: {paper.subject}</p>
          <p className="text-sm text-veda-dark md:text-[14px]">Class: {paper.gradeLevel}</p>
        </div>

        <div className="my-4 border-t border-[#D9D9D9]" />

        <div className="flex flex-col gap-2 text-sm text-veda-dark md:flex-row md:items-center md:justify-between">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.maxMarks}</span>
        </div>

        <div className="my-4 border-t border-[#D9D9D9]" />

        <p className="text-[13px] italic leading-6 text-veda-label">{paper.generalInstructions}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="block text-sm text-veda-dark">
            Name:{' '}
            <input type="text" className="w-full border-0 border-b border-[#303030] bg-transparent px-0 py-1 outline-none" />
          </label>
          <label className="block text-sm text-veda-dark">
            Roll Number:{' '}
            <input type="text" className="w-full border-0 border-b border-[#303030] bg-transparent px-0 py-1 outline-none" />
          </label>
          <label className="block text-sm text-veda-dark">
            Class: {paper.gradeLevel} Section:{' '}
            <input type="text" className="w-20 border-0 border-b border-[#303030] bg-transparent px-0 py-1 outline-none" />
          </label>
        </div>

        <div className="mt-8">
          {paper.sections.map((section) => (
            <QuestionSection key={section.title} section={section} />
          ))}
        </div>

        {showAnswerKey ? (
          <div className="mt-8 rounded-2xl border border-[#E5E5E5] bg-[#FAFAF7] p-5">
            <h3 className="text-base font-semibold text-veda-dark">Answer Key</h3>
            <div className="mt-3 space-y-2 text-sm text-veda-dark">
              {paper.answerKey.map((item) => (
                <p key={item.questionNumber}>
                  {item.questionNumber}. {item.answer}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
