import { FeaturePage } from '@/components/layout/FeaturePage';

export default function GroupsPage(): JSX.Element {
  return (
    <FeaturePage
      eyebrow="My Groups"
      title="Class groups"
      description="Organize students, assign papers to specific classes, and keep each group's materials easy to find."
      cards={[
        'Create and manage class groups for every section you teach.',
        'Assign assessments to a specific group and keep submissions organized.',
        'Track group-wise papers, resources, and progress in one place.',
      ]}
    />
  );
}