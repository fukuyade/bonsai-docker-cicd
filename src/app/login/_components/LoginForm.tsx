"use client";

import { useActionState } from "react";

import { loginAction } from "../actions";
import { emptyLoginFormState } from "../form-state";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    emptyLoginFormState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && (
        <p
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
        />
        {state.fieldErrors.email?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
        />
        {state.fieldErrors.password?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
