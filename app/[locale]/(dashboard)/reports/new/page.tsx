import dynamic from 'next/dynamic';

import { DetailPageSkeleton } from '@/components/shared/page-loading-skeletons';

const ReportCreatePageContent = dynamic(
  () =>
    import('@/components/reports/report-create-page-content').then(
      (module) => module.ReportCreatePageContent
    ),
  {
    loading: () => <DetailPageSkeleton />,
  }
);

export default function ReportCreatePage() {
  return <ReportCreatePageContent />;
}
