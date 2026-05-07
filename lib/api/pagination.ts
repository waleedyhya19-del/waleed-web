import { PaginatedResponse } from '@/lib/api/types';

interface CursorParams {
  cursor?: string;
  take?: number;
}

interface FetchAllPagesOptions {
  maxPages?: number;
  pageSize?: number;
}

export async function fetchAllPages<T, P extends CursorParams>(
  fetchPage: (params?: P) => Promise<PaginatedResponse<T>>,
  params?: Omit<P, 'cursor' | 'take'>,
  options: FetchAllPagesOptions = {}
) {
  const pageSize = options.pageSize ?? 100;
  const maxPages = options.maxPages ?? 12;
  const items: T[] = [];
  let cursor: string | undefined;
  let pageCount = 0;

  while (pageCount < maxPages) {
    const response = await fetchPage({
      ...(params || {}),
      cursor,
      take: pageSize,
    } as P);

    items.push(...response.data);
    pageCount += 1;

    if (!hasMorePages(response.meta) || !response.meta.nextCursor) {
      break;
    }

    cursor = response.meta.nextCursor;
  }

  return items;
}

export function hasMorePages(
  meta: PaginatedResponse<unknown>['meta']
) {
  return meta.hasMore ?? meta.hasNextPage ?? false;
}
