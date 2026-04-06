export interface ContactFollowupInterface {
  Campaign: string;
  Range: string;
  ContactNo: string;
  Location: string;
  ContactType: string;
  Name: string;
  City: string;
  Address: string;
  ContactIndustry: string;
  ContactFunctionalArea: string;
  ReferenceId: string;
  Notes: string;
  Facilities: string;
  User: string;
  date: string;
  Email: string;
  CompanyName: string;
  Website: string;
  Status: string;
}

export interface ContactFollowupGetdataInterface{
    _id: string;
    Name: string;
    Email: string;
    Campaign: string;
    User:string,
    Location: string;
    ContactNo: string;
    AssignTo: string;
    date: string
}
