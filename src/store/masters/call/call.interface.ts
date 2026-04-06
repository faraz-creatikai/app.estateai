export interface callAllDataInterface {
customerNumber:string;
}

export interface callGetDataInterface {
    customerNumber:string;
}
export interface callAllCustomerInterface {
    templateId: string,
    customerIds: string[]
}
export interface callAllContactInterface {
    templateId: string,
    contactIds: string[]
}
export interface callDialogDataInterface {
    id: string;
    name: string;
    status: string;
}


