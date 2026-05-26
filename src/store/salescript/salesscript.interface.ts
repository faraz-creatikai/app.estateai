

export interface salesScriptGetDataInterface {
    _id: string;
    Name:string;
    Content:string;
    Status:string;
    mode: string;
    metadata:any;
    createdAt:string;
}

export interface salesScriptDialogDataInterface {
    id: string;
    Name:string;
    Status:string;
  }

  
export interface salesScriptAllDataInterface {
  Name: string;
  Status: string;
  Content: string;
  mode: string;
  metadata: any;
  createdAt: string;
}

export interface SalesScriptPayload {
  Name: string;
  Status: string;
  userPrompt: string;
  Content?: string;
  mode: "hindi" | "english";
  scriptMode?: "ai" | "manual";
}

export interface ApiResponse {
  _id: string;
  Name: string;
  Content: string;
  mode: string;
  metadata: {
    tone: string;
    tips: string[];
  };
  Status: string;
  createdAt: string;
  updatedAt: string;
}