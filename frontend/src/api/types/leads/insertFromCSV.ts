export interface InsertFromCSVInput {
    csvData: string;
  }
  
  export interface InsertFromCSVOutput {
    successCount: number;
    errorCount: number;
    errors?: Array<{
      row: number;
      message: string;
    }>;
  }