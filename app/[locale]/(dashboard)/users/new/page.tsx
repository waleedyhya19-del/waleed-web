import dynamic from 'next/dynamic';

import { DetailPageSkeleton } from '@/components/shared/page-loading-skeletons';

const UserCreatePageContent = dynamic(
  () =>
    import('@/components/users/user-create-page-content').then(
      (module) => module.UserCreatePageContent
    ),
  {
    loading: () => <DetailPageSkeleton />,
  }
);

export default function UserCreatePage() {
  return <UserCreatePageContent />;
}
