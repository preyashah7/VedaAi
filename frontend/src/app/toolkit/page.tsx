import { FeaturePage } from '@/components/layout/FeaturePage';

export default function ToolkitPage(): JSX.Element {
  return (
    <FeaturePage
      eyebrow="AI Teacher's Toolkit"
      title="Teaching utilities"
      description="Quick tools for preparing classroom content, generating ideas, and extending your assessment workflow."
      cards={[
        'Generate lesson ideas, prompts, and classroom activities with AI.',
        'Build question banks, rubrics, and planning notes for faster prep.',
        'Use the toolkit as a launchpad for future teacher productivity tools.',
      ]}
    />
  );
}