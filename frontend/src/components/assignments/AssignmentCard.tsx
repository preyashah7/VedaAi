'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EllipsisVertical, Eye, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (assignmentId: string) => void;
}

export const AssignmentCard = ({ assignment, onDelete }: AssignmentCardProps): JSX.Element => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const assignmentId = assignment.id ?? assignment._id ?? '';
  const createdAtLabel = assignment.createdAt ? format(parseISO(assignment.createdAt), 'dd-MM-yyyy') : '--';
  const dueDateLabel = assignment.dueDate ? format(parseISO(assignment.dueDate), 'dd-MM-yyyy') : '--';
  const isProcessing = assignment.status === 'processing';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => {
        setMenuOpen(false);
        router.push(`/assignments/${assignmentId}/paper`);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          router.push(`/assignments/${assignmentId}/paper`);
        }
      }}
      className="relative cursor-pointer rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="absolute right-4 top-4 flex items-center gap-3">
        {isProcessing ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF3EA] px-3 py-1 text-[11px] font-medium text-veda-orange">
            <span className="h-2 w-2 animate-pulse rounded-full bg-veda-orange" />
            Generating...
          </span>
        ) : (
          <span className="rounded-full bg-[#F3F3F3] px-3 py-1 text-[11px] font-medium text-veda-label">
            {assignment.status}
          </span>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((value) => !value);
          }}
          className="grid h-8 w-8 place-items-center rounded-full border border-transparent text-veda-label transition hover:bg-[#F5F5F0]"
          aria-label="Open assignment actions"
        >
          <EllipsisVertical size={16} />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-lg">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                router.push(`/assignments/${assignmentId}/paper`);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-veda-dark hover:bg-[#FAFAF7]"
            >
              <Eye size={16} />
              View Assignment
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(assignmentId);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-veda-red hover:bg-[#FFF6F3]"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <div className="pr-24">
        <h3 className="text-base font-semibold text-veda-dark">{assignment.title}</h3>
        <div className="mt-4 space-y-1 text-[13px] text-veda-label">
          <p>Assigned on: {createdAtLabel}</p>
          <p>Due: {dueDateLabel}</p>
          <p>{assignment.schoolName}</p>
        </div>
      </div>
    </article>
  );
};
