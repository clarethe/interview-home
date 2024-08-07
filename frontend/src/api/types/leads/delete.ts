export interface LeadsDeleteInput {
  id: number;
}

export interface LeadsDeleteOutput {
  success: boolean;
}

export interface LeadsDeleteManyInput {
  ids: number[];
}

export interface LeadsDeleteManyOutput {
  success: boolean;
}