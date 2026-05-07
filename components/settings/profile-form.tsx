'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { errorToast, successToast } from '@/components/shared/error-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Role, User } from '@/lib/api/types';
import { usersApi } from '@/lib/api/users';
import { UpdateMeInput } from '@/lib/validations/user';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations();
  const { setUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateMeInput>({
    defaultValues: {
      displayName: user.displayName,
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: UpdateMeInput) => {
    setIsLoading(true);

    try {
      const updatedUser = await usersApi.updateMe(data);
      setUser(updatedUser);
      invalidateResourceCache('settings:me');
      invalidateResourceCache('dashboard:overview');
      invalidateResourceCacheByPrefix(`users:detail:${updatedUser.id}`);
      invalidateResourceCacheByPrefix(`moderators:detail:${updatedUser.id}`);
      successToast(t('settings.updateSuccess'));
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('errors.networkError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="surface-card border-0 shadow-none">
      <CardHeader>
        <CardTitle>{t('settings.profile')}</CardTitle>
        <CardDescription>{t('settings.profileDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            {errors.displayName && (
              <p className="text-sm text-destructive">
                {t(errors.displayName.message as string)}
              </p>
            )}
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
            {errors.phone && (
              <p className="text-sm text-destructive">
                {t(errors.phone.message as string)}
              </p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t('settings.readOnlyEmail')}</Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="h-12 rounded-2xl border-border/70 bg-muted/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('users.role')}</Label>
              <Input
                id="role"
                value={t(
                  `roles.${
                    user.role === Role.END_USER
                      ? 'endUser'
                      : user.role === Role.MODERATOR
                        ? 'moderator'
                        : 'admin'
                  }`
                )}
                disabled
                className="h-12 rounded-2xl border-border/70 bg-muted/80"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="h-12 rounded-2xl px-5">
            {isLoading ? t('common.loading') : t('common.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
