// "use server"ファイル(actions.ts)は非同期関数以外をexportできないため、
// フォームの初期stateはこちらの通常ファイルに分離する(bonsaiのform-state.tsと同じ理由)。
export type LoginFormState = {
  message: string | null;
  fieldErrors: Record<string, string[]>;
};

export const emptyLoginFormState: LoginFormState = {
  message: null,
  fieldErrors: {},
};
