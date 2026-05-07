'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { X, Upload } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { errorToast, successToast } from '@/components/shared/error-toast';
import { useRouter } from '@/i18n/routing';
import { reportsApi } from '@/lib/api/reports';
import { ReportType, ReportCategory } from '@/lib/api/types';
import {
  createReportSchema,
  type CreateReportInput,
} from '@/lib/validations/report';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';

interface PhotoFiles {
  phoneBoxPhotos: File[];
  paymentReceiptPhoto: File[];
  policeReportPhoto: File[];
}

function CategorizedPhotoDropzone({
  category,
  required = false,
  minFiles = 0,
  maxFiles = 1,
  files,
  onChange,
  disabled = false,
}: {
  category: string;
  required?: boolean;
  minFiles?: number;
  maxFiles?: number;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const t = useTranslations();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...files, ...newFiles].slice(0, maxFiles);
      onChange(combined);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{category}</Label>
        {required && <span className="text-destructive">*</span>}
        <span className="text-xs text-muted-foreground">
          ({files.length}/{maxFiles})
        </span>
      </div>
      <div className="relative">
        <Input
          type="file"
          multiple={maxFiles > 1}
          accept="image/jpeg,image/png"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={handleFileChange}
          disabled={disabled || files.length >= maxFiles}
        />
        <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border/70 bg-background/50 transition-colors hover:bg-background/70">
          <div className="text-center">
            <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('reports.dropzoneHint')}
            </p>
          </div>
        </div>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative rounded-lg border p-2"
            >
              <p className="truncate text-xs">{file.name}</p>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -end-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { id: 1, title: 'reports.step1Info' },
  { id: 2, title: 'reports.step2Photos' },
  { id: 3, title: 'reports.step3Details' },
] as const;

