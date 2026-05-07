import { Page, Route } from '@playwright/test';

import {
  Language,
  Report,
  ReportCategory,
  ReportPhotoCategory,
  ReportStatus,
  ReportType,
  Role,
  User,
} from '../../lib/api/types';

const ACCESS_TOKEN = 'playwright-access-token';
const REFRESH_TOKEN = 'playwright-refresh-token';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const API_PREFIX = new URL(API_BASE_URL).pathname;
const API_MATCHER = new RegExp(`^${escapeRegExp(API_BASE_URL)}(?:/.*)?$`);
const SVG_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23dbeafe'/%3E%3Ccircle cx='120' cy='120' r='64' fill='%230ea5e9' fill-opacity='0.18'/%3E%3Ctext x='120' y='132' text-anchor='middle' font-size='24' font-family='Arial' fill='%230f172a'%3EEvidence%3C/text%3E%3C/svg%3E";

type MockError = {
  statusCode: number;
  error: string;
  message: string;
  code?: string;
  category?: string;
};

type MockApiOptions = {
  currentUser?: User;
  users?: User[];
  reports?: Report[];
  authMeError?: MockError;
  loginError?: MockError;
  forgotPasswordError?: MockError;
  logoutError?: MockError;
  updateMeError?: MockError;
  changePasswordError?: MockError;
};

type MockApiState = {
  currentUser: User;
  users: User[];
  reports: Report[];
  accessToken: string;
  refreshToken: string;
  refreshCount: number;
};

const baseUsers = {
  admin: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@mobili.test',
    displayName: 'Nora Admin',
    phone: '+201000000001',
    role: Role.ADMIN,
    preferredLanguage: Language.EN,
    profilePhotoUrl: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-10T09:30:00.000Z',
  },
  moderator: {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'moderator@mobili.test',
    displayName: 'Karim Moderator',
    phone: '+201000000002',
    role: Role.MODERATOR,
    preferredLanguage: Language.EN,
    profilePhotoUrl: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2026-03-02T09:00:00.000Z',
    updatedAt: '2026-03-10T09:00:00.000Z',
  },
  ali: {
    id: '00000000-0000-4000-8000-000000000101',
    email: 'ali.owner@mobili.test',
    displayName: 'Ali Hassan',
    phone: '+201011111111',
    role: Role.END_USER,
    preferredLanguage: Language.AR,
    profilePhotoUrl: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2026-03-03T10:00:00.000Z',
    updatedAt: '2026-03-10T10:00:00.000Z',
  },
  mariam: {
    id: '00000000-0000-4000-8000-000000000102',
    email: 'mariam.owner@mobili.test',
    displayName: 'Mariam Noor',
    phone: '+201022222222',
    role: Role.END_USER,
    preferredLanguage: Language.EN,
    profilePhotoUrl: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2026-03-04T11:00:00.000Z',
    updatedAt: '2026-03-10T11:00:00.000Z',
  },
  omar: {
    id: '00000000-0000-4000-8000-000000000103',
    email: 'omar.owner@mobili.test',
    displayName: 'Omar Saleh',
    phone: '+201033333333',
    role: Role.END_USER,
    preferredLanguage: Language.AR,
    profilePhotoUrl: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2026-03-05T12:00:00.000Z',
    updatedAt: '2026-03-10T12:00:00.000Z',
  },
} satisfies Record<string, User>;

export const testUsers = cloneObject(baseUsers);

