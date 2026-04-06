export interface ScheduleType {
  _id?: string; // MongoDB id
  date: string;
  Time: string;
  Description: string;
  User: string;
}

export interface ScheduleTetDataInterface {
  _id: string; // MongoDB id
  date: string;
  Time: string;
  Description: string;
  User: string;
}

export interface schedulesDeletePayloadInterface{
  scheduleIds:string[];
}

export interface DeleteDialogDataInterface {
  id: string;
  description: string;
  date: string;
}

