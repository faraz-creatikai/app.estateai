import { contactAllDataInterface } from "./contact.interface";

export interface contactFollowupAllDataInterface {
    _id?: string;
    contact: string;
    StartDate: string;
    StatusType: string;
    FollowupNextDate: string;
    Description: string;
}

export interface contactFollowupGetDataInterface {
    _id: string;
    contactid: string;
    Name: string;
    ContactNumber: string;
    User: string;
    Date: string;
}

export interface ContactFollowupAdvInterface {
    _id: string[];
    Campaign: string[];
    PropertyType: string[];
    StatusType: string[];
    City: string[];
    Location: string[];
    User: string[];
    Keyword: string;
    StartDate: string;
    EndDate: string;
    Limit: string[];
}

export interface DeleteDialogDataInterface {
    id: string;
    ContactNumber: string;
}

export interface FollowupDeleteDialogDataInterface {
    id: string;
    Name: string;
}
