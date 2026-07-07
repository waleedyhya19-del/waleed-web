export const Role = {
  END_USER: 'END_USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
  LAWYER: 'LAWYER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ReportType = {
  LOST: 'LOST',
  STOLEN: 'STOLEN',
  FOUND: 'FOUND',
  INTENT_TO_PURCHASE: 'INTENT_TO_PURCHASE',
} as const;
export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export const ReportStatus = {
  RECEIVED: 'RECEIVED',
  REVIEWING: 'REVIEWING',
  ESCALATED: 'ESCALATED',
  REJECTED: 'REJECTED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ReportCategory = {
  BASIC: 'BASIC',
  LAWYER_REQUEST: 'LAWYER_REQUEST',
} as const;
export type ReportCategory = (typeof ReportCategory)[keyof typeof ReportCategory];

export const ReportPhotoCategory = {
  PHONE_BOX: 'PHONE_BOX',
  PAYMENT_RECEIPT: 'PAYMENT_RECEIPT',
  POLICE_REPORT: 'POLICE_REPORT',
} as const;
export type ReportPhotoCategory =
  (typeof ReportPhotoCategory)[keyof typeof ReportPhotoCategory];

export const ReportNoteAction = {
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;
export type ReportNoteAction =
  (typeof ReportNoteAction)[keyof typeof ReportNoteAction];

export const Language = { AR: 'AR', EN: 'EN' } as const;
export type Language = (typeof Language)[keyof typeof Language];

export const ResolvedWipeState = {
  DATA_INTACT: 'DATA_INTACT',
  WIPED: 'WIPED',
} as const;
export type ResolvedWipeState =
  (typeof ResolvedWipeState)[keyof typeof ResolvedWipeState];

export const RewardAuditChangeType = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  RESOLVED_FREEZE: 'RESOLVED_FREEZE',
} as const;
export type RewardAuditChangeType =
  (typeof RewardAuditChangeType)[keyof typeof RewardAuditChangeType];

export const SerialLookupMatchResult = {
  NO_MATCH: 'NO_MATCH',
  CURRENTLY_REPORTED: 'CURRENTLY_REPORTED',
  HISTORICALLY_REPORTED: 'HISTORICALLY_REPORTED',
} as const;
export type SerialLookupMatchResult =
  (typeof SerialLookupMatchResult)[keyof typeof SerialLookupMatchResult];

export const ContactInfoType = {
  PHONE: 'PHONE',
  SOCIAL_LINK: 'SOCIAL_LINK',
} as const;
export type ContactInfoType =
  (typeof ContactInfoType)[keyof typeof ContactInfoType];

export interface User {
  id: string;
  supabaseUid: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  profilePhotoUrl: string | null;
  role: Role;
  preferredLanguage: Language;
  isEmailVerified: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportPhoto {
  id: string;
  category: ReportPhotoCategory;
  url: string;
  createdAt: string;
}

export interface ReportNote {
  id: string;
  reportId: string;
  authorId: string;
  authorDisplayName: string;
  action: ReportNoteAction;
  noteText: string;
  statusFrom: ReportStatus;
  statusTo: ReportStatus;
  createdAt: string;
}

export interface AssignedModerator {
  id: string;
  displayName: string;
  assignedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  reportCategory: ReportCategory;
  imei1: string | null;
  imei2: string | null;
  phoneBrand: string | null;
  phoneModel: string | null;
  lastPhoneNumber1: string | null;
  lastPhoneNumber2: string | null;
  description: string | null;
  lossDate: string | null;
  lossArea: string | null;
  lossAddress: string | null;
  reporterFullName: string | null;
  witnessFullName: string | null;
  witnessLocation: string | null;
  contactPhoneNumber: string | null;
  paymentPhoneNumber: string | null;
  depositAmount: number | null;
  rewardIfDataIntact: number | null;
  rewardIfWiped: number | null;
  rewardOffered?: boolean;
  hasReward: boolean;
  resolvedWipeState: ResolvedWipeState | null;
  status: ReportStatus;
  assignedToId: string | null;
  assignedUserName: string | null;
  assignedAt: string | null;
  assignedById: string | null;
  assignedModerator?: AssignedModerator | null;
  owner?: Pick<User, 'id' | 'displayName' | 'email' | 'phone'> | null;
  photos: ReportPhoto[];
  notes?: ReportNote[];
  createdAt: string;
  updatedAt: string;
}

export interface RewardAuditEntry {
  id: string;
  reportId: string;
  actorId: string;
  actorDisplayName: string;
  changeType: RewardAuditChangeType;
  beforeIntact: number | null;
  beforeWiped: number | null;
  afterIntact: number | null;
  afterWiped: number | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  id: string;
  type: ContactInfoType;
  label: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  id: string;
  defaultLawyerDepositAmount: number | null;
  maxRewardAmount: number | null;
  serialLookupRateLimit: number | null;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  tokens?: AuthTokens;
}

export interface SessionResponse {
  user: User;
}

export interface PaginatedMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface PaginationQuery {
  cursor?: string;
  take?: number;
}

export interface LocalizedMessage {
  en: string;
  ar: string;
}
export type ApiMessage = string | LocalizedMessage;

export interface ErrorDetail {
  field?: string;
  code?: string;
  message: ApiMessage;
  source?: string;
  rejectedValue?: unknown;
}

export type ErrorCategory =
  | 'VALIDATION'
  | 'REQUEST'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'DATABASE'
  | 'EXTERNAL'
  | 'INTERNAL';

export interface ApiSuccess<T> {
  statusCode: number;
  data: T;
  meta?: PaginatedMeta;
  message?: ApiMessage;
}

export interface ApiErrorEnvelope {
  statusCode: number;
  error: string;
  message: ApiMessage;
  code?: string;
  category?: ErrorCategory;
  details?: ErrorDetail[];
  correlationId?: string;
  timestamp?: string;
  path?: string;
  method?: string;
}
