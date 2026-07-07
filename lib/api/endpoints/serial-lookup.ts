import { apiRequest } from '../client';
import type { ReportStatus, ReportType, ReportCategory } from '../types';

export interface SerialLookupPayload {
  serial: string;
}

export interface SerialLookupNoMatch {
  result: 'NO_MATCH';
  message: string;
}

export interface SerialLookupMatch {
  result: 'CURRENTLY_REPORTED' | 'HISTORICALLY_REPORTED';
  ownedBySearcher: boolean;
  report: {
    id: string;
    type: ReportType;
    status: ReportStatus;
    reportCategory: ReportCategory;
    lossArea: string | null;
    createdAt: string;
    rewardIfDataIntact: number | null;
    rewardIfWiped: number | null;
  };
  additionalActiveMatches: number;
}

export type SerialLookupResult = SerialLookupNoMatch | SerialLookupMatch;

export const serialLookupApi = {
  lookup: (p: SerialLookupPayload) =>
    apiRequest<SerialLookupResult>('/serial-lookup', { method: 'POST', body: p }),
};
