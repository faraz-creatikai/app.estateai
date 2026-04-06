export interface companyprojectAllDataInterface{
    ProjectName: string,
    ProjectType: string,
    ProjectStatus: string,
    City: {id:string,name:string},
    Location: {id:string,name:string},
    Area: string,
    Range: string,
    Adderess: string,
    Facillities: string,
    Amenities: string,
    Description: string,
    Video: string,
    GoogleMap: string,
    CustomerImage: File[],
    SitePlan:File,
}

export interface companyprojectGetDataInterface{
    _id: string;
    ProjectName: string,
    ProjectType: string,
    Location: string,
    Area: string,
    Range: string,
    Date: string,
}


export interface companyprojectDialogDataInterface {
    id: string;
    ProjectName: string;
    ProjectType: string;
  }