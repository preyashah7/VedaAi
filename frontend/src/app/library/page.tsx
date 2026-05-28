import { FeaturePage } from '@/components/layout/FeaturePage';

export default function LibraryPage(): JSX.Element {
  return (
    <FeaturePage
      eyebrow="My Library"
      title="Saved resources"
      description="Store source material, reference papers, and reusable prompt ideas so they are ready the next time you create an assignment."
      cards={[
        'Save source files, reference material, and past assignments here.',
        'Reuse uploaded content, paper drafts, and question sets when needed.',
        'Keep your most useful resources ready for the next assignment flow.',
      ]}
    />
  );
}