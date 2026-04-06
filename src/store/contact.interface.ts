export interface contactAllDataInterface {
    Campaign: { id: string, name: string };
    Name: string;
    City: { id:string, name:string};
    ContactType: { id: string, name: string };
    ContactNo: string;
    Location: {id: string, name:string};
    Email: string;
    CompanyName: string;
    Website: string;
    Status: string;
    Address: string;
    ContactIndustry: string;
    ContactFunctionalArea: string;
    ReferenceId: string;
    Notes: string,
    date: string
}

export interface contactGetDataInterface {
    _id: string;
    Name: string;
    Email: string;
    Campaign: string;
    Qualifications: string;
    Location: string;
    ContactNo: string;
    AssignTo: string;
    date: string
}

export interface ContactAdvInterface {
    _id: string[];
    StatusAssign: string[];
    Campaign: string[];
    ContactType: string[];
    City: string[];
    Location: string[];
    User: string[];
    Keyword: string;
    Limit: string[];
  }

  export interface contactAssignInterface{
  contactIds:string[];
  assignToId:string;
}

export interface contactDeletePayloadInterface{
  contactIds:string[];
}

export interface DeleteDialogDataInterface {
    id: string;
    contactName: string;
    contactEmail: string;
  }