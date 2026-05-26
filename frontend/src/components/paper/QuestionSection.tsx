import { DifficultyBadge } from './DifficultyBadge';
import type { GeneratedSection } from '@/types';

interface QuestionSectionProps {
  section: GeneratedSection;
}

export const QuestionSection = ({ section }: QuestionSectionProps): JSX.Element => {
  return (
    <section className="mb-8">
      <h3 className="text-center text-base font-semibold uppercase text-veda-dark underline decoration-veda-dark decoration-1 underline-offset-4">
        {section.title}
      </h3>
      <p className="mt-2 text-center text-sm italic text-veda-label">{section.instruction}</p>

      <div className="mt-5 space-y-5">
        {section.questions.map((question) => (
          <article key={`${section.title}-${question.number}`} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <p className="flex-1 text-[15px] leading-7 text-veda-dark">
                <span className="font-semibold">{question.number}.</span> {question.text}
              </p>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <DifficultyBadge difficulty={question.difficulty} />
                <span className="rounded-full bg-[#F0F0F0] px-3 py-0.5 text-[11px] font-semibold text-veda-dark">
                  {question.marks} M
                </span>
              </div>
            </div>

            {question.options?.length ? (
              <div className="ml-6 grid gap-2 text-sm text-veda-dark">
                {question.options.map((option, index) => (
                  <div key={option} className="flex gap-2">
                    <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                    <span>{option.replace(/^[A-D]\.?\s*/, '')}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-8 border-b border-dashed border-[#D9D9D9]" />
    </section>
  );
};
