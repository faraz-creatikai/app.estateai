export interface locationAllDataInterface {
    Name: string;
    Status: string;
    City: string;
}

export interface locationGetDataInterface {
    _id: string;
    Name: string;
    Status: string;
    City: {
        _id: string,
        Name: string
    };
}

export interface locationDialogDataInterface {
    id: string;
    Name: string;
    Status: string;
    City: string;
}

export interface locationDeleteAllPayloadInterface {
    locationIds: string[];
}