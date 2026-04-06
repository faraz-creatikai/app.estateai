export interface subLocationAllDataInterface {
    Name:string;
    Status:string;
    City:string;
    Location:string;
}

export interface subLocationGetDataInterface {
    _id: string;
    Name:string;
    Status:string;
    City:{
        _id: string,
        Name: string
    };
    Location:{
        _id: string,
        Name: string
    };
}

export interface subLocationDialogDataInterface {
    id: string;
    Name:string;
    Status:string;
    City:string;
    Location:string;
  }

export interface subLocationDeleteAllPayloadInterface {
    subLocationIds: string[];
}