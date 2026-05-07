import type { ApiErrorCategory } from '@/lib/api/types';
import type { RuntimeLocale } from '@/lib/i18n/runtime-locale';

type ErrorCopy = {
  titles: {
    default: string;
    validation: string;
    authentication: string;
    authorization: string;
    notFound: string;
    conflict: string;
    rateLimit: string;
    network: string;
    server: string;
  };
  referenceLabel: string;
  messages: {
    invalidCredentials: string;
    accountLocked: string;
    sessionExpired: string;
    currentPasswordIncorrect: string;
    invalidRefreshToken: string;
    invalidResetToken: string;
    missingAccessToken: string;
    accountDeactivated: string;
    emailAlreadyInUse: string;
    emailAlreadyLinked: string;
    noLinkedEmail: string;
    invalidOtp: string;
    maxOtpAttempts: string;
    ownReportsAccess: string;
    ownReportsModify: string;
    reportReceivedOnly: string;
    invalidStatusTransition: string;
    moderatorEndUserFilter: string;
    forbidden: string;
    notFound: string;
    conflict: string;
    rateLimit: string;
    validation: string;
    database: string;
    external: string;
    network: string;
    server: string;
    unknown: string;
  };
  fieldLabels: Record<string, string>;
  validationRules: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidChoice: string;
    invalidText: string;
    invalidFormat: string;
    minLength: string;
    maxLength: string;
    generic: string;
  };
  fieldRuleMessages: Record<string, Record<string, string>>;
};

const GENERIC_TITLES: Record<RuntimeLocale, ErrorCopy['titles']> = {
  en: {
    default: 'Something went wrong',
    validation: 'Check your details',
    authentication: 'Authentication issue',
    authorization: 'Access denied',
    notFound: 'Not found',
    conflict: 'Request conflict',
    rateLimit: 'Too many attempts',
    network: 'Connection problem',
    server: 'Server error',
  },
  ar: {
    default: 'حدث خطأ ما',
    validation: 'راجع البيانات المدخلة',
    authentication: 'مشكلة في تسجيل الدخول',
    authorization: 'الوصول مرفوض',
    notFound: 'العنصر غير موجود',
    conflict: 'تعذر إكمال الطلب',
    rateLimit: 'عدد المحاولات كبير',
    network: 'مشكلة في الاتصال',
    server: 'خطأ في الخادم',
  },
};

