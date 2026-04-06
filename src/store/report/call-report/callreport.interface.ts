export interface CallReport {
  id: string;
  customerId: string | null;
  participantIdentity: string;
  agentId: string;
  organizationId: string;
  calledTo: string;
  normalizedPhone: string;
  callDirection: string;
  callStatus: string;
  callDuration: string;
  startTime: string;
  endTime: string;
  recordingUrl: string;
  transcript: string;
  summary: string;
  sentiment: string;
  customerName: string | null;
  totalCallCost: string;
  createdAt: string;
}

export interface CallReportResponse {
  success: boolean;
  count: number;
  data: CallReport[];
}