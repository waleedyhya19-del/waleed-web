import dynamic from 'next/dynamic';

import { DirectoryPageSkeleton } from '@/components/shared/page-loading-skeletons';

const ReportsPageContent = dynamic(
  () =>
    import('@/components/reports/reports-page-content').then(
      (module) => module.ReportsPageContent
    ),
  {
    loading: () => <DirectoryPageSkeleton />,
  }
);

export default function ReportsPage() {
  return <ReportsPageContent />;
}
