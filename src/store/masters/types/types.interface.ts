export interface typesAllDataInterface {
    Campaign: string;
    Name: string;
    Status: string;
}

export interface typesGetDataInterface {
    _id: string;
    Campaign: {
        _id: string,
        Name: string
    };
    Name: string;
    Status: string;
}

export interface typesDialogDataInterface {
    id: string;
    Name: string;
    Status: string;
}

export interface typeDeleteAllPayloadInterface {
  typeIds: string[];
}