import {
  DashboardSummary,
  Report,
  ReportStatus,
  Role,
  User,
} from '@/lib/api/types';

export interface DailyReportPoint {
  date: string;
  total: number;
}

export function createEmptyStatusCounts(): Record<ReportStatus, number> {
  return {
    [ReportStatus.RECEIVED]: 0,
    [ReportStatus.REVIEWING]: 0,
    [ReportStatus.ESCALATED]: 0,
    [ReportStatus.REJECTED]: 0,
    [ReportStatus.RESOLVED]: 0,
    [ReportStatus.CLOSED]: 0,
  };
}

export function buildReportStatusCounts(reports: Report[]) {
  return reports.reduce((counts, report) => {
    counts[report.status] += 1;
    return counts;
  }, createEmptyStatusCounts());
}

export function buildRecentReports(reports: Report[], count = 6) {
  return [...reports]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
    .slice(0, count);
}

export function buildDailyReportTrend(reports: Report[], days = 14) {
  const points = new Map<string, number>();
  const today = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    points.set(key, 0);
  }

  reports.forEach((report) => {
    const key = new Date(report.createdAt).toISOString().slice(0, 10);

    if (!points.has(key)) {
      return;
    }

    points.set(key, (points.get(key) || 0) + 1);
  });

  return [...points.entries()].map(([date, total]) => ({ date, total }));
}

export function buildDashboardSummary(
  reports: Report[],
  users: User[]
): DashboardSummary {
  return {
    reportsByStatus: buildReportStatusCounts(reports),
    totalUsers: users.filter((user) => user.role === Role.END_USER).length,
    totalModerators: users.filter((user) => user.role === Role.MODERATOR).length,
    recentReports: buildRecentReports(reports, 6),
  };
}

export function buildOpenReportCount(reports: Report[]) {
  return reports.filter(
    (report) =>
      ![ReportStatus.RESOLVED, ReportStatus.REJECTED, ReportStatus.CLOSED].includes(
        report.status
      )
  ).length;
}

export function buildEscalatedReportCount(reports: Report[]) {
  return reports.filter((report) => report.status === ReportStatus.ESCALATED)
    .length;
}

export function buildSolvedRate(reports: Report[]) {
  if (reports.length === 0) {
    return 0;
  }

  const solvedCount = reports.filter((report) =>
    [ReportStatus.RESOLVED, ReportStatus.CLOSED].includes(report.status)
  ).length;

  return Math.round((solvedCount / reports.length) * 100);
}
