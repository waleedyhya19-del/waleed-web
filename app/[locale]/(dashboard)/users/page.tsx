import dynamic from 'next/dynamic';

import { DirectoryPageSkeleton } from '@/components/shared/page-loading-skeletons';

const UsersPageContent = dynamic(
  () =>
    import('@/components/users/users-page-content').then(
      (module) => module.UsersPageContent
    ),
  {
    loading: () => <DirectoryPageSkeleton />,
  }
);

export default function UsersPage() {
  return <UsersPageContent />;
}
