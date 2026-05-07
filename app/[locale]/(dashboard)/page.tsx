import dynamic from 'next/dynamic';

import { DashboardOverviewSkeleton } from '@/components/shared/page-loading-skeletons';

const DashboardOverview = dynamic(
  () =>
    import('@/components/dashboard/dashboard-overview').then(
      (module) => module.DashboardOverview
    ),
  {
    loading: () => <DashboardOverviewSkeleton />,
  }
);

export default function DashboardPage() {
  return <DashboardOverview />;
}
