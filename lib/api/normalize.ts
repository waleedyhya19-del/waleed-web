const REVERSE_ROLE: Record<string, string> = {
  'مستخدم': 'END_USER',
  'مشرف': 'MODERATOR',
  'مسؤول': 'ADMIN',
  'محامي': 'LAWYER',
};

const REVERSE_STATUS: Record<string, string> = {
  'تم الاستلام': 'RECEIVED',
  'قيد مراجعة الطلب المقدم': 'RECEIVED',
  'قيد المراجعة': 'REVIEWING',
  'تم رفع الطلب علي التطبيق': 'REVIEWING',
  'تم التصعيد': 'ESCALATED',
  'تم الإبلاغ عن وجود هاتفك مع شخص ما يرجى التواصل معنا للتنسيق': 'ESCALATED',
  'مرفوض': 'REJECTED',
  'تم رفض الطلب، يرجى مراجعة بريدك الإلكتروني للتفاصيل': 'REJECTED',
  'تم الحل': 'RESOLVED',
  'تم العثور علي الهاتف بنجاح': 'RESOLVED',
  'مغلق': 'CLOSED',
};

const REVERSE_REPORT_TYPE: Record<string, string> = {
  'مفقود': 'LOST',
  'مسروق': 'STOLEN',
  'معثور عليه': 'FOUND',
  'نية شراء': 'INTENT_TO_PURCHASE',
};

const REVERSE_CONTACT_TYPE: Record<string, string> = {
  'هاتف': 'PHONE',
  'رابط اجتماعي': 'SOCIAL_LINK',
};

const REVERSE_TYPE: Record<string, string> = {
  ...REVERSE_REPORT_TYPE,
  ...REVERSE_CONTACT_TYPE,
};

const REVERSE_REPORT_CATEGORY: Record<string, string> = {
  'أساسي': 'BASIC',
  'طلب محامي': 'LAWYER_REQUEST',
};

const REVERSE_PHOTO_CATEGORY: Record<string, string> = {
  'صندوق الهاتف': 'PHONE_BOX',
  'إيصال الدفع': 'PAYMENT_RECEIPT',
  'محضر الشرطة': 'POLICE_REPORT',
};

const REVERSE_NOTE_ACTION: Record<string, string> = {
  'تم القبول': 'ACCEPTED',
  'تم الرفض': 'REJECTED',
};

const REVERSE_LANGUAGE: Record<string, string> = {
  'العربية': 'AR',
  'الإنجليزية': 'EN',
};

const REVERSE_WIPE_STATE: Record<string, string> = {
  'البيانات سليمة': 'DATA_INTACT',
  'تم محو البيانات': 'WIPED',
};

const REVERSE_REWARD_AUDIT_CHANGE_TYPE: Record<string, string> = {
  'تم الإنشاء': 'CREATED',
  'تم التحديث': 'UPDATED',
  'تجميد عند الحل': 'RESOLVED_FREEZE',
};

const REVERSE_SERIAL_MATCH_RESULT: Record<string, string> = {
  'لا توجد مطابقة': 'NO_MATCH',
  'مُبلّغ عنه حاليًا': 'CURRENTLY_REPORTED',
  'مُبلّغ عنه سابقًا': 'HISTORICALLY_REPORTED',
};

const FIELD_DICTIONARIES: Record<string, Record<string, string>> = {
  role: REVERSE_ROLE,
  status: REVERSE_STATUS,
  statusFrom: REVERSE_STATUS,
  statusTo: REVERSE_STATUS,
  fromStatus: REVERSE_STATUS,
  toStatus: REVERSE_STATUS,
  type: REVERSE_TYPE,
  reportCategory: REVERSE_REPORT_CATEGORY,
  category: REVERSE_PHOTO_CATEGORY,
  action: REVERSE_NOTE_ACTION,
  preferredLanguage: REVERSE_LANGUAGE,
  language: REVERSE_LANGUAGE,
  resolvedWipeState: REVERSE_WIPE_STATE,
  changeType: REVERSE_REWARD_AUDIT_CHANGE_TYPE,
  result: REVERSE_SERIAL_MATCH_RESULT,
  matchResult: REVERSE_SERIAL_MATCH_RESULT,
};

const MAX_DEPTH = 10;
const PLAIN_OBJECT_PROTOTYPES = new Set<unknown>([Object.prototype, null]);

export function normalizeResponsePayload<T>(value: T, depth = 0): T {
  if (value === null || value === undefined || depth >= MAX_DEPTH) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeResponsePayload(item, depth + 1)) as unknown as T;
  }

  if (typeof value === 'object') {
    if (
      value instanceof Date ||
      value instanceof Blob ||
      value instanceof FormData ||
      typeof (value as { arrayBuffer?: unknown }).arrayBuffer === 'function' ||
      !PLAIN_OBJECT_PROTOTYPES.has(Object.getPrototypeOf(value))
    ) {
      return value;
    }

    const output: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>);

    for (const [key, fieldValue] of entries) {
      const dict = FIELD_DICTIONARIES[key];
      if (dict && typeof fieldValue === 'string' && Object.prototype.hasOwnProperty.call(dict, fieldValue)) {
        output[key] = dict[fieldValue];
      } else {
        output[key] = normalizeResponsePayload(fieldValue, depth + 1);
      }
    }

    return output as T;
  }

  return value;
}
