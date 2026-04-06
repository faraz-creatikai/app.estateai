export interface userrequestsAllDataInterface {
    name:string;
    email:string;
    password?:string;
}

export interface userrequestGetDataInterface {
    _id:string;
    name:string;
    email:string;
    phone?:string;
}

export interface userrequestDialogDataInterface {
    id: string;
    name: string;
    email:string;
}