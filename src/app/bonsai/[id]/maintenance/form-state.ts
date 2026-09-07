// bonsai/form-state.tsと同じ理由("use server"ファイルは関数以外export不可)で分離。
export type MaintenanceFormState = {
  message: string | null;
  fieldErrors: Record<string, string[]>;
  values: Record<string, string>;
};

export const emptyMaintenanceFormState: MaintenanceFormState = {
  message: null,
  fieldErrors: {},
  values: {},
};
