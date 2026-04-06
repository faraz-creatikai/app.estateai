export interface subtypeAllDataInterface {
    Campaign: string,
    CustomerType: string,
    Name: string,
    Status: string
}

export interface subtypeGetDataInterface {
    _id: string;
    Campaign: {
        _id: string,
        Name: string
    };
    CustomerType: {
        _id: string,
        Name: string
    };
    Name: string,
    Status: string
}

export interface subtypeDialogDataInterface {
    id: string;
    Name: string,
    Status: string
}

export interface subtypeDeleteAllPayloadInterface {
  subTypeIds: string[];
}