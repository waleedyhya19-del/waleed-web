import dynamic from 'next/dynamic';

import { DetailPageSkeleton } from '@/components/shared/page-loading-skeletons';

const ReportDetailPageContent = dynamic(
  () =>
    import('@/components/reports/report-detail-page-content').then(
      (module) => module.ReportDetailPageContent
    ),
  {
    loading: () => <DetailPageSkeleton />,
  }
);

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ReportDetailPageContent id={id} />;
}
