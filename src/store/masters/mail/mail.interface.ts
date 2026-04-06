export interface mailAllDataInterface {
    name: string;
    subject: string;
    body: string;
    status: string;
}

export interface mailGetDataInterface {
    _id: string;
    name: string;
    status?: string;
    body?:string;
}
export interface mailAllCustomerInterface {
    templateId: string,
    customerIds: string[]
}
export interface mailAllContactInterface {
    templateId: string,
    contactIds: string[]
}
export interface mailDialogDataInterface {
    id: string;
    name: string;
    status: string;
}