function buildDefaultReports(users: typeof testUsers): Report[] {
  return [
    {
      id: '11111111-1111-4111-8111-111111111111',
      userId: users.ali.id,
      type: ReportType.LOST,
      reportCategory: ReportCategory.BASIC,
      imei1: '111111111111111',
      imei2: null,
      phoneBrand: 'Apple',
      phoneModel: 'iPhone 15 Pro',
      lastPhoneNumber1: '+201011111111',
      lastPhoneNumber2: null,
      description: 'White device with a cracked screen near Tahrir Square.',
      lossDate: '2026-03-10T00:00:00.000Z',
      lossArea: 'Downtown Cairo',
      lossAddress: null,
      reporterFullName: null,
      witnessFullName: null,
      witnessLocation: null,
      contactPhoneNumber: null,
      paymentPhoneNumber: null,
      depositAmount: null,
      status: ReportStatus.RECEIVED,
      assignedToId: null,
      assignedModerator: { id: null, displayName: null, assignedAt: null },
      assignedAt: null,
      isDeleted: false,
      createdAt: '2026-03-10T07:15:00.000Z',
      updatedAt: '2026-03-10T07:15:00.000Z',
      user: users.ali,
      photos: [
        {
          id: 'photo-1111',
          reportId: '11111111-1111-4111-8111-111111111111',
          category: ReportPhotoCategory.PHONE_BOX,
          url: SVG_PLACEHOLDER,
          createdAt: '2026-03-10T07:15:00.000Z',
        },
      ],
      notes: [],
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      userId: users.mariam.id,
      type: ReportType.STOLEN,
      reportCategory: ReportCategory.BASIC,
      imei1: '222222222222222',
      imei2: null,
      phoneBrand: 'Samsung',
      phoneModel: 'Galaxy S24 Ultra',
      lastPhoneNumber1: '+201022222222',
      lastPhoneNumber2: null,
      description: 'Black device reported stolen from a parked car.',
      lossDate: '2026-03-09T00:00:00.000Z',
      lossArea: 'Heliopolis',
      lossAddress: null,
      reporterFullName: null,
      witnessFullName: null,
      witnessLocation: null,
      contactPhoneNumber: null,
      paymentPhoneNumber: null,
      depositAmount: null,
      status: ReportStatus.REVIEWING,
      assignedToId: null,
      assignedModerator: { id: null, displayName: null, assignedAt: null },
      assignedAt: null,
      isDeleted: false,
      createdAt: '2026-03-09T13:45:00.000Z',
      updatedAt: '2026-03-10T08:10:00.000Z',
      user: users.mariam,
      photos: [],
      notes: [],
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      userId: users.omar.id,
      type: ReportType.LOST,
      reportCategory: ReportCategory.BASIC,
      imei1: '333333333333333',
      imei2: null,
      phoneBrand: 'Xiaomi',
      phoneModel: 'Redmi Note 13',
      lastPhoneNumber1: '+201033333333',
      lastPhoneNumber2: null,
      description: 'Blue device lost after a taxi ride.',
      lossDate: '2026-03-08T00:00:00.000Z',
      lossArea: 'New Cairo',
      lossAddress: null,
      reporterFullName: null,
      witnessFullName: null,
      witnessLocation: null,
      contactPhoneNumber: null,
      paymentPhoneNumber: null,
      depositAmount: null,
      status: ReportStatus.ESCALATED,
      assignedToId: null,
      assignedModerator: { id: null, displayName: null, assignedAt: null },
      assignedAt: null,
      isDeleted: false,
      createdAt: '2026-03-08T16:20:00.000Z',
      updatedAt: '2026-03-10T06:30:00.000Z',
      user: users.omar,
      photos: [],
      notes: [],
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      userId: users.ali.id,
      type: ReportType.STOLEN,
      reportCategory: ReportCategory.BASIC,
      imei1: '444444444444444',
      imei2: null,
      phoneBrand: 'Google',
      phoneModel: 'Pixel 8 Pro',
      lastPhoneNumber1: '+201044444444',
      lastPhoneNumber2: null,
      description: 'Resolved after matching the serial number.',
      lossDate: '2026-03-07T00:00:00.000Z',
      lossArea: 'Maadi',
      lossAddress: null,
      reporterFullName: null,
      witnessFullName: null,
      witnessLocation: null,
      contactPhoneNumber: null,
      paymentPhoneNumber: null,
      depositAmount: null,
      status: ReportStatus.RESOLVED,
      assignedToId: null,
      assignedModerator: { id: null, displayName: null, assignedAt: null },
      assignedAt: null,
      isDeleted: false,
      createdAt: '2026-03-07T09:10:00.000Z',
      updatedAt: '2026-03-10T05:30:00.000Z',
      user: users.ali,
      photos: [],
      notes: [],
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      userId: users.mariam.id,
      type: ReportType.LOST,
      reportCategory: ReportCategory.BASIC,
      imei1: '555555555555555',
      imei2: null,
      phoneBrand: 'OnePlus',
      phoneModel: '12',
      lastPhoneNumber1: '+201055555555',
      lastPhoneNumber2: null,
      description: 'Case closed after owner recovery confirmation.',
      lossDate: '2026-03-06T00:00:00.000Z',
      lossArea: 'Zamalek',
      lossAddress: null,
      reporterFullName: null,
      witnessFullName: null,
      witnessLocation: null,
      contactPhoneNumber: null,
      paymentPhoneNumber: null,
      depositAmount: null,
      status: ReportStatus.CLOSED,
      assignedToId: null,
      assignedModerator: { id: null, displayName: null, assignedAt: null },
      assignedAt: null,
      isDeleted: false,
      createdAt: '2026-03-06T14:05:00.000Z',
      updatedAt: '2026-03-09T12:00:00.000Z',
      user: users.mariam,
      photos: [],
      notes: [],
    },
  ];
}