export const ERROR_COPY: Record<RuntimeLocale, ErrorCopy> = {
  en: {
    titles: GENERIC_TITLES.en,
    referenceLabel: 'Reference',
    messages: {
      invalidCredentials:
        'The email address or password you entered is incorrect. Check your credentials and try again.',
      accountLocked:
        'Your account is temporarily locked after several failed sign-in attempts. Wait a few minutes and try again.',
      sessionExpired:
        'Your session has expired. Sign in again to continue.',
      currentPasswordIncorrect:
        'The current password is incorrect. Enter your current password again and try once more.',
      invalidRefreshToken:
        'Your session could not be refreshed. Sign in again to continue.',
      invalidResetToken:
        'This reset link is invalid or has expired. Request a new password reset link and try again.',
      missingAccessToken:
        'You need to sign in before performing this action.',
      accountDeactivated:
        'This account is no longer active. Contact support if you believe this is a mistake.',
      emailAlreadyInUse:
        'This email address is already in use. Use a different email or sign in instead.',
      emailAlreadyLinked:
        'This account already has an email address linked to it.',
      noLinkedEmail:
        'No email address is linked to this account yet. Add one before changing the password.',
      invalidOtp:
        'The verification code is invalid or has expired. Request a new code and try again.',
      maxOtpAttempts:
        'Too many incorrect verification attempts were made. Request a new code and try again later.',
      ownReportsAccess:
        'You can only open reports that belong to your own account.',
      ownReportsModify:
        'You can only edit or delete reports that belong to your own account.',
      reportReceivedOnly:
        'This report can no longer be changed because it has already moved past the received stage.',
      invalidStatusTransition:
        'This status change is not allowed from the current workflow stage.',
      moderatorEndUserFilter:
        'Moderators can only filter end-user accounts.',
      forbidden:
        'You do not have permission to perform this action.',
      notFound:
        'The requested item could not be found.',
      conflict:
        'This request could not be completed because the data already exists or was changed.',
      rateLimit:
        'Too many requests were sent in a short time. Please wait and try again.',
      validation:
        'Please review the entered information and correct the highlighted fields.',
      database:
        'A data error occurred while processing your request. Please try again.',
      external:
        'A required external service is currently unavailable. Please try again shortly.',
      network:
        'We could not reach the server. Check your connection and try again.',
      server:
        'The server could not complete the request. Please try again later.',
      unknown:
        'Something went wrong. Please try again.',
    },
    fieldLabels: {
      email: 'Email address',
      password: 'Password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      displayName: 'Display name',
      phone: 'Phone number',
      phoneNumber: 'Phone number',
      preferredLanguage: 'Language',
      serialNumber: 'IMEI number',
      description: 'Description',
      status: 'Status',
      role: 'Role',
      token: 'Reset token',
      photos: 'Photos',
    },
    validationRules: {
      required: 'is required.',
      invalidEmail: 'must be a valid email address.',
      invalidPhone: 'must be a valid phone number.',
      invalidChoice: 'must use a supported value.',
      invalidText: 'must be valid text.',
      invalidFormat: 'has an invalid format.',
      minLength: 'is shorter than allowed.',
      maxLength: 'is longer than allowed.',
      generic: 'contains invalid data.',
    },
    fieldRuleMessages: {
      email: {
        isEmail: 'Enter a valid email address.',
        isNotEmpty: 'Email address is required.',
      },
      password: {
        isNotEmpty: 'Password is required.',
        matches:
          'Password must include at least 8 characters, one uppercase letter, one lowercase letter, and one number.',
        minLength:
          'Password must be at least 8 characters long.',
      },
      currentPassword: {
        isNotEmpty: 'Current password is required.',
      },
      displayName: {
        isNotEmpty: 'Display name is required.',
        maxLength: 'Display name is too long.',
      },
      phone: {
        isPhoneNumber: 'Enter a valid phone number including country code.',
        matches: 'Enter a valid phone number including country code.',
      },
      phoneNumber: {
        isPhoneNumber: 'Enter a valid phone number including country code.',
        matches: 'Enter a valid phone number including country code.',
      },
      preferredLanguage: {
        isEnum: 'Choose a supported language.',
      },
      serialNumber: {
        matches: 'Enter a valid 15-digit IMEI number.',
        isNotEmpty: 'IMEI number is required.',
      },
      token: {
        isNotEmpty: 'Reset token is required.',
      },
      photos: {
        arrayMaxSize: 'You can upload up to 5 photos.',
      },
    },
  },
  ar: {
    titles: GENERIC_TITLES.ar,
    referenceLabel: 'مرجع الطلب',
    messages: {
      invalidCredentials:
        'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات المدخلة ثم أعد المحاولة.',
      accountLocked:
        'تم قفل الحساب مؤقتًا بعد عدة محاولات تسجيل دخول غير ناجحة. انتظر قليلًا ثم حاول مرة أخرى.',
      sessionExpired:
        'انتهت صلاحية الجلسة الحالية. سجّل الدخول مرة أخرى للمتابعة.',
      currentPasswordIncorrect:
        'كلمة المرور الحالية غير صحيحة. أعد إدخالها ثم حاول مرة أخرى.',
      invalidRefreshToken:
        'تعذر تجديد الجلسة الحالية. سجّل الدخول مرة أخرى للمتابعة.',
      invalidResetToken:
        'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا ثم حاول مرة أخرى.',
      missingAccessToken:
        'يجب تسجيل الدخول أولًا قبل تنفيذ هذا الإجراء.',
      accountDeactivated:
        'هذا الحساب غير نشط حاليًا. تواصل مع الدعم إذا كنت تعتقد أن هذا حدث بالخطأ.',
      emailAlreadyInUse:
        'عنوان البريد الإلكتروني مستخدم بالفعل. استخدم بريدًا آخر أو سجّل الدخول بالحساب الحالي.',
      emailAlreadyLinked:
        'يوجد بريد إلكتروني مرتبط بهذا الحساب بالفعل.',
      noLinkedEmail:
        'لا يوجد بريد إلكتروني مرتبط بهذا الحساب بعد. أضف بريدًا أولًا قبل تغيير كلمة المرور.',
      invalidOtp:
        'رمز التحقق غير صالح أو منتهي الصلاحية. اطلب رمزًا جديدًا ثم حاول مرة أخرى.',
      maxOtpAttempts:
        'تم إدخال رمز تحقق غير صحيح عدة مرات. اطلب رمزًا جديدًا ثم حاول لاحقًا.',
      ownReportsAccess:
        'يمكنك فتح التقارير التابعة لحسابك فقط.',
      ownReportsModify:
        'يمكنك تعديل أو حذف التقارير التابعة لحسابك فقط.',
      reportReceivedOnly:
        'لا يمكن تعديل هذا التقرير الآن لأنه تجاوز مرحلة الاستلام الأولى.',
      invalidStatusTransition:
        'لا يمكن تغيير حالة التقرير بهذه الطريقة من المرحلة الحالية.',
      moderatorEndUserFilter:
        'يمكن للمشرفين تصفية حسابات المستخدمين النهائيين فقط.',
      forbidden:
        'ليست لديك الصلاحية لتنفيذ هذا الإجراء.',
      notFound:
        'تعذر العثور على العنصر المطلوب.',
      conflict:
        'تعذر إكمال الطلب لأن البيانات موجودة بالفعل أو تم تغييرها.',
      rateLimit:
        'تم إرسال عدد كبير من الطلبات خلال وقت قصير. انتظر قليلًا ثم أعد المحاولة.',
      validation:
        'يرجى مراجعة البيانات المدخلة وتصحيح الحقول المطلوبة.',
      database:
        'حدث خطأ في معالجة البيانات. يرجى إعادة المحاولة.',
      external:
        'إحدى الخدمات الخارجية غير متاحة حاليًا. حاول مرة أخرى بعد قليل.',
      network:
        'تعذر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.',
      server:
        'تعذر على الخادم إكمال الطلب. حاول مرة أخرى لاحقًا.',
      unknown:
        'حدث خطأ غير متوقع. حاول مرة أخرى.',
    },
    fieldLabels: {
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      displayName: 'اسم العرض',
      phone: 'رقم الهاتف',
      phoneNumber: 'رقم الهاتف',
      preferredLanguage: 'اللغة',
      serialNumber: 'رقم IMEI',
      description: 'الوصف',
      status: 'الحالة',
      role: 'الدور',
      token: 'رمز الاستعادة',
      photos: 'الصور',
    },
    validationRules: {
      required: 'حقل مطلوب.',
      invalidEmail: 'يجب إدخال بريد إلكتروني صالح.',
      invalidPhone: 'يجب إدخال رقم هاتف صالح.',
      invalidChoice: 'يجب اختيار قيمة مدعومة.',
      invalidText: 'يجب أن تكون القيمة نصية صحيحة.',
      invalidFormat: 'تنسيق القيمة غير صحيح.',
      minLength: 'القيمة أقصر من الحد المطلوب.',
      maxLength: 'القيمة أطول من الحد المسموح.',
      generic: 'يحتوي على بيانات غير صحيحة.',
    },
    fieldRuleMessages: {
      email: {
        isEmail: 'أدخل بريدًا إلكترونيًا صالحًا.',
        isNotEmpty: 'البريد الإلكتروني مطلوب.',
      },
      password: {
        isNotEmpty: 'كلمة المرور مطلوبة.',
        matches:
          'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وأن تحتوي على حرف كبير وحرف صغير ورقم.',
        minLength: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
      },
      currentPassword: {
        isNotEmpty: 'كلمة المرور الحالية مطلوبة.',
      },
      displayName: {
        isNotEmpty: 'اسم العرض مطلوب.',
        maxLength: 'اسم العرض أطول من الحد المسموح.',
      },
      phone: {
        isPhoneNumber: 'أدخل رقم هاتف صالحًا متضمنًا مفتاح الدولة.',
        matches: 'أدخل رقم هاتف صالحًا متضمنًا مفتاح الدولة.',
      },
      phoneNumber: {
        isPhoneNumber: 'أدخل رقم هاتف صالحًا متضمنًا مفتاح الدولة.',
        matches: 'أدخل رقم هاتف صالحًا متضمنًا مفتاح الدولة.',
      },
      preferredLanguage: {
        isEnum: 'اختر لغة مدعومة.',
      },
      serialNumber: {
        matches: 'أدخل رقم IMEI صالحًا مكونًا من 15 رقمًا.',
        isNotEmpty: 'رقم IMEI مطلوب.',
      },
      token: {
        isNotEmpty: 'رمز الاستعادة مطلوب.',
      },
      photos: {
        arrayMaxSize: 'يمكنك رفع 5 صور كحد أقصى.',
      },
    },
  },
};

