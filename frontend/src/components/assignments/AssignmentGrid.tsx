import type { Assignment } from '@/types';
import { AssignmentCard } from './AssignmentCard';

interface AssignmentGridProps {
  assignments: Assignment[];
  onDelete: (assignmentId: string) => void;
}

export const AssignmentGrid = ({ assignments, onDelete }: AssignmentGridProps): JSX.Element => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id ?? assignment._id} assignment={assignment} onDelete={onDelete} />
      ))}
    </div>
  );
};
