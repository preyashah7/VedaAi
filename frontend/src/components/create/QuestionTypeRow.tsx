import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ChevronDown, Minus, Plus, Trash2 } from 'lucide-react';
import type { QuestionType } from '@/types';
import type { CreateAssignmentFormValues } from './CreateForm';

interface QuestionTypeRowProps {
  index: number;
  register: UseFormRegister<CreateAssignmentFormValues>;
  watch: UseFormWatch<CreateAssignmentFormValues>;
  setValue: UseFormSetValue<CreateAssignmentFormValues>;
  onRemove: (index: number) => void;
  questionTypes: QuestionType[];
}

const questionTypeOptions = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Essay Questions',
];

export const QuestionTypeRow = ({ index, register, watch, setValue, onRemove, questionTypes }: QuestionTypeRowProps): JSX.Element => {
  const currentRow = questionTypes[index];
  const count = watch(`questionTypes.${index}.count`);
  const marks = watch(`questionTypes.${index}.marks`);

  const updateValue = (key: 'count' | 'marks', delta: number): void => {
    const nextValue = Math.max(1, Number((key === 'count' ? count : marks) ?? 1) + delta);
    setValue(`questionTypes.${index}.${key}`, nextValue, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-[#E5E5E5] bg-[#FAFAF7] p-4 md:grid-cols-[1.6fr_auto_auto_auto] md:items-center">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-veda-label">Question Type</label>
        <div className="relative">
          <select
            {...register(`questionTypes.${index}.type`)}
            className="w-full appearance-none rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 pr-10 text-sm text-veda-dark outline-none transition focus:border-veda-red"
          >
            {questionTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-veda-label" size={16} />
        </div>
      </div>

      <div className="md:pt-6">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-veda-red transition hover:bg-[#FFF6F3]"
          aria-label="Delete question type"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-veda-label">No. of Questions</label>
        <div className="flex items-center rounded-full border border-[#D9D9D9] bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => updateValue('count', -1)}
            className="grid h-10 w-10 place-items-center rounded-full text-veda-dark transition hover:bg-[#F3F3F3]"
          >
            <Minus size={14} />
          </button>
          <div className="min-w-12 px-2 text-center text-sm font-semibold text-veda-dark">{currentRow?.count ?? count ?? 1}</div>
          <button
            type="button"
            onClick={() => updateValue('count', 1)}
            className="grid h-10 w-10 place-items-center rounded-full text-veda-dark transition hover:bg-[#F3F3F3]"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-veda-label">Marks</label>
        <div className="flex items-center rounded-full border border-[#D9D9D9] bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => updateValue('marks', -1)}
            className="grid h-10 w-10 place-items-center rounded-full text-veda-dark transition hover:bg-[#F3F3F3]"
          >
            <Minus size={14} />
          </button>
          <div className="min-w-12 px-2 text-center text-sm font-semibold text-veda-dark">{currentRow?.marks ?? marks ?? 1}</div>
          <button
            type="button"
            onClick={() => updateValue('marks', 1)}
            className="grid h-10 w-10 place-items-center rounded-full text-veda-dark transition hover:bg-[#F3F3F3]"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

    </div>
  );
};
