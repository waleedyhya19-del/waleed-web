'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from '@/lib/i18n/routing';
import { reportsApi } from '@/lib/api/endpoints';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';
import { ApiError } from '@/lib/api/errors';
import { ReportCategory, ReportType } from '@/lib/api/types';
import { reportCategoryKey, reportTypeKey } from '@/lib/i18n/enums';

const schema = z.object({
  type: z.enum([
    ReportType.LOST,
    ReportType.STOLEN,
    ReportType.FOUND,
    ReportType.INTENT_TO_PURCHASE,
  ]),
  reportCategory: z.enum([ReportCategory.BASIC, ReportCategory.LAWYER_REQUEST]),
  imei1: z.string().regex(/^\d{15}$/, 'errors.invalidImei').optional().or(z.literal('')),
  phoneBrand: z.string().optional(),
  phoneModel: z.string().optional(),
  lastPhoneNumber1: z.string().optional(),
  description: z.string().max(2000).optional(),
});
type FormValues = z.infer<typeof schema>;

export function NewReportForm() {
  const t = useTranslations();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [phoneBoxPhotos, setPhoneBoxPhotos] = useState<File[]>([]);
  const [paymentReceiptPhoto, setPaymentReceiptPhoto] = useState<File[]>([]);
  const [policeReportPhoto, setPoliceReportPhoto] = useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: ReportType.LOST,
      reportCategory: ReportCategory.BASIC,
      imei1: '',
      phoneBrand: '',
      phoneModel: '',
      lastPhoneNumber1: '',
      description: '',
    },
  });

  const onSubmit = async (v: FormValues) => {
    if (phoneBoxPhotos.length === 0) {
      toast.error(t('errors.validation'));
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...v, imei1: v.imei1 || undefined };
      const report = await reportsApi.create(payload, {
        phoneBoxPhotos,
        paymentReceiptPhoto: paymentReceiptPhoto.length ? paymentReceiptPhoto : undefined,
        policeReportPhoto: policeReportPhoto.length ? policeReportPhoto : undefined,
      });
      toast.success(t('common.create'));
      router.replace(`/portal/reports/${report.id}`);
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title={t('reports.createTitle')} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.fields.type')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ReportType).map((v) => (
                        <SelectItem key={v} value={v}>
                          {t(reportTypeKey(v))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reportCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.fields.category')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ReportCategory).map((v) => (
                        <SelectItem key={v} value={v}>
                          {t(reportCategoryKey(v))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imei1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.fields.imei1')}</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" maxLength={15} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phoneBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('reports.fields.phoneBrand')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('reports.fields.phoneModel')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="lastPhoneNumber1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.fields.lastPhoneNumber1')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <PhotoField
              label={t('reports.photos.phoneBoxTitle')}
              files={phoneBoxPhotos}
              setFiles={setPhoneBoxPhotos}
              multiple
              required
            />
            <PhotoField
              label={t('reports.photos.paymentReceiptTitle')}
              files={paymentReceiptPhoto}
              setFiles={setPaymentReceiptPhoto}
            />
            <PhotoField
              label={t('reports.photos.policeReportTitle')}
              files={policeReportPhoto}
              setFiles={setPoliceReportPhoto}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function PhotoField({
  label,
  files,
  setFiles,
  multiple,
  required,
}: {
  label: string;
  files: File[];
  setFiles: (fs: File[]) => void;
  multiple?: boolean;
  required?: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ms-1 text-destructive">*</span>}
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs">
            <span className="truncate max-w-[10rem]">{f.name}</span>
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setFiles(files.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs hover:bg-accent/10">
        <Upload className="h-4 w-4" />
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png"
          multiple={multiple}
          onChange={(e) => {
            const list = e.target.files ? Array.from(e.target.files) : [];
            setFiles(multiple ? [...files, ...list] : list);
            e.target.value = '';
          }}
        />
        {label}
      </label>
    </div>
  );
}
