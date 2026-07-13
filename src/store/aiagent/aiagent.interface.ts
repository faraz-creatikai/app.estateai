export interface aiagentAllDataInterface {
    name: string;
    description: string;
    type: string;
    status: string;
    campaign: string;
    targetSegment: string;
    capability: string;
    promptRole?: string;
    webhookUrl?: string;
    webhookMethod?: string;
    webhookHeaders?: Record<string, string> | null;
    webhookPayload?: Record<string, any> | null;
}

export interface aiagentGetDataInterface {
    _id: string;
    name: string;
    description: string;
    type: string;
    status: string;
    campaign: string;
    targetSegment: string;
    capability: string;
}

export interface aiagentAssignInterface {
  agentId: string;
  userIds: string[];
}

export interface aiagentDialogDataInterface {
    id: string;
    name: string,
    status: string
}