export const testReports = buildDefaultReports(testUsers);

export async function mockAuthenticatedApp(
  page: Page,
  options: MockApiOptions = {}
) {
  await page.addInitScript(
    ({ accessToken, refreshToken }) => {
      window.localStorage.setItem('accessToken', accessToken);
      window.localStorage.setItem('refreshToken', refreshToken);
    },
    {
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN,
    }
  );

  return mockAppApi(page, options);
}

export async function mockPublicApp(
  page: Page,
  options: MockApiOptions = {}
) {
  await page.addInitScript(() => {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
  });

  return mockAppApi(page, options);
}

export async function mockAppApi(
  page: Page,
  options: MockApiOptions = {}
): Promise<MockApiState> {
  const state = buildState(options);

  await page.route(API_MATCHER, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const endpoint = url.pathname.slice(API_PREFIX.length) || '/';
    const method = request.method();

    if (method === 'POST' && endpoint === '/auth/login') {
      if (options.loginError) {
        return fulfillApiError(route, options.loginError);
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: {
          accessToken: ACCESS_TOKEN,
          refreshToken: REFRESH_TOKEN,
          expiresIn: 3600,
          tokenType: 'bearer',
          user: state.currentUser,
        },
      });
    }

    if (method === 'POST' && endpoint === '/auth/refresh') {
      const payload = readJsonBody(request.postData()) as {
        refreshToken?: string;
      };

      if (payload.refreshToken !== state.refreshToken) {
        return fulfillApiError(route, {
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid refresh token.',
        });
      }

      state.refreshCount += 1;
      state.accessToken = `${ACCESS_TOKEN}-refreshed-${state.refreshCount}`;
      state.refreshToken = `${REFRESH_TOKEN}-rotated-${state.refreshCount}`;

      return fulfillJson(route, {
        statusCode: 200,
        data: {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        },
      });
    }

    if (requiresAuth(endpoint, method) && !hasValidAccessToken(request, state)) {
      return fulfillApiError(route, {
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      });
    }

    if (
      method === 'GET' &&
      (endpoint === '/auth/me' || endpoint === '/users/me')
    ) {
      if (options.authMeError) {
        return fulfillApiError(route, options.authMeError);
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: state.currentUser,
      });
    }

    if (method === 'POST' && endpoint === '/auth/forgot-password') {
      if (options.forgotPasswordError) {
        return fulfillApiError(route, options.forgotPasswordError);
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: {
          message: 'Password reset link sent to your email',
        },
      });
    }

    if (method === 'POST' && endpoint === '/auth/logout') {
      if (options.logoutError) {
        return fulfillApiError(route, options.logoutError);
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: {
          message: 'Logged out successfully.',
        },
      });
    }

    if (method === 'POST' && endpoint === '/auth/change-password') {
      if (options.changePasswordError) {
        return fulfillApiError(route, options.changePasswordError);
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: state.currentUser,
      });
    }

    if (method === 'GET' && endpoint === '/users') {
      return fulfillJson(route, paginateUsers(state.users, url.searchParams));
    }

    if (method === 'POST' && endpoint === '/users') {
      const payload = readJsonBody(request.postData()) as {
        email?: string;
        displayName?: string;
        phone?: string;
        role?: Role;
        preferredLanguage?: Language;
      };
      const nextUser: User = {
        id: buildMockId('user', state.users.length + 200),
        email: payload.email ?? `created-${state.users.length}@mobili.test`,
        displayName: payload.displayName ?? 'Created User',
        phone: payload.phone ?? null,
        role: payload.role ?? Role.END_USER,
        preferredLanguage: payload.preferredLanguage ?? Language.AR,
        profilePhotoUrl: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        isDeleted: false,
        createdAt: '2026-03-11T10:30:00.000Z',
        updatedAt: '2026-03-11T10:30:00.000Z',
      };

      state.users.unshift(nextUser);

      return fulfillJson(
        route,
        {
          statusCode: 201,
          data: nextUser,
        },
        201
      );
    }

    if (method === 'PATCH' && endpoint === '/users/me') {
      if (options.updateMeError) {
        return fulfillApiError(route, options.updateMeError);
      }

      const payload = readJsonBody(request.postData());
      state.currentUser = {
        ...state.currentUser,
        ...payload,
        updatedAt: '2026-03-11T09:45:00.000Z',
      };
      state.users = state.users.map((user) =>
        user.id === state.currentUser.id ? state.currentUser : user
      );

      return fulfillJson(route, {
        statusCode: 200,
        data: state.currentUser,
      });
    }

    if (method === 'PATCH' && endpoint.startsWith('/users/')) {
      const id = endpoint.replace('/users/', '');
      const payload = readJsonBody(request.postData());
      const user = state.users.find((item) => item.id === id);

      if (!user) {
        return fulfillApiError(route, {
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found.',
        });
      }

      Object.assign(user, payload, {
        updatedAt: '2026-03-11T10:45:00.000Z',
      });

      if (state.currentUser.id === user.id) {
        state.currentUser = cloneObject(user);
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: user,
      });
    }

    if (method === 'DELETE' && endpoint.startsWith('/users/')) {
      const id = endpoint.replace('/users/', '');
      state.users = state.users.filter((item) => item.id !== id);
      state.reports = state.reports.filter((report) => report.userId !== id);

      return fulfillJson(route, {
        statusCode: 200,
        data: {
          message: 'User deleted successfully.',
        },
      });
    }

    if (method === 'GET' && endpoint.startsWith('/users/')) {
      const id = endpoint.replace('/users/', '');
      const user = state.users.find((item) => item.id === id);

      if (!user) {
        return fulfillApiError(route, {
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found.',
        });
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: user,
      });
    }

    if (method === 'GET' && endpoint === '/reports') {
      return fulfillJson(route, paginate(state.reports, url.searchParams));
    }

    if (method === 'POST' && endpoint === '/reports') {
      const owner =
        state.users.find((item) => item.role === Role.END_USER) ?? state.users[0];
      const report: Report = {
        id: buildMockId('report', state.reports.length + 700),
        userId: owner.id,
        type: ReportType.LOST,
        reportCategory: ReportCategory.BASIC,
        imei1: `9000000000000${String(state.reports.length).padStart(2, '0')}`,
        imei2: null,
        phoneBrand: 'Apple',
        phoneModel: 'iPhone 15',
        lastPhoneNumber1: owner.phone ?? '+201099999999',
        lastPhoneNumber2: null,
        description: 'Created from the admin dashboard.',
        lossDate: '2026-03-11T00:00:00.000Z',
        lossArea: null,
        lossAddress: null,
        reporterFullName: null,
        witnessFullName: null,
        witnessLocation: null,
        contactPhoneNumber: null,
        paymentPhoneNumber: null,
        depositAmount: null,
        status: ReportStatus.RECEIVED,
        assignedToId: null,
        assignedModerator: { id: null, displayName: null, assignedAt: null },
        assignedAt: null,
        isDeleted: false,
        createdAt: '2026-03-11T11:00:00.000Z',
        updatedAt: '2026-03-11T11:00:00.000Z',
        user: {
          id: owner.id,
          displayName: owner.displayName,
          email: owner.email,
          phone: owner.phone,
        },
        photos: [
          {
            id: buildMockId('photo', state.reports.length + 900),
            reportId: buildMockId('report', state.reports.length + 700),
            category: ReportPhotoCategory.PHONE_BOX,
            url: SVG_PLACEHOLDER,
            createdAt: '2026-03-11T11:00:00.000Z',
          },
        ],
        notes: [],
      };

      if (report.photos?.[0]) {
        report.photos[0].reportId = report.id;
      }

      state.reports.unshift(report);

      return fulfillJson(
        route,
        {
          statusCode: 201,
          data: report,
        },
        201
      );
    }

    if (method === 'PATCH' && endpoint.startsWith('/reports/') && !endpoint.endsWith('/status')) {
      const id = endpoint.replace('/reports/', '');
      const payload = readJsonBody(request.postData());
      const report = state.reports.find((item) => item.id === id);

      if (!report) {
        return fulfillApiError(route, {
          statusCode: 404,
          error: 'Not Found',
          message: 'Report not found.',
        });
      }

      Object.assign(report, payload, {
        updatedAt: '2026-03-11T11:10:00.000Z',
      });

      return fulfillJson(route, {
        statusCode: 200,
        data: report,
      });
    }

    if (method === 'PATCH' && endpoint.endsWith('/status')) {
      const id = endpoint.replace('/reports/', '').replace('/status', '');
      const payload = readJsonBody(request.postData()) as {
        status?: ReportStatus;
      };
      const report = state.reports.find((item) => item.id === id);

      if (!report || !payload.status) {
        return fulfillApiError(route, {
          statusCode: 404,
          error: 'Not Found',
          message: 'Report not found.',
        });
      }

      report.status = payload.status;
      report.updatedAt = '2026-03-11T10:15:00.000Z';

      return fulfillJson(route, {
        statusCode: 200,
        data: report,
      });
    }

    if (method === 'DELETE' && endpoint.startsWith('/reports/')) {
      const id = endpoint.replace('/reports/', '');
      state.reports = state.reports.filter((item) => item.id !== id);

      return fulfillJson(route, {
        statusCode: 200,
        data: {
          message: 'Report deleted successfully.',
        },
      });
    }

    if (method === 'GET' && endpoint.startsWith('/reports/')) {
      const id = endpoint.replace('/reports/', '');
      const report = state.reports.find((item) => item.id === id);

      if (!report) {
        return fulfillApiError(route, {
          statusCode: 404,
          error: 'Not Found',
          message: 'Report not found.',
        });
      }

      return fulfillJson(route, {
        statusCode: 200,
        data: report,
      });
    }

    return fulfillApiError(route, {
      statusCode: 404,
      error: 'Not Found',
      message: `Unhandled mock endpoint: ${method} ${endpoint}`,
    });
  });

  return state;
}

