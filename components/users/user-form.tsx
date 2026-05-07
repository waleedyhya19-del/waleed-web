'use client';

import { Controller, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreateUserPayload,
  Language,
  Role,
  UpdateUserPayload,
} from '@/lib/api/types';

type UserFormValues = {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  role: Role;
  preferredLanguage: Language;
};

interface UserFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<UserFormValues>;
  allowedRoles?: Role[];
  isLoading?: boolean;
  submitLabel?: string;
  onSubmit: (data: UserFormSubmitData) => Promise<void> | void;
}

const DEFAULT_ROLE_OPTIONS = [
  Role.END_USER,
  Role.MODERATOR,
  Role.ADMIN,
  Role.LAWYER,
];

export type UserFormSubmitData = CreateUserPayload | UpdateUserPayload;

function translateRole(t: ReturnType<typeof useTranslations>, role: Role) {
  if (role === Role.END_USER) {
    return t('roles.endUser');
  }

  if (role === Role.MODERATOR) {
    return t('roles.moderator');
  }

  if (role === Role.LAWYER) {
    return t('roles.lawyer');
  }

  return t('roles.admin');
}

function translateLanguage(
  t: ReturnType<typeof useTranslations>,
  language: Language
) {
  return language === Language.AR ? t('settings.arabic') : t('settings.english');
}

export function UserForm({
  mode,
  initialValues,
  allowedRoles = DEFAULT_ROLE_OPTIONS,
  isLoading,
  submitLabel,
  onSubmit,
}: UserFormProps) {
  const t = useTranslations();
  const isCreate = mode === 'create';
  const roleOptions = allowedRoles.length > 0 ? allowedRoles : DEFAULT_ROLE_OPTIONS;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      email: initialValues?.email ?? '',
      password: '',
      displayName: initialValues?.displayName ?? '',
      phone: initialValues?.phone ?? '',
      role: initialValues?.role ?? roleOptions[0] ?? Role.END_USER,
      preferredLanguage: initialValues?.preferredLanguage ?? Language.AR,
    },
  });

  const submit = async (values: UserFormValues) => {
    const normalizedDisplayName = values.displayName.trim();
    const normalizedPhone = values.phone.trim();

    if (isCreate) {
      await onSubmit({
        email: values.email.trim(),
        password: values.password,
        displayName: normalizedDisplayName,
        phone: normalizedPhone || undefined,
        role: values.role,
        preferredLanguage: values.preferredLanguage,
      });

      return;
    }

    await onSubmit({
      displayName: normalizedDisplayName,
      phone: normalizedPhone || undefined,
      role: values.role,
      preferredLanguage: values.preferredLanguage,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {isCreate ? (
        <div className="space-y-2">
          <Label htmlFor="email">{t('users.email')}</Label>
          <Input
            id="email"
            className="h-12 rounded-2xl border-border/70 bg-background/70"
            {...register('email', {
              required: 'validation.email.required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'validation.email.invalid',
              },
            })}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">
              {t(errors.email.message as string)}
            </p>
          ) : null}
        </div>
      ) : initialValues?.email ? (
        <div className="space-y-2">
          <Label htmlFor="email">{t('settings.readOnlyEmail')}</Label>
          <Input
            id="email"
            value={initialValues.email}
            disabled
            className="h-12 rounded-2xl border-border/70 bg-muted/80"
          />
        </div>
      ) : null}

      {isCreate ? (
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            className="h-12 rounded-2xl border-border/70 bg-background/70"
            {...register('password', {
              required: 'validation.password.required',
              minLength: {
                value: 8,
                message: 'validation.password.minLength',
              },
              validate: {
                uppercase: (value) =>
                  /[A-Z]/.test(value) || 'validation.password.uppercase',
                lowercase: (value) =>
                  /[a-z]/.test(value) || 'validation.password.lowercase',
                number: (value) =>
                  /[0-9]/.test(value) || 'validation.password.number',
              },
            })}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">
              {t(errors.password.message as string)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="displayName">{t('settings.displayName')}</Label>
        <Input
          id="displayName"
          className="h-12 rounded-2xl border-border/70 bg-background/70"
          {...register('displayName', {
            required: 'validation.displayName.required',
            maxLength: {
              value: 100,
              message: 'validation.displayName.maxLength',
            },
          })}
        />
        {errors.displayName ? (
          <p className="text-sm text-destructive">
            {t(errors.displayName.message as string)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('users.phone')}</Label>
        <Input
          id="phone"
          className="h-12 rounded-2xl border-border/70 bg-background/70"
          {...register('phone', {
            pattern: {
              value: /^\+?[1-9]\d{1,14}$/,
              message: 'validation.phone.invalid',
            },
          })}
        />
        {errors.phone ? (
          <p className="text-sm text-destructive">
            {t(errors.phone.message as string)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">{t('users.role')}</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) =>
              roleOptions.length === 1 ? (
                <Input
                  id="role"
                  value={translateRole(t, roleOptions[0])}
                  disabled
                  className="h-12 rounded-2xl border-border/70 bg-muted/80"
                />
              ) : (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="role"
                    className="h-12 rounded-2xl border-border/70 bg-background/70"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {translateRole(t, role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }
          />
          {errors.role ? (
            <p className="text-sm text-destructive">
              {t(errors.role.message as string)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredLanguage">{t('settings.language')}</Label>
          <Controller
            name="preferredLanguage"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="preferredLanguage"
                  className="h-12 rounded-2xl border-border/70 bg-background/70"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[Language.AR, Language.EN].map((language) => (
                    <SelectItem key={language} value={language}>
                      {translateLanguage(t, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.preferredLanguage ? (
            <p className="text-sm text-destructive">
              {t(errors.preferredLanguage.message as string)}
            </p>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="h-12 rounded-2xl px-5">
        {isLoading ? t('common.loading') : submitLabel || t('common.save')}
      </Button>
    </form>
  );
}
