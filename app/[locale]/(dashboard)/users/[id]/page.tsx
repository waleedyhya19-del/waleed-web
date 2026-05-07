import dynamic from 'next/dynamic';

import { DetailPageSkeleton } from '@/components/shared/page-loading-skeletons';

const UserDetailPageContent = dynamic(
  () =>
    import('@/components/users/user-detail-page-content').then(
      (module) => module.UserDetailPageContent
    ),
  {
    loading: () => <DetailPageSkeleton />,
  }
);

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <UserDetailPageContent id={id} />;
}
