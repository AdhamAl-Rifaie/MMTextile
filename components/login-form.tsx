"use client";

import { useActionState } from "react";
import { loginAdmin, type FormState } from "@/app/actions";

const initialState: FormState = {
  message: "Use the local admin account to continue."
};

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAdmin, initialState);

  return (
    <form className="auth-card" action={action}>
      <div className="card-header">
        <div>
          <h2 className="card-title">Login</h2>
          <p className="card-subtitle">Access the MMTextile admin dashboard.</p>
        </div>
      </div>

      <div className="field-stack">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      <button className="primary-button" type="submit" disabled={isPending}>
        {isPending ? "Signing in..." : "Login"}
      </button>

      <p className="status" data-tone={state.tone}>
        {state.message}
      </p>
    </form>
  );
}
