'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/shared/page-header';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from '@/i18n/routing';
import { Role, type CreateUserPayload } from '@/lib/api/types';
import { usersApi } from '@/lib/api/users';
import {
  UserForm,
  type UserFormSubmitData,
} from '@/components/users/user-form';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

export function UserCreatePageContent() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserFormSubmitData) => {
    setIsLoading(true);

    try {
      const createdUser = await usersApi.create(data as CreateUserPayload);

      invalidateResourceCache('dashboard:overview');
      invalidateResourceCache('users:list:all');
      invalidateResourceCache('moderators:list');
      invalidateResourceCacheByPrefix('users:list:');
      invalidateResourceCacheByPrefix('moderators:list');

      successToast(t('users.createSuccess'));

      if (createdUser.role === Role.END_USER) {
        router.push(`/users/${createdUser.id}`);
        return;
      }

      router.push(`/moderators/${createdUser.id}`);
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('users.loadError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.users')}
          title={t('users.new')}
          description={t('users.newDescription')}
          breadcrumbs={[
            { label: t('navigation.users'), href: '/users' },
            { label: t('users.new') },
          ]}
        />
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <Card className="surface-card border-0 shadow-none">
          <CardContent className="p-6">
            <UserForm
              mode="create"
              isLoading={isLoading}
              submitLabel={t('common.create')}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
