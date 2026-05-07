import { z } from 'zod';

export const reportWorkflowSchema = z.object({
  defaultLawyerDepositAmount: z.number().int().min(0).nullable(),
});

export type ReportWorkflowInput = z.infer<typeof reportWorkflowSchema>;