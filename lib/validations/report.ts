import { z } from 'zod';
import { ReportType, ReportStatus, ReportCategory } from '@/lib/api/types';

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export const createReportSchema = z.discriminatedUnion('reportCategory', [
  z.object({
    reportCategory: z.literal(ReportCategory.BASIC),
    type: z.nativeEnum(ReportType),
    imei1: z.string().regex(/^\d{15}$/, 'validation.imei1.invalid'),
    imei2: z.string().regex(/^\d{15}$/).optional().nullable(),
    phoneBrand: z.string().min(1, 'validation.phoneBrand.required'),
    phoneModel: z.string().min(1, 'validation.phoneModel.required'),
    lastPhoneNumber1: z.string().regex(E164_REGEX).optional().nullable(),
    lastPhoneNumber2: z.string().regex(E164_REGEX).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    lossDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    lossArea: z.string().min(1, 'validation.lossArea.required'),
    lossAddress: z.string().min(1).optional().nullable(),
    reporterFullName: z.string().min(1).optional(),
    witnessFullName: z.string().min(1).optional().nullable(),
    witnessLocation: z.string().min(1).optional().nullable(),
    contactPhoneNumber: z.string().regex(E164_REGEX).optional().nullable(),
    paymentPhoneNumber: z.string().regex(E164_REGEX).optional().nullable(),
    depositAmount: z.number().int().min(0).optional(),
  }),
  z.object({
    reportCategory: z.literal(ReportCategory.LAWYER_REQUEST),
    type: z.nativeEnum(ReportType),
    imei1: z.string().regex(/^\d{15}$/).optional(),
    imei2: z.string().regex(/^\d{15}$/).optional().nullable(),
    phoneBrand: z.string().min(1).optional(),
    phoneModel: z.string().min(1).optional(),
    lastPhoneNumber1: z.string().regex(E164_REGEX).optional().nullable(),
    lastPhoneNumber2: z.string().regex(E164_REGEX).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    lossDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    lossArea: z.string().min(1).optional(),
    lossAddress: z.string().min(1).optional().nullable(),
    reporterFullName: z.string().min(1, 'validation.reporterFullName.required'),
    witnessFullName: z.string().min(1).optional().nullable(),
    witnessLocation: z.string().min(1).optional().nullable(),
    contactPhoneNumber: z.string().regex(E164_REGEX, 'validation.contactPhoneNumber.invalid'),
    paymentPhoneNumber: z.string().regex(E164_REGEX).optional().nullable(),
    depositAmount: z.number().int().min(0, 'validation.depositAmount.invalid').optional(),
  }),
]);

export const updateReportSchema = z.object({
  type: z.nativeEnum(ReportType).optional(),
  reportCategory: z.nativeEnum(ReportCategory).optional(),
  imei1: z.string().regex(/^\d{15}$/).optional().nullable(),
  imei2: z.string().regex(/^\d{15}$/).optional().nullable(),
  phoneBrand: z.string().min(1).optional().nullable(),
  phoneModel: z.string().min(1).optional().nullable(),
  lastPhoneNumber1: z.string().regex(E164_REGEX).optional().nullable(),
  lastPhoneNumber2: z.string().regex(E164_REGEX).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  lossDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  lossArea: z.string().min(1).optional().nullable(),
  lossAddress: z.string().min(1).optional().nullable(),
  reporterFullName: z.string().min(1).optional().nullable(),
  witnessFullName: z.string().min(1).optional().nullable(),
  witnessLocation: z.string().min(1).optional().nullable(),
  contactPhoneNumber: z.string().regex(E164_REGEX).optional().nullable(),
  paymentPhoneNumber: z.string().regex(E164_REGEX).optional().nullable(),
  depositAmount: z.number().int().min(0).optional().nullable(),
});

export const updateReportStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus, 'validation.status.invalid'),
  note: z.string().max(1000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type CreateReportFiles = {
  phoneBoxPhotos?: File[];
  paymentReceiptPhoto?: File[];
  policeReportPhoto?: File[];
};