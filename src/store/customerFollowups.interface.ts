import { customerAllDataInterface, customerGetDataInterface } from "./customer.interface";

export interface customerFollowupAllDataInterface {
    _id?: string;
    customer:string;
    StartDate:string;
    StatusType:string;
    FollowupNextDate:string;
    Description:string;
    Name?:string;
}

export interface customerFollowupGetDataInterface {
    _id: string;
    customer?: customerGetDataInterface;
    customerid:string;
    StatusType?:string;
    Name: string;
    ContactNumber: string;
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
    userPrompt: string
  }