const MESSAGE_KEY_BY_TEXT = [
  ['invalid credentials', 'invalidCredentials'],
  ['account temporarily locked', 'accountLocked'],
  ['session expired', 'sessionExpired'],
  ['current password is incorrect', 'currentPasswordIncorrect'],
  ['invalid refresh token', 'invalidRefreshToken'],
  ['invalid reset token', 'invalidResetToken'],
  ['missing access token', 'missingAccessToken'],
  ['account deactivated', 'accountDeactivated'],
  ['email is already in use', 'emailAlreadyInUse'],
  ['user already registered', 'emailAlreadyInUse'],
  ['email is already linked', 'emailAlreadyLinked'],
  ['no linked email found', 'noLinkedEmail'],
  ['invalid otp', 'invalidOtp'],
  ['maximum otp verification attempts exceeded', 'maxOtpAttempts'],
  ['you can only access your own reports', 'ownReportsAccess'],
  ['you can only modify your own reports', 'ownReportsModify'],
  ['only reports with received status can be modified or deleted', 'reportReceivedOnly'],
  ['invalid status transition', 'invalidStatusTransition'],
  ['moderators can only filter end_user accounts', 'moderatorEndUserFilter'],
] as const satisfies ReadonlyArray<
  readonly [string, keyof ErrorCopy['messages']]
>;

export function getErrorCopy(locale: RuntimeLocale): ErrorCopy {
  return ERROR_COPY[locale];
}

export function resolveMessageKey(
  message: string | null,
): keyof ErrorCopy['messages'] | null {
  if (!message) {
    return null;
  }

  const normalizedMessage = message.toLowerCase();

  for (const [pattern, key] of MESSAGE_KEY_BY_TEXT) {
    if (normalizedMessage.includes(pattern)) {
      return key;
    }
  }

  return null;
}

export function getCategoryTitleKey(category: ApiErrorCategory): keyof ErrorCopy['titles'] {
  switch (category) {
    case 'VALIDATION':
      return 'validation';
    case 'AUTHENTICATION':
      return 'authentication';
    case 'AUTHORIZATION':
      return 'authorization';
    case 'NOT_FOUND':
      return 'notFound';
    case 'CONFLICT':
      return 'conflict';
    case 'RATE_LIMIT':
      return 'rateLimit';
    case 'NETWORK':
      return 'network';
    case 'DATABASE':
    case 'EXTERNAL':
    case 'INTERNAL':
      return 'server';
    default:
      return 'default';
  }
}
