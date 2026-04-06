export interface customerAllDataInterface {
  Campaign: { id: string; name: string };
  CustomerType: { id: string; name: string };
  customerName: string;
  CustomerSubtype: { id: string; name: string };
  ContactNumber: string;
  City: { id: string; name: string };
  Location: { id: string; name: string };
  SubLocation: { id: string; name: string };
  Area: string;
  Address: string;
  Email: string;
  Facilities: string;
  ReferenceId: string;
  CustomerId: string;
  ClientId?: string;
  CustomerDate: string;
  CustomerYear: string;
  Other: string;
  Description: string;
  Video: string;
  GoogleMap: string;
  Price?: string;
  LeadType?: string;
  URL?: string;
  isFavourite?: boolean;
  Verified: string;
  CustomerFields?: any[];
  CustomerImage: File[];
  SitePlan: File
}

export interface customerImportDataInterface {
  Campaign: { id: string; name: string };
  CustomerType: { id: string; name: string };
  customerName: string;
  CustomerSubtype: { id: string; name: string };
  ContactNumber: string;
  City: string;
  Location: string;
  SubLocation: string;
  Area: string;
  Address: string;
  Email: string;
  Facilities: string;
  ReferenceId: string;
  CustomerId: string;
  CustomerDate: string;
  CustomerYear: string;
  Other: string;
  Description: string;
  Video: string;
  GoogleMap: string;
  Price?: string;
  URL?: string;
  isFavourite?: boolean;
  Verified: string;
}

export interface customerGetDataInterface {
  _id: string;
  Campaign: string;
  Type: string;
  SubType: string;
  Name: string;
  Description?: string;
  Email: string;
  City: string;
  Location: string;
  SubLocation?: string;
  ReferenceId?: string;
  isFavourite?: boolean;
  isChecked?: boolean;
  LeadTemperature?: string;
  ContactNumber: string;
  AssignTo: string[];
  Date: string;
  CustomerType: string;
  CustomerSubType: string;
  CustomerName: string;
  Reason: string;

  Facillities: string;
  CustomerId: string;
  ClientId?: string;
  Adderess: string;
  CustomerYear: string;
  Area: string;
  Other: string;
  SitePlan?: string;

  URL?: string;
  Video?: string;
  GoogleMap?: string;
  Price?: string;
  LeadType?: string;

  CustomerFields?: any;
  createdAt?: string;
}

// we are using this for Tablesetting button
// export interface customerGetDataInterface {
//   _id: string;
//   Campaign: string;
//   Type: string;
//   SubType: string;
//   Name: string;
//   Description?: string;
//   ReferenceId?: string;
//   Email: string;
//   SalaryRange?: string;
//   Experience?: string;
//   City: string;
//   Location: string;
//   isFavourite?: boolean;
//   ContactNumber: string;
//   AssignTo: string;
//   Date: string;
//   SitePlan?: string;
//   // that add by DJ
//   CustomerType: string;
//   CustomerSubType: string;
//   CustomerName: string;
//   Reason: string;
//   Skill? : string;
//   Facillities: string;
//   CustomerId: string;
//   Adderess: string;
//   CustomerYear: string;
//   Area: string;
//   Other: string;
// }

export interface CustomerAdvInterface {
  _id: string[];
  StatusAssign: string[];
  Campaign: string[];
  CustomerType: string[];
  CustomerSubtype: string[];
  City: string[];
  Location: string[];
  User: string[];
  StartDate: string;
  EndDate: string;
  Limit: string[];
}


export interface customerAssignInterface {
  assignToId: string | string[];
  customerIds?: string[];
  campaign?: string | string[];
  assignMode?: "selected" | "campaign" | "all";
}

export interface contactAssignInterface {
  contactIds: string[];
  assignToId: string;
}

export interface customerDeletePayloadInterface {
  customerIds: string[];
}

export interface customerCheckDuplicateInterface {
  contactNumbers: string[];
}

export interface DeleteDialogDataInterface {
  id: string;
  customerName: string;
  ContactNumber: string;
  isFavourite?: boolean;
  isChecked?: boolean;
}


export interface CheckDialogDataInterface {
  id: string;
  isChecked?: boolean;
}