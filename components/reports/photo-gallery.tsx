'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ImageOff, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import 'yet-another-react-lightbox/styles.css';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Role, ReportPhoto, ReportPhotoCategory } from '@/lib/api/types';
import { reportsApi } from '@/lib/api/reports';
import {
  invalidateResourceCache,
  invalidateResourceCacheByPrefix,
} from '@/stores/resource-cache-store';
import { errorToast, successToast } from '@/components/shared/error-toast';

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), {
  ssr: false,
});

interface Photo {
  id: string;
  url: string;
  category: ReportPhotoCategory;
}

interface PhotoGalleryProps {
  photos: Photo[];
  reportId?: string;
}

const PHOTO_CATEGORIES: { key: ReportPhotoCategory; label: string }[] = [
  { key: ReportPhotoCategory.PHONE_BOX, label: 'reports.phoneBoxPhotos' },
  { key: ReportPhotoCategory.PAYMENT_RECEIPT, label: 'reports.paymentReceiptPhoto' },
  { key: ReportPhotoCategory.POLICE_REPORT, label: 'reports.policeReportPhoto' },
];

export function PhotoGallery({ photos, reportId }: PhotoGalleryProps) {
  const t = useTranslations();
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReportPhotoCategory | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const isAdmin = user?.role === Role.ADMIN;

  const failedPhotoIds = useMemo(() => new Set(failedPhotos), [failedPhotos]);
  const validPhotos = useMemo(
    () => photos.filter((photo) => !failedPhotoIds.has(photo.id)),
    [failedPhotos, photos]
  );

  const groupedPhotos = useMemo(() => {
    const groups: Record<ReportPhotoCategory, Photo[]> = {
      [ReportPhotoCategory.PHONE_BOX]: [],
      [ReportPhotoCategory.PAYMENT_RECEIPT]: [],
      [ReportPhotoCategory.POLICE_REPORT]: [],
    };

    validPhotos.forEach((photo) => {
      if (groups[photo.category]) {
        groups[photo.category].push(photo);
      }
    });

    return groups;
  }, [validPhotos]);

  const handleDeletePhoto = async (photoId: string) => {
    if (!reportId) return;

    try {
      await reportsApi.deletePhoto(reportId, photoId);
      invalidateResourceCacheByPrefix(`reports:detail:${reportId}`);
      successToast(t('reports.photoDeleted'));
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('reports.loadError'),
      });
    }
  };

  const handleAddPhotos = async () => {
    if (!reportId || !selectedCategory || uploadingFiles.length === 0) return;

    setIsUploading(true);
    try {
      await reportsApi.uploadPhotos(reportId, selectedCategory, uploadingFiles);
      invalidateResourceCacheByPrefix(`reports:detail:${reportId}`);
      successToast(t('reports.photosUploaded'));
      setUploadModalOpen(false);
      setUploadingFiles([]);
    } catch (error) {
      errorToast({
        error,
        fallbackMessage: t('reports.loadError'),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openUploadModal = (category: ReportPhotoCategory) => {
    setSelectedCategory(category);
    setUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadingFiles(Array.from(e.target.files));
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="mb-4 size-12 text-muted-foreground/60" />}
        title={t('reports.noPhotos')}
        description={t('reports.noPhotosDesc')}
      />
    );
  }

  return (
    <div className="grid gap-6">
      {PHOTO_CATEGORIES.map(({ key, label }) => {
        const categoryPhotos = groupedPhotos[key];
        if (categoryPhotos.length === 0) return null;

        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="section-kicker">{t(label)}</p>
              {isAdmin && reportId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl"
                  onClick={() => openUploadModal(key)}
                >
                  <Plus className="size-3" />
                  {t('common.add')}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {categoryPhotos.map((photo, photoIndex) => {
                const failed = failedPhotoIds.has(photo.id);
                const globalIndex = validPhotos.findIndex(
                  (p) => p.id === photo.id
                );

                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      if (failed) return;
                      setIndex(globalIndex);
                      setOpen(true);
                    }}
                    className="surface-card-muted group relative aspect-square overflow-hidden rounded-[1.5rem] border p-0 text-start"
                  >
                    {failed ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                        <ImageOff className="size-6 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {t('reports.photoUnavailable')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={photo.url}
                          alt={`${t('reports.photos')} ${photoIndex + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() =>
                            setFailedPhotos((current) =>
                              current.includes(photo.id)
                                ? current
                                : [...current, photo.id]
                            )
                          }
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 to-transparent px-4 py-3 text-xs font-medium text-white">
                          {t('reports.photoLabel', { number: photoIndex + 1 })}
                        </div>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(photo.id);
                            }}
                            className="absolute end-1 top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {isAdmin && reportId && (
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory && t(`reports.addPhotos.${selectedCategory.toLowerCase()}`)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />
              {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t('reports.selectedFiles', { count: uploadingFiles.length })}
                  </p>
                  {uploadingFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-muted p-2"
                    >
                      <span className="truncate text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadingFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                onClick={handleAddPhotos}
                disabled={isUploading || uploadingFiles.length === 0}
                className="w-full"
              >
                {isUploading ? t('common.loading') : t('reports.uploadPhotos')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {open && validPhotos.length > 0 ? (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={validPhotos.map((photo) => ({ src: photo.url }))}
        />
      ) : null}
    </div>
  );
}