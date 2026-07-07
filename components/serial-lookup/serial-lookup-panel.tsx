'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { serialLookupApi } from '@/lib/api/endpoints';
import type { SerialLookupResult } from '@/lib/api/endpoints/serial-lookup';
import { ApiError } from '@/lib/api/errors';
import { apiErrorKey } from '@/lib/i18n/dictionaries/error-copy';

export function SerialLookupPanel() {
  const t = useTranslations();
  const [imei, setImei] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SerialLookupResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{15}$/.test(imei)) {
      toast.error(t('errors.invalidImei'));
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const r = await serialLookupApi.lookup({ serial: imei });
      setResult(r);
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (t(apiErrorKey(e)) as string);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title={t('serialLookup.title')} description={t('serialLookup.subtitle')} />
      <form
        onSubmit={onSubmit}
        className="surface-card flex flex-col gap-3 p-6 sm:flex-row sm:items-center"
      >
        <Input
          inputMode="numeric"
          maxLength={15}
          value={imei}
          onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
          placeholder={t('serialLookup.placeholder')}
          className="flex-1"
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {t('serialLookup.submit')}
        </Button>
      </form>
      {result && (
        <div className="mt-4 surface-card p-6 text-sm">
          {t(`serialLookup.result.${result.result}`)}
        </div>
      )}
    </div>
  );
}
