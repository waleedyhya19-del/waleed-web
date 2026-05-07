import dynamic from 'next/dynamic';

import { DetailPageSkeleton } from '@/components/shared/page-loading-skeletons';

const ModeratorCreatePageContent = dynamic(
  () =>
    import('@/components/moderators/moderator-create-page-content').then(
      (module) => module.ModeratorCreatePageContent
    ),
  {
    loading: () => <DetailPageSkeleton />,
  }
);

export default function ModeratorCreatePage() {
  return <ModeratorCreatePageContent />;
}
