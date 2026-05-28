import { FeaturePage } from '@/components/layout/FeaturePage';

export default function SettingsPage(): JSX.Element {
  return (
    <FeaturePage
      eyebrow="Settings"
      title="Account and workspace settings"
      description="Manage profile preferences, session details, and future app configuration from one place."
    />
  );
}