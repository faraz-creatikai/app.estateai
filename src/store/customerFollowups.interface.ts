import { customerAllDataInterface, customerGetDataInterface } from "./customer.interface";

export interface customerFollowupAllDataInterface {
    _id?: string;
    customer:string;
    StartDate:string;
    StatusType:string;
    FollowupNextDate:string;
    Description:string;
    Name?:string;
    CreatedBy?:string;
}

export interface customerFollowupGetDataInterface {
    _id: string;
    customer?: customerGetDataInterface;
    customerid:string;
    StatusType?:string;
    Name: string;
    ContactNumber: string;
    Email?:string;
    User:string;
    Date:string;
}

export interface CustomerFollowupAdvInterface {
    _id: string[];
    Campaign:string[];
    PropertyType:string[];
    StatusType:string[];
    City: string[];
    Location: string[];
    User: string[];
    Keyword:string;
    StartDate:string;
    EndDate:string;
    Limit: string[];
  }

export interface DeleteDialogDataInterface {
    id: string;
    ContactNumber:string;
  }

export interface FollowupDeleteDialogDataInterface {    
    id: string;
    Name:string;
  }

export interface customerAiFollowupPayloadInterface {
  customerIds: string[];
  userPrompt: string;
  language?: string;
  sendWhatsapp?: boolean;
  sendEmail?: boolean;
  confirm?: boolean;
  drafts?: Array<{
    customerId: string;
    data: any;
    whatsapp: string | null;
    emailContent: { subject: string; body: string } | null;
  }>;
}