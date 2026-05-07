'use client';

import { useEffect, useState } from 'react';
import { Mail, Pencil, Phone, Shield, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAsyncResource } from '@/hooks/use-async-resource';
import { useRouter } from '@/i18n/routing';
import { formatDateTime } from '@/lib/formatters';
import { Role, User } from '@/lib/api/types';
import { usersApi } from '@/lib/api/users';
import { RoleBadge } from '@/components/users/role-badge';
import {
  UserForm,
  type UserFormSubmitData,
} from '@/components/users/user-form';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

interface UserDetailProps {
  user: User;
}

function DetailPanel({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="surface-card-muted rounded-[1.35rem] p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

const ALL_ROLE_OPTIONS = [
  Role.END_USER,
  Role.MODERATOR,
  Role.ADMIN,
  Role.LAWYER,
];

export function UserDetail({ user }: UserDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user: currentUser, setUser: setCurrentUser } = useCurrentUser();
  const [record, setRecord] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setRecord(user);
  }, [user]);

  const isAdminViewer = currentUser?.role === Role.ADMIN;
  const { data: adminGuard } = useAsyncResource(
    async () => {
      if (!isAdminViewer || record.role !== Role.ADMIN) {
        return null;
      }

      return usersApi.list({
        role: Role.ADMIN,
        take: 2,
      });
    },
    [isAdminViewer, record.role],
    {
      cacheKey:
        isAdminViewer && record.role === Role.ADMIN ? 'users:admins:guard' : undefined,
      staleTimeMs: 30_000,
    }
  );

  const isLastAdmin = Boolean(
    adminGuard &&
      adminGuard.data.length === 1 &&
      !adminGuard.meta.hasMore &&
      record.role === Role.ADMIN
  );
  const isSelf = currentUser?.id === record.id;
  const deleteDisabledReason = isSelf
    ? t('users.cannotDeleteSelf')
    : isLastAdmin
      ? t('users.cannotDeleteLastAdmin')
      : null;
  const allowedRoles =
    isLastAdmin && record.role === Role.ADMIN ? [Role.ADMIN] : ALL_ROLE_OPTIONS;
  const initials = record.displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleUpdate = async (data: UserFormSubmitData) => {
    setIsSaving(true);

    try {
      const updatedUser = await usersApi.update(record.id, {
        displayName: data.displayName,
        phone: data.phone || undefined,
        role: data.role,
        preferredLanguage: data.preferredLanguage,
      });

      setRecord(updatedUser);
      invalidateResourceCache('dashboard:overview');
      invalidateResourceCacheByPrefix('users:list:');
      invalidateResourceCacheByPrefix('moderators:list');
      invalidateResourceCacheByPrefix(`users:detail:${record.id}`);
      invalidateResourceCacheByPrefix(`moderators:detail:${record.id}`);
      invalidateResourceCache('users:admins:guard');

      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }

      successToast(t('users.updateSuccess'));
      setIsEditing(false);

      if (updatedUser.role !== Role.END_USER) {
        router.replace(`/moderators/${updatedUser.id}`);
      }
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('users.loadError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDisabledReason) {
      return;
    }

    setIsDeleting(true);

    try {
      await usersApi.delete(record.id);
      invalidateResourceCache('dashboard:overview');
      invalidateResourceCacheByPrefix('users:list:');
      invalidateResourceCacheByPrefix('moderators:list');
      invalidateResourceCacheByPrefix(`users:detail:${record.id}`);
      invalidateResourceCache('users:admins:guard');
      successToast(t('users.deleteSuccess'));
      router.push('/users');
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('users.loadError'),
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="page-grid">
      <section className="surface-card border-0 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="size-14 ring-4 ring-white/70">
              <AvatarImage src={record.profilePhotoUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="section-kicker">{t('users.detail')}</p>
              <h2 className="mt-2 text-2xl font-semibold">{record.displayName}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={record.role} />
            {isAdminViewer ? (
              <>
                <Button
                  type="button"
                  variant={isEditing ? 'secondary' : 'outline'}
                  className="rounded-2xl"
                  onClick={() => setIsEditing((current) => !current)}
                >
                  <Pencil className="size-4" />
                  {t('users.edit')}
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          type="button"
                          variant="destructive"
                          className="rounded-2xl"
                          disabled={Boolean(deleteDisabledReason)}
                          onClick={() => setDeleteOpen(true)}
                        >
                          <Trash2 className="size-4" />
                          {t('users.delete')}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {deleteDisabledReason ? (
                      <TooltipContent>{deleteDisabledReason}</TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <DetailPanel
            label={t('users.email')}
            icon={<Mail className="size-4" />}
            value={record.email || t('common.noData')}
          />
          <DetailPanel
            label={t('users.phone')}
            icon={<Phone className="size-4" />}
            value={record.phone || t('common.noData')}
          />
          <DetailPanel
            label={t('users.createdAt')}
            icon={<Shield className="size-4" />}
            value={formatDateTime(record.createdAt, locale)}
          />
          <DetailPanel
            label={t('users.lockedUntil')}
            icon={<Shield className="size-4" />}
            value={
              record.lockedUntil
                ? formatDateTime(record.lockedUntil, locale)
                : t('users.notLocked')
            }
          />
        </div>
      </section>

      {isAdminViewer && isEditing ? (
        <section className="surface-card border-0 p-5 sm:p-6">
          <div className="mb-5">
            <p className="section-kicker">{t('users.edit')}</p>
            <h3 className="mt-2 text-xl font-semibold">{record.displayName}</h3>
          </div>
          <UserForm
            mode="edit"
            initialValues={{
              email: record.email || '',
              displayName: record.displayName,
              phone: record.phone || '',
              role: record.role,
              preferredLanguage: record.preferredLanguage,
            }}
            allowedRoles={allowedRoles}
            isLoading={isSaving}
            onSubmit={handleUpdate}
          />
        </section>
      ) : null}

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('users.delete')}
        description={t('users.deleteConfirm')}
        confirmText={isDeleting ? t('common.loading') : t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