function buildState(options: MockApiOptions): MockApiState {
  const currentUser = cloneObject(options.currentUser ?? testUsers.admin);
  const users: User[] = cloneObject(options.users ?? Object.values(testUsers));
  const reports = cloneObject(options.reports ?? testReports);

  if (!users.some((user) => user.id === currentUser.id)) {
    users.unshift(currentUser);
  }

  return {
    currentUser,
    users,
    reports,
    accessToken: ACCESS_TOKEN,
    refreshToken: REFRESH_TOKEN,
    refreshCount: 0,
  };
}

function paginateUsers(data: User[], searchParams: URLSearchParams) {
  const role = searchParams.get('role');
  const search = searchParams.get('search')?.trim().toLowerCase();
  const filteredUsers = data.filter((user) => {
    if (role && user.role !== role) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [user.displayName, user.email, user.phone]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });

  return paginate(filteredUsers, searchParams);
}

function paginate<T extends { id: string }>(
  data: T[],
  searchParams?: URLSearchParams
) {
  const take = resolveTake(searchParams?.get('take'));
  const cursor = searchParams?.get('cursor');
  const cursorIndex = cursor
    ? data.findIndex((item) => item.id === cursor)
    : -1;
  const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  const pageData = data.slice(startIndex, startIndex + take);
  const hasMore = startIndex + take < data.length;

  return {
    statusCode: 200,
    data: pageData,
    meta: {
      hasMore,
      hasNextPage: hasMore,
      nextCursor: hasMore ? (pageData[pageData.length - 1]?.id ?? null) : null,
    },
  };
}

