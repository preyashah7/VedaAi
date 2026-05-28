'use client';

import { useParams } from 'next/navigation';
import { PaperOutput } from '@/components/paper/PaperOutput';

export default function AssignmentPaperPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const assignmentId = params?.id ?? '';

  return <PaperOutput assignmentId={assignmentId} />;
}
