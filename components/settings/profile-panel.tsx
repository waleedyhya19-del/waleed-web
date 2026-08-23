'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { usersApi } from '@/lib/api/endpoints';
import { useSessionStore } from '@/stores/session-store';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

const schema = z.object({
  displayName: z.string().min(2),
  phone: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ProfilePanel() {
  const t = useTranslations();
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: user?.displayName ?? '', phone: user?.phone ?? '' },
  });

  useEffect(() => {
    if (user) {
      form.reset({ displayName: user.displayName, phone: user.phone ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('errors.validation'));
      return;
    }
    setUploadingPhoto(true);
    try {
      const res = await usersApi.uploadMePhoto(file);
      if (user) {
        setUser({ ...user, profilePhotoUrl: res.profilePhotoUrl });
      }
      toast.success(t('settings.profile.photoUpdated'));
    } catch (err) {
      const msg = err instanceof ApiError && err.message ? err.message : (t(apiErrorKey(err)) as string);
      toast.error(msg);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const onRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      await usersApi.deleteMePhoto();
      if (user) {
        setUser({ ...user, profilePhotoUrl: null });
      }
      toast.success(t('settings.profile.photoRemoved'));
    } catch (err) {
      const msg = err instanceof ApiError && err.message ? err.message : (t(apiErrorKey(err)) as string);
      toast.error(msg);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      const updated = await usersApi.updateMe(v);
      setUser(updated);
      toast.success(t('settings.profile.updated'));
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title={t('settings.profile.title')} />
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.profilePhotoUrl ?? undefined} alt={user?.displayName} />
          <AvatarFallback>{user?.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs hover:bg-accent/10">
            {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            <span>{t('settings.profile.uploadPhoto')}</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png"
              disabled={uploadingPhoto}
              onChange={onPhotoSelected}
            />
          </label>
          {user?.profilePhotoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingPhoto}
              onClick={onRemovePhoto}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span>{t('settings.profile.removePhoto')}</span>
            </Button>
          )}
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.displayName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.phone')}</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
