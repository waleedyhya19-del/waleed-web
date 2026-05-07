import dynamic from 'next/dynamic';

import { DetailPageSkeleton } from '@/components/shared/page-loading-skeletons';

const ModeratorDetailPageContent = dynamic(
  () =>
    import('@/components/moderators/moderator-detail-page-content').then(
      (module) => module.ModeratorDetailPageContent
    ),
  {
    loading: () => <DetailPageSkeleton />,
  }
);

export default async function ModeratorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ModeratorDetailPageContent id={id} />;
}
