// User Roles
export enum Role {
  END_USER = 'END_USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
}

// Report Status
export enum ReportStatus {
  RECEIVED = 'RECEIVED',
  REVIEWING = 'REVIEWING',
  ESCALATED = 'ESCALATED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// Report Type
export enum ReportType {
  LOST = 'LOST',
  STOLEN = 'STOLEN',
}

// Report Category
export enum ReportCategory {
  BASIC = 'BASIC',
  LAWYER_REQUEST = 'LAWYER_REQUEST',
}

// Report Photo Category
export enum ReportPhotoCategory {
  PHONE_BOX = 'PHONE_BOX',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  POLICE_REPORT = 'POLICE_REPORT',
}

// Language
export enum Language {
  AR = 'AR',
  EN = 'EN',
}

// User Entity
export interface User {
  id: string;
  email: string | null;
  displayName: string;
  phone: string | null;
  role: Role;
  preferredLanguage: Language;
  profilePhotoUrl: string | null;
  failedLoginAttempts?: number;
  lockedUntil: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportUserSummary {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
}

export interface AssignedModerator {
  id: string | null;
  displayName: string | null;
  assignedAt: string | null;
}

// Report Entity
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
  status: ReportStatus;
  assignedToId: string | null;
  assignedModerator: AssignedModerator;
  assignedAt: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: ReportUserSummary;
  photos?: ReportPhoto[];
  notes?: ReportNote[];
}

// Report Photo Entity
export interface ReportPhoto {
  id: string;
  reportId: string;
  category: ReportPhotoCategory;
  url: string;
  createdAt: string;
}

// Report Note Entity
export interface ReportNote {
  id: string;
  authorId: string;
  authorDisplayName: string;
  action: string;
  noteText: string | null;
  statusFrom: ReportStatus | null;
  statusTo: ReportStatus | null;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  data: T[];
  meta: {
    hasNextPage?: boolean;
    hasMore?: boolean;
    nextCursor: string | null;
  };
}

export type ApiErrorCategory =
  | 'VALIDATION'
  | 'REQUEST'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'DATABASE'
  | 'EXTERNAL'
  | 'INTERNAL'
  | 'NETWORK'
  | 'UNKNOWN';

export type ApiErrorSource =
  | 'request'
  | 'body'
  | 'query'
  | 'param'
  | 'header'
  | 'database'
  | 'external'
  | 'server';

export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
  source?: ApiErrorSource;
  rejectedValue?: string | number | boolean | null;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  code: string;
  category: ApiErrorCategory;
  details: ApiErrorDetail[] | null;
  correlationId: string | null;
  timestamp: string | null;
  path: string | null;
  method: string | null;
  retriable: boolean;
}

// Pagination Parameters
export interface PaginationParams {
  cursor?: string;
  take?: number;
}

// Report List Parameters
export interface ReportListParams extends PaginationParams {
  status?: ReportStatus;
  type?: ReportType;
  reportCategory?: ReportCategory;
  search?: string;
  assignedToMe?: boolean;
  assignedToId?: string;
}

// User List Parameters
export interface UserListParams extends PaginationParams {
  role?: Role;
  search?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
  role: Role;
  profilePhotoUrl: string | null;
  preferredLanguage: Language;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  tokenType: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface ConfirmEmail {
  token: string;
  email: string;
}

export interface ResendConfirmation {
  email: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

// User Create/Update Types
export interface CreateUserPayload {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  role: Role;
  preferredLanguage?: Language;
}

export interface UpdateUserPayload {
  displayName?: string;
  phone?: string;
  role?: Role;
  preferredLanguage?: Language;
}

export interface UpdateMePayload {
  displayName?: string;
  phone?: string;
  preferredLanguage?: Language;
}

// Report Update Types
export interface UpdateReportPayload {
  type?: ReportType;
  reportCategory?: ReportCategory;
  imei1?: string | null;
  imei2?: string | null;
  phoneBrand?: string | null;
  phoneModel?: string | null;
  lastPhoneNumber1?: string | null;
  lastPhoneNumber2?: string | null;
  description?: string | null;
  lossDate?: string | null;
  lossArea?: string | null;
  lossAddress?: string | null;
  reporterFullName?: string | null;
  witnessFullName?: string | null;
  witnessLocation?: string | null;
  contactPhoneNumber?: string | null;
  paymentPhoneNumber?: string | null;
  depositAmount?: number | null;
}

export interface CreateReportPayload {
  userId: string;
  type: ReportType;
  reportCategory: ReportCategory;
  imei1?: string | null;
  imei2?: string | null;
  phoneBrand?: string | null;
  phoneModel?: string | null;
  lastPhoneNumber1?: string | null;
  lastPhoneNumber2?: string | null;
  description?: string | null;
  lossDate?: string | null;
  lossArea?: string | null;
  lossAddress?: string | null;
  reporterFullName?: string | null;
  witnessFullName?: string | null;
  witnessLocation?: string | null;
  contactPhoneNumber?: string | null;
  paymentPhoneNumber?: string | null;
  depositAmount?: number | null;
}

export interface UpdateReportStatusPayload {
  status: ReportStatus;
  note?: string;
}

export interface AssignReportPayload {
  assignedToId: string;
}

// Platform Settings
export interface PlatformSettings {
  defaultLawyerDepositAmount: number | null;
}

// Dashboard Summary Types
export interface DashboardSummary {
  reportsByStatus: Record<ReportStatus, number>;
  totalUsers: number;
  totalModerators: number;
  recentReports: Report[];
}