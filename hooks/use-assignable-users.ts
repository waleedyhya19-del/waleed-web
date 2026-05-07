'use client';

import { useAsyncResource } from '@/hooks/use-async-resource';
import { usersApi } from '@/lib/api/users';
import { Role, ReportCategory, User } from '@/lib/api/types';
import { fetchAllPages } from '@/lib/api/pagination';

export function useAssignableUsers(
  reportCategory?: ReportCategory,
): { assignableUsers: User[] | undefined } {
  const isLawyerScope = reportCategory === ReportCategory.LAWYER_REQUEST;
  const cacheKey = isLawyerScope
    ? 'assignable-users:lawyer'
    : 'assignable-users:moderator';

  const { data } = useAsyncResource(
    async () =>
      fetchAllPages(async (params) => {
        const adminResult = await usersApi.list({ ...params, role: Role.ADMIN });
        const secondaryRole = isLawyerScope ? Role.LAWYER : Role.MODERATOR;
        const secondaryResult = await usersApi.list({
          ...params,
          role: secondaryRole,
        });

        const combined = [
          ...(adminResult.data || []),
          ...(secondaryResult.data || []),
        ];
        const uniqueById = combined.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id),
        );

        return {
          statusCode: 200,
          data: uniqueById,
          meta: {
            hasMore: adminResult.meta.hasMore || secondaryResult.meta.hasMore,
            nextCursor:
              adminResult.meta.nextCursor || secondaryResult.meta.nextCursor,
          },
        };
      }),
    [isLawyerScope],
    {
      cacheKey,
      staleTimeMs: 60_000,
    },
  );

  return { assignableUsers: data ?? undefined };
}
