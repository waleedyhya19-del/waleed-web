import dynamic from 'next/dynamic';

import { SettingsPageSkeleton } from '@/components/shared/page-loading-skeletons';

const SettingsPageContent = dynamic(
  () =>
    import('@/components/settings/settings-page-content').then(
      (module) => module.SettingsPageContent
    ),
  {
    loading: () => <SettingsPageSkeleton />,
  }
);

export default function SettingsPage() {
  return <SettingsPageContent />;
}
