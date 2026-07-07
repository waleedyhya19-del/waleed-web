import type {
  ReportStatus,
  ReportType,
  ReportCategory,
  ReportPhotoCategory,
  ReportNoteAction,
  ResolvedWipeState,
  SerialLookupMatchResult,
  ContactInfoType,
  Language,
  Role,
} from '@/lib/api/types';

export const statusKey = (s: ReportStatus) => `status.${s}` as const;
export const reportTypeKey = (t: ReportType) => `reportType.${t}` as const;
export const reportCategoryKey = (c: ReportCategory) => `reportCategory.${c}` as const;
export const photoCategoryKey = (c: ReportPhotoCategory) => `photoCategory.${c}` as const;
export const noteActionKey = (a: ReportNoteAction) => `noteAction.${a}` as const;
export const wipeStateKey = (w: ResolvedWipeState) => `wipeState.${w}` as const;
export const matchResultKey = (m: SerialLookupMatchResult) => `matchResult.${m}` as const;
export const contactTypeKey = (t: ContactInfoType) => `contactType.${t}` as const;
export const languageKey = (l: Language) => `language.${l}` as const;
export const roleKey = (r: Role) => `roles.${r}` as const;

export const statusVariant = (
  s: ReportStatus,
): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' => {
  switch (s) {
    case 'RECEIVED':
      return 'secondary';
    case 'REVIEWING':
      return 'info';
    case 'ESCALATED':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'default';
    default:
      return 'default';
  }
};