export function ReportCreatePageContent() {
  const t = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<PhotoFiles>({
    phoneBoxPhotos: [],
    paymentReceiptPhoto: [],
    policeReportPhoto: [],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    mode: 'onChange',
    defaultValues: {
      type: ReportType.LOST,
      reportCategory: ReportCategory.BASIC,
    },
  });

  const formValues = watch();
  const selectedCategory = formValues.reportCategory;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: CreateReportInput) => {
    setIsSaving(true);

    try {
      const formData = new FormData();

      formData.append('type', data.type);
      formData.append('reportCategory', data.reportCategory);

      if (data.imei1) formData.append('imei1', data.imei1);
      if (data.imei2) formData.append('imei2', data.imei2);
      if (data.phoneBrand) formData.append('phoneBrand', data.phoneBrand);
      if (data.phoneModel) formData.append('phoneModel', data.phoneModel);
      if (data.lastPhoneNumber1)
        formData.append('lastPhoneNumber1', data.lastPhoneNumber1);
      if (data.lastPhoneNumber2)
        formData.append('lastPhoneNumber2', data.lastPhoneNumber2);
      if (data.description) formData.append('description', data.description);
      if (data.lossDate) formData.append('lossDate', data.lossDate);
      if (data.lossArea) formData.append('lossArea', data.lossArea);
      if (data.lossAddress) formData.append('lossAddress', data.lossAddress);
      if (data.reporterFullName)
        formData.append('reporterFullName', data.reporterFullName);
      if (data.witnessFullName)
        formData.append('witnessFullName', data.witnessFullName);
      if (data.witnessLocation)
        formData.append('witnessLocation', data.witnessLocation);
      if (data.contactPhoneNumber)
        formData.append('contactPhoneNumber', data.contactPhoneNumber);
      if (data.paymentPhoneNumber)
        formData.append('paymentPhoneNumber', data.paymentPhoneNumber);
      if (data.depositAmount)
        formData.append('depositAmount', String(data.depositAmount));

      photoFiles.phoneBoxPhotos.forEach((file) => {
        formData.append('phoneBoxPhotos', file);
      });

      if (photoFiles.paymentReceiptPhoto[0]) {
        formData.append('paymentReceiptPhoto', photoFiles.paymentReceiptPhoto[0]);
      }

      if (photoFiles.policeReportPhoto[0]) {
        formData.append('policeReportPhoto', photoFiles.policeReportPhoto[0]);
      }

      const createdReport = await reportsApi.create(formData);

      invalidateResourceCache('dashboard:overview');
      invalidateResourceCache('reports:list');
      invalidateResourceCacheByPrefix('reports:detail:');
      successToast(t('reports.createSuccess'));
      router.push(`/reports/${createdReport.id}`);
    } catch (submitError) {
      errorToast({
        error: submitError,
        fallbackMessage: t('reports.loadError'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-grid">
      <ScrollReveal>
        <PageHeader
          eyebrow={t('navigation.reports')}
          title={t('reports.new')}
          description={t('reports.newDescription')}
          breadcrumbs={[
            { label: t('navigation.reports'), href: '/reports' },
            { label: t('reports.new') },
          ]}
        />
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <Card className="surface-card border-0 shadow-none">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                      currentStep >= step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="ms-2 text-sm hidden sm:inline">
                    {t(step.title)}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`ms-2 h-0.5 w-8 sm:w-16 ${
                        currentStep > step.id
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type">{t('reports.type')}</Label>
                      <Select
                        value={formValues.type}
                        onValueChange={(value) =>
                          setValue('type', value as ReportType)
                        }
                      >
                        <SelectTrigger
                          id="type"
                          className="h-12 rounded-2xl border-border/70 bg-background/70"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ReportType.LOST}>
                            {t('reports.lost')}
                          </SelectItem>
                          <SelectItem value={ReportType.STOLEN}>
                            {t('reports.stolen')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportCategory">
                        {t('reports.category')}
                      </Label>
                      <Select
                        value={formValues.reportCategory}
                        onValueChange={(value) =>
                          setValue(
                            'reportCategory',
                            value as ReportCategory
                          )
                        }
                      >
                        <SelectTrigger
                          id="reportCategory"
                          className="h-12 rounded-2xl border-border/70 bg-background/70"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ReportCategory.BASIC}>
                            {t('reports.categoryBasic')}
                          </SelectItem>
                          <SelectItem
                            value={ReportCategory.LAWYER_REQUEST}
                          >
                            {t('reports.categoryLawyer')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phoneBrand">
                        {t('reports.phoneBrand')}
                      </Label>
                      <Input
                        id="phoneBrand"
                        className="h-12 rounded-2xl border-border/70 bg-background/70"
                        {...register('phoneBrand')}
                      />
                      {errors.phoneBrand && (
                        <p className="text-sm text-destructive">
                          {errors.phoneBrand.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneModel">
                        {t('reports.phoneModel')}
                      </Label>
                      <Input
                        id="phoneModel"
                        className="h-12 rounded-2xl border-border/70 bg-background/70"
                        {...register('phoneModel')}
                      />
                      {errors.phoneModel && (
                        <p className="text-sm text-destructive">
                          {errors.phoneModel.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="imei1">{t('reports.imei1')}</Label>
                      <Input
                        id="imei1"
                        className="h-12 rounded-2xl border-border/70 bg-background/70"
                        {...register('imei1')}
                      />
                      {errors.imei1 && (
                        <p className="text-sm text-destructive">
                          {errors.imei1.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imei2">{t('reports.imei2')}</Label>
                      <Input
                        id="imei2"
                        className="h-12 rounded-2xl border-border/70 bg-background/70"
                        {...register('imei2')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <CategorizedPhotoDropzone
                    category={t('reports.phoneBoxPhotos')}
                    required
                    minFiles={2}
                    maxFiles={6}
                    files={photoFiles.phoneBoxPhotos}
                    onChange={(files) =>
                      setPhotoFiles((prev) => ({
                        ...prev,
                        phoneBoxPhotos: files,
                      }))
                    }
                  />

                  <CategorizedPhotoDropzone
                    category={t('reports.paymentReceiptPhoto')}
                    maxFiles={1}
                    files={photoFiles.paymentReceiptPhoto}
                    onChange={(files) =>
                      setPhotoFiles((prev) => ({
                        ...prev,
                        paymentReceiptPhoto: files,
                      }))
                    }
                  />

                  <CategorizedPhotoDropzone
                    category={t('reports.policeReportPhoto')}
                    maxFiles={1}
                    files={photoFiles.policeReportPhoto}
                    onChange={(files) =>
                      setPhotoFiles((prev) => ({
                        ...prev,
                        policeReportPhoto: files,
                      }))
                    }
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  {selectedCategory === ReportCategory.BASIC && (
                    <>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="lossDate">
                            {t('reports.lossDate')}
                          </Label>
                          <Input
                            id="lossDate"
                            type="date"
                            className="h-12 rounded-2xl border-border/70 bg-background/70"
                            {...register('lossDate')}
                          />
                          {errors.lossDate && (
                            <p className="text-sm text-destructive">
                              {errors.lossDate.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lossArea">
                            {t('reports.lossArea')}
                          </Label>
                          <Input
                            id="lossArea"
                            className="h-12 rounded-2xl border-border/70 bg-background/70"
                            {...register('lossArea')}
                          />
                          {errors.lossArea && (
                            <p className="text-sm text-destructive">
                              {errors.lossArea.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lossAddress">
                          {t('reports.lossAddress')}
                        </Label>
                        <Textarea
                          id="lossAddress"
                          className="min-h-20 rounded-[1rem] border-border/70 bg-background/70"
                          {...register('lossAddress')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">
                          {t('reports.description')}
                        </Label>
                        <Textarea
                          id="description"
                          className="min-h-32 rounded-[1.5rem] border-border/70 bg-background/70"
                          {...register('description')}
                        />
                      </div>
                    </>
                  )}

                  {selectedCategory === ReportCategory.LAWYER_REQUEST && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="reporterFullName">
                          {t('reports.reporterFullName')}
                        </Label>
                        <Input
                          id="reporterFullName"
                          className="h-12 rounded-2xl border-border/70 bg-background/70"
                          {...register('reporterFullName')}
                        />
                        {errors.reporterFullName && (
                          <p className="text-sm text-destructive">
                            {errors.reporterFullName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPhoneNumber">
                          {t('reports.contactPhoneNumber')}
                        </Label>
                        <Input
                          id="contactPhoneNumber"
                          type="tel"
                          className="h-12 rounded-2xl border-border/70 bg-background/70"
                          {...register('contactPhoneNumber')}
                        />
                        {errors.contactPhoneNumber && (
                          <p className="text-sm text-destructive">
                            {errors.contactPhoneNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="depositAmount">
                          {t('reports.depositAmount')}
                        </Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          min={0}
                          className="h-12 rounded-2xl border-border/70 bg-background/70"
                          {...register('depositAmount', {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-between gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="h-11 rounded-2xl px-5"
                >
                  {t('common.back')}
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-11 rounded-2xl px-5"
                  >
                    {t('common.next')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 rounded-2xl px-5"
                  >
                    {isSaving ? t('common.loading') : t('common.create')}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}