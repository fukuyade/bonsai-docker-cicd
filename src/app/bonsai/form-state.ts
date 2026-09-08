// "use server"ファイル(actions.ts)は非同期関数以外をexportできないため、
// フォームの初期state(単なるオブジェクト)はこちらの通常ファイルに分離する。
export type BonsaiFormState = {
  message: string | null;
  fieldErrors: Record<string, string[]>;
  // エラーで差し戻す際、入力し直させないよう送信された値を保持しておく。
  // (指定しないと、他の項目まで空欄に戻ってしまう)
  values: Record<string, string>;
};

export const emptyBonsaiFormState: BonsaiFormState = {
  message: null,
  fieldErrors: {},
  values: {},
};

// 削除確認画面用のstate。削除は入力項目がないのでmessageだけを持つ。
export type BonsaiDeleteState = {
  message: string | null;
};

export const emptyBonsaiDeleteState: BonsaiDeleteState = {
  message: null,
};
