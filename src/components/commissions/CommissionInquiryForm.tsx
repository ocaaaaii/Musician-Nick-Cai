"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  validateCommissionInquiry,
  type CommissionInquiryFieldErrors,
  type CommissionInquiryInput,
} from "@/lib/validation/commission-inquiry";
import { submitCommissionInquiry } from "@/app/[locale]/commissions/actions";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY_INPUT: Omit<CommissionInquiryInput, "formLoadedAt"> = {
  type: "TRANSCRIPTION",
  name: "",
  email: "",
  phone: "",
  audioUrl: "",
  details: "",
  honeypot: "",
};

export function CommissionInquiryForm() {
  const t = useTranslations("commissions.form");
  // Lazy initializer so formLoadedAt is captured at mount time, not at
  // module evaluation - see design.md, Decision 1.
  const [input, setInput] = useState<CommissionInquiryInput>(() => ({
    ...EMPTY_INPUT,
    formLoadedAt: Date.now(),
  }));
  const [fieldErrors, setFieldErrors] = useState<CommissionInquiryFieldErrors>(
    {}
  );
  const [status, setStatus] = useState<Status>("idle");

  const fieldMessage = (key?: string) => {
    if (key === "required") return t("fieldRequired");
    if (key === "invalid") return t("fieldInvalid");
    return undefined;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateCommissionInquiry(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("submitting");
    const result = await submitCommissionInquiry(input);
    if (result.ok) {
      setStatus("success");
    } else {
      setFieldErrors(result.fieldErrors ?? {});
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p className="font-body text-sm text-ink">{t("success")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot - real users never see this field; bots that auto-fill
          every input tend to fill it. Not display:none, since some bots
          skip those. See design.md, Decision 1. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={input.honeypot}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, honeypot: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          {t("type")}
        </label>
        <select
          value={input.type}
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              type: e.target.value as CommissionInquiryInput["type"],
            }))
          }
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        >
          <option value="TRANSCRIPTION">{t("typeTranscription")}</option>
          <option value="COLLABORATION">{t("typeCollaboration")}</option>
        </select>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          {t("name")}
        </label>
        <input
          type="text"
          value={input.name}
          onChange={(e) => setInput((prev) => ({ ...prev, name: e.target.value }))}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
        {fieldMessage(fieldErrors.name) && (
          <p className="mt-1 font-mono text-[11px] text-red-700">
            {fieldMessage(fieldErrors.name)}
          </p>
        )}
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          {t("email")}
        </label>
        <input
          type="email"
          value={input.email}
          onChange={(e) => setInput((prev) => ({ ...prev, email: e.target.value }))}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
        {fieldMessage(fieldErrors.email) && (
          <p className="mt-1 font-mono text-[11px] text-red-700">
            {fieldMessage(fieldErrors.email)}
          </p>
        )}
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          {t("phone")}
        </label>
        <input
          type="tel"
          value={input.phone}
          onChange={(e) => setInput((prev) => ({ ...prev, phone: e.target.value }))}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          {t("audioUrl")}
        </label>
        <input
          type="text"
          value={input.audioUrl}
          onChange={(e) => setInput((prev) => ({ ...prev, audioUrl: e.target.value }))}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
        {fieldMessage(fieldErrors.audioUrl) && (
          <p className="mt-1 font-mono text-[11px] text-red-700">
            {fieldMessage(fieldErrors.audioUrl)}
          </p>
        )}
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
          {t("details")}
        </label>
        <textarea
          value={input.details}
          onChange={(e) => setInput((prev) => ({ ...prev, details: e.target.value }))}
          rows={4}
          className="mt-1.5 w-full border border-ink/20 bg-transparent px-3 py-2 font-body text-sm text-ink focus:border-brass focus:outline-none"
        />
        {fieldMessage(fieldErrors.details) && (
          <p className="mt-1 font-mono text-[11px] text-red-700">
            {fieldMessage(fieldErrors.details)}
          </p>
        )}
      </div>

      {status === "error" && !Object.keys(fieldErrors).length && (
        <p className="font-mono text-[11px] text-red-700">
          {t("errorGeneric")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center gap-2 border border-ink/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
