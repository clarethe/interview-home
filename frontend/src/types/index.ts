export interface Lead {
    id: number;
    firstName: string;
    lastName: string;
    gender?: string;
    countryCode: string;
    jobTitle: string;
    email: string;
    message?: string;
    createdAt: string;
    updatedAt: string;
    companyName?: string;
  }
  
  export interface ApiError {
    response?: {
      data: any;
      status: number;
      headers: any;
    };
    request?: any;
    message: string;
  }
  