import { ReportDetailView } from '@/components/reports/report-detail-view';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetailView id={id} audience="owner" />;
}
