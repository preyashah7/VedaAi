'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteAssignment, fetchAssignments } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { AssignmentGrid } from '@/components/assignments/AssignmentGrid';
import { EmptyState } from '@/components/assignments/EmptyState';
import type { Assignment } from '@/types';

export default function AssignmentsPage(): JSX.Element {
  const router = useRouter();
  const assignments = useAppStore((state) => state.assignments);
  const setAssignments = useAppStore((state) => state.setAssignments);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async (): Promise<void> => {
      try {
        const data = await fetchAssignments();
        setAssignments(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load assignments');
      } finally {
        setIsLoading(false);
      }
    };

    void loadAssignments();
  }, [setAssignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const textMatch = [assignment.title, assignment.subject, assignment.schoolName, assignment.gradeLevel]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const filterMatch = filter === 'all' || assignment.status === filter;
      return textMatch && filterMatch;
    });
  }, [assignments, filter, search]);

  const handleDelete = async (assignmentId: string): Promise<void> => {
    const confirmed = window.confirm('Delete this assignment and its generated paper?');
    if (!confirmed) {
      return;
    }

    await deleteAssignment(assignmentId);
    setAssignments(assignments.filter((assignment) => (assignment.id ?? assignment._id) !== assignmentId));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-veda-dark">Assignments</h1>
        <p className="text-sm text-veda-label">Manage and create assignments for your classes.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-[#FAFAF7] px-4 py-2 text-sm text-veda-label md:w-56">
          <Filter size={16} />
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full bg-transparent outline-none">
            <option value="all">Filter By</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-[#E5E5E5] bg-[#FAFAF7] px-4 py-2 text-sm text-veda-label">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assignments"
            className="w-full bg-transparent outline-none placeholder:text-veda-label"
          />
        </div>
      </div>

      {error ? <div className="rounded-2xl bg-[#FFF6F3] px-4 py-3 text-sm text-veda-red">{error}</div> : null}

      {isLoading ? (
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-8 text-center text-sm text-veda-label shadow-soft">
          Loading assignments...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState />
      ) : (
        <AssignmentGrid assignments={filteredAssignments} onDelete={(assignmentId) => void handleDelete(assignmentId)} />
      )}

      <button
        type="button"
        onClick={() => router.push('/assignments/create')}
        className="fixed bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-veda-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)] md:hidden"
      >
        + Create Assignment
      </button>
    </div>
  );
}
