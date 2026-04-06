export interface contacttypeAllDataInterface {
    Campaign:string;
    Name:string;
    Status:string;
}

export interface contacttypeGetDataInterface {
    _id: string;
    Campaign: {
        _id: string,
        Name: string
    };
    Name:string;
    Status:string;
}

export interface contacttypeDialogDataInterface {
    id: string;
    Name:string;
    Status:string;
  }