export interface whatsappAllDataInterface {
    name:string;
    body:string;
    status:string;
}

export interface whatsappGetDataInterface {
    _id: string;
    name:string;
    status?:string;
    body?:string;
}


export interface whatsappAllCustomerInterface {
    templateId: string,
    customerIds: string[]
}
export interface whatsappAllContactInterface {
    templateId: string,
    contactIds: string[]
}

export interface whatsappDialogDataInterface {
    id: string;
    name:string;
    status:string;
  }
 

  