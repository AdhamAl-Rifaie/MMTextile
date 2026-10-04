"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveTextileRequest, signOut, type FormState } from "@/app/actions";

const initialState: FormState = {
  message: "Ready to save a textile request."
};

export function TextileForm({ userEmail }: { userEmail: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(saveTextileRequest, initialState);

  useEffect(() => {
    if (state.tone === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="form-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Request form</h2>
          <p className="card-subtitle">Add the first two fields for now.</p>
        </div>
        <span className="user-pill" title={userEmail}>
          {userEmail}
        </span>
      </div>

      <form ref={formRef} action={action}>
        <div className="field-stack">
          <div className="field">
            <label htmlFor="customerName">Customer name</label>
            <input id="customerName" name="customerName" type="text" required />
          </div>

          <div className="field">
            <label htmlFor="fabricType">Fabric type</label>
            <input id="fabricType" name="fabricType" type="text" required />
          </div>
        </div>

        <button className="primary-button" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save data"}
        </button>

        <p className="status" data-tone={state.tone}>
          {state.message}
        </p>
      </form>

      <form action={signOut}>
        <button className="secondary-button" type="submit">
          Sign out
        </button>
      </form>
    </div>
  );
}
