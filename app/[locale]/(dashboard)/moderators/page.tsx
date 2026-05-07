import dynamic from 'next/dynamic';

import { DirectoryPageSkeleton } from '@/components/shared/page-loading-skeletons';

const ModeratorsPageContent = dynamic(
  () =>
    import('@/components/moderators/moderators-page-content').then(
      (module) => module.ModeratorsPageContent
    ),
  {
    loading: () => <DirectoryPageSkeleton />,
  }
);

export default function ModeratorsPage() {
  return <ModeratorsPageContent />;
}
