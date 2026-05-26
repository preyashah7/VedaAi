'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { createAssignment } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import type { CreateAssignmentPayload } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { StepIndicator } from './StepIndicator';
import { FileUpload } from './FileUpload';
import { QuestionTypeRow } from './QuestionTypeRow';

const questionTypeSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().min(1),
  marks: z.number().int().min(1),
});

const createAssignmentFormSchema = z.object({
  schoolName: z.string().trim().min(1, 'School name is required'),
  subject: z.string().trim().min(1, 'Subject is required'),
  gradeLevel: z.string().trim().min(1, 'Grade/Class is required'),
  dueDate: z
    .string()
    .trim()
    .min(1, 'Due date is required')
    .refine((value) => new Date(`${value}T00:00:00`) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Due date cannot be in the past',
    }),
  additionalInstructions: z.string().trim().optional().default(''),
  uploadedFileContent: z.string().trim().optional().default(''),
  questionTypes: z.array(questionTypeSchema).min(1, 'Add at least one question type'),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentFormSchema>;

const initialQuestionTypes: CreateAssignmentFormValues['questionTypes'] = [
  { type: 'Multiple Choice Questions', count: 5, marks: 1 },
];

const buildAssignmentPayload = (values: CreateAssignmentFormValues): CreateAssignmentPayload => {
  const title = `${values.subject} - ${values.gradeLevel}`;
  return {
    title,
    schoolName: values.schoolName,
    subject: values.subject,
    gradeLevel: values.gradeLevel,
    dueDate: values.dueDate,
    questionTypes: values.questionTypes,
    additionalInstructions: values.additionalInstructions ?? '',
    uploadedFileContent: values.uploadedFileContent ?? '',
  };
};

export const CreateForm = (): JSX.Element => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentAssignmentId = useAppStore((state) => state.currentAssignmentId);
  const jobStatus = useAppStore((state) => state.jobStatus);
  const setCurrentAssignmentId = useAppStore((state) => state.setCurrentAssignmentId);
  const setCurrentJobId = useAppStore((state) => state.setCurrentJobId);
  const setJobStatus = useAppStore((state) => state.setJobStatus);
  useWebSocket(jobStatus === 'processing' ? currentAssignmentId : null);

  useEffect(() => {
    setCurrentAssignmentId(null);
    setCurrentJobId(null);
    setJobStatus('idle');
  }, [setCurrentAssignmentId, setCurrentJobId, setJobStatus]);

  const { control, register, handleSubmit, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentFormSchema),
    defaultValues: {
      schoolName: '',
      subject: '',
      gradeLevel: '',
      dueDate: '',
      additionalInstructions: '',
      uploadedFileContent: '',
      questionTypes: initialQuestionTypes,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questionTypes',
  });

  const questionTypes = watch('questionTypes');
  const totals = useMemo(() => {
    return questionTypes.reduce(
      (accumulator, item) => ({
        questions: accumulator.questions + Number(item.count ?? 0),
        marks: accumulator.marks + Number(item.count ?? 0) * Number(item.marks ?? 0),
      }),
      { questions: 0, marks: 0 }
    );
  }, [questionTypes]);

  useEffect(() => {
    if (jobStatus === 'completed' && currentAssignmentId) {
      router.push(`/assignments/${currentAssignmentId}/paper`);
    }
  }, [currentAssignmentId, jobStatus, router]);

  useEffect(() => {
    if (jobStatus === 'failed') {
      setErrorMessage('Paper generation failed. Please try again.');
    }
  }, [jobStatus]);

  const handleNext = async (): Promise<void> => {
    const isStepValid = await trigger(['dueDate', 'questionTypes', 'additionalInstructions', 'uploadedFileContent']);
    if (isStepValid) {
      setStep(2);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setJobStatus('submitting');
    try {
      const payload = buildAssignmentPayload(values);
      const response = await createAssignment(payload);
      setCurrentAssignmentId(response.assignmentId);
      setCurrentJobId(response.jobId);
      setJobStatus('processing');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to generate assignment';
      setErrorMessage(message);
      setJobStatus('failed');
    }
  });

  const handleFileSelected = (fileName: string, fileContent: string): void => {
    setSelectedFileName(fileName);
    setValue('uploadedFileContent', fileContent, { shouldValidate: true, shouldDirty: true });
  };

  const dateMin = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <StepIndicator currentStep={step} />

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="rounded-3xl border border-[#E5E5E5] bg-white p-5 shadow-soft md:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-veda-dark">{step === 1 ? 'Assignment Details' : 'Assignment Info'}</h1>
              <p className="mt-1 text-sm text-veda-label">Build a paper in two guided steps.</p>
            </div>
            <div className="rounded-full bg-[#F8F4EE] px-4 py-2 text-sm font-medium text-veda-label">
              Total Questions: {totals.questions} · Total Marks: {totals.marks}
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-veda-dark">Upload Material</h2>
                <FileUpload selectedFileName={selectedFileName} onFileSelected={handleFileSelected} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-veda-label">Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      min={dateMin}
                      {...register('dueDate')}
                      className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 pr-11 text-sm outline-none transition placeholder:text-veda-label focus:border-veda-red"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-veda-label" size={16} />
                  </div>
                  {errors.dueDate ? <p className="mt-2 text-xs text-veda-red">{errors.dueDate.message}</p> : null}
                </div>
              </div>

              <div>
                <div className="mb-3 grid grid-cols-1 gap-3 text-xs font-semibold uppercase tracking-wide text-veda-label md:grid-cols-[1.6fr_auto_auto_auto] md:px-4">
                  <span>Question Type</span>
                  <span className="hidden md:block">&nbsp;</span>
                  <span>No. of Questions</span>
                  <span>Marks</span>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <QuestionTypeRow
                      key={field.id}
                      index={index}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      onRemove={(removeIndex) => {
                        if (fields.length > 1) {
                          remove(removeIndex);
                        }
                      }}
                      questionTypes={questionTypes}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => append({ type: 'Multiple Choice Questions', count: 1, marks: 1 })}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-[#D9D9D9] px-4 py-2 text-sm font-medium text-veda-dark transition hover:bg-[#FAFAF7]"
                >
                  <Plus size={16} />
                  Add Question Type
                </button>
                {errors.questionTypes ? <p className="mt-2 text-xs text-veda-red">{errors.questionTypes.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-veda-label">Additional Information (For better output)</label>
                <textarea
                  rows={5}
                  {...register('additionalInstructions')}
                  placeholder="e.g. Generate a question paper for 2-hour exam duration..."
                  className="w-full resize-y rounded-2xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-veda-label focus:border-veda-red"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-veda-label">School Name</label>
                <input
                  type="text"
                  {...register('schoolName')}
                  className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm outline-none transition focus:border-veda-red"
                  placeholder="School name"
                />
                {errors.schoolName ? <p className="mt-2 text-xs text-veda-red">{errors.schoolName.message}</p> : null}
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-veda-label">Subject</label>
                  <input
                    type="text"
                    {...register('subject')}
                    className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm outline-none transition focus:border-veda-red"
                    placeholder="e.g. Mathematics"
                  />
                  {errors.subject ? <p className="mt-2 text-xs text-veda-red">{errors.subject.message}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-veda-label">Grade/Class</label>
                  <input
                    type="text"
                    {...register('gradeLevel')}
                    className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm outline-none transition focus:border-veda-red"
                    placeholder="e.g. Class 10"
                  />
                  {errors.gradeLevel ? <p className="mt-2 text-xs text-veda-red">{errors.gradeLevel.message}</p> : null}
                </div>
                <div className="rounded-2xl border border-[#E5E5E5] bg-[#FAFAF7] p-4">
                  <p className="text-xs uppercase tracking-wide text-veda-label">Generated Title</p>
                  <p className="mt-2 text-sm font-medium text-veda-dark">{watch('subject') || 'Subject'} - {watch('gradeLevel') || 'Grade'}</p>
                </div>
              </div>
            </div>
          ) : null}

          {errorMessage ? <p className="mt-4 rounded-2xl bg-[#FFF6F3] px-4 py-3 text-sm text-veda-red">{errorMessage}</p> : null}

          {jobStatus === 'processing' || jobStatus === 'submitting' ? (
            <div className="mt-5 rounded-3xl border border-[#E5E5E5] bg-[#FAFAF7] p-6 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#F1D2C8] border-t-veda-red" />
              <p className="mt-4 text-lg font-semibold text-veda-dark">Generating your question paper...</p>
              <p className="mt-2 text-sm text-veda-label">This may take 20-30 seconds</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] px-5 py-3 text-sm font-medium text-veda-dark transition hover:bg-[#FAFAF7]"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            ) : (
              <span />
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-veda-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#454545]"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={16} />
                Generate Paper
              </button>
            )}
          </div>
        </section>
      </form>
    </div>
  );
};
