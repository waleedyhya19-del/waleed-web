'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/shared/page-header';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { Card, CardContent } from '@/components/ui/card';
import {
  UserForm,
  type UserFormSubmitData,
} from '@/components/users/user-form';
import { useRouter } from '@/i18n/routing';
import { Role, type CreateUserPayload } from '@/lib/api/types';
import { usersApi } from '@/lib/api/users';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

export function ModeratorCreatePageContent() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserFormSubmitData) => {
    setIsLoading(true);

    try {
      const createdUser = await usersApi.create(data as CreateUserPayload);

      invalidateResourceCache('dashboard:overview');
      invalidateResourceCache('moderators:list');
      invalidateResourceCacheByPrefix('users:list:');
      invalidateResourceCacheByPrefix('moderators:list');

      successToast(t('moderators.createSuccess'));
      router.push(`/moderators/${createdUser.id}`);
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('moderators.loadError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.moderators')}
          title={t('moderators.new')}
          description={t('moderators.newDescription')}
          breadcrumbs={[
            { label: t('navigation.moderators'), href: '/moderators' },
            { label: t('moderators.new') },
          ]}
        />
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <Card className="surface-card border-0 shadow-none">
          <CardContent className="p-6">
            <UserForm
              mode="create"
              allowedRoles={[Role.MODERATOR, Role.LAWYER]}
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