function resolveTake(value: string | null | undefined) {
  const parsed = Number.parseInt(value ?? '20', 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return 20;
  }

  return Math.min(parsed, 100);
}

function requiresAuth(endpoint: string, method: string) {
  if (endpoint.startsWith('/users') || endpoint.startsWith('/reports')) {
    return true;
  }

  if (method === 'POST' && endpoint === '/auth/change-password') {
    return true;
  }

  if (method === 'POST' && endpoint === '/auth/logout') {
    return true;
  }

  if (
    method === 'PATCH' &&
    (endpoint === '/users/me' || endpoint.endsWith('/status'))
  ) {
    return true;
  }

  if (method !== 'GET') {
    return false;
  }

  return endpoint === '/auth/me';
}

function hasValidAccessToken(
  request: ReturnType<Route['request']>,
  state: MockApiState
) {
  return request.headers().authorization === `Bearer ${state.accessToken}`;
}

function readJsonBody(payload: string | null) {
  if (!payload) {
    return {};
  }

  return JSON.parse(payload) as Record<string, unknown>;
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function buildMockId(prefix: 'user' | 'report' | 'photo', value: number) {
  const suffix = String(value).padStart(12, '0');

  if (prefix === 'user') {
    return `90000000-0000-4000-8000-${suffix}`;
  }

  if (prefix === 'report') {
    return `91000000-0000-4000-8000-${suffix}`;
  }

  return `92000000-0000-4000-8000-${suffix}`;
}

async function fulfillApiError(route: Route, error: MockError) {
  const url = new URL(route.request().url());

  await route.fulfill({
    status: error.statusCode,
    contentType: 'application/json',
    body: JSON.stringify({
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
      code: error.code ?? inferErrorCode(error.statusCode),
      category: error.category ?? inferErrorCategory(error.statusCode),
      details: null,
      correlationId: 'playwright-correlation-id',
      timestamp: '2026-03-11T09:00:00.000Z',
      path: url.pathname.slice(API_PREFIX.length) || '/',
      method: route.request().method(),
    }),
  });
}

function inferErrorCode(statusCode: number) {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'AUTHENTICATION_FAILED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'RESOURCE_NOT_FOUND';
    case 409:
      return 'RESOURCE_CONFLICT';
    default:
      return statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED';
  }
}

function inferErrorCategory(statusCode: number) {
  switch (statusCode) {
    case 400:
      return 'REQUEST';
    case 401:
      return 'AUTHENTICATION';
    case 403:
      return 'AUTHORIZATION';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    default:
      return statusCode >= 500 ? 'INTERNAL' : 'REQUEST';
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cloneObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
