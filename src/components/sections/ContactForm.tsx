"use client";

import { useState, type FormEvent } from "react";
import site from "@/lib/data/site.json";

const fieldClass =
  "w-full rounded-xl border border-border bg-background-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-accent focus:outline-none";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = encodeURIComponent(`Hello from ${name || "a future member"}`);
    const body = encodeURIComponent(
      `${message}\n\n— ${name}${email ? ` (${email})` : ""}`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@uml.edu"
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Message
        </span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I want to build something with you all..."
          className={`${fieldClass} resize-none`}
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_var(--color-accent-soft)]"
      >
        Send message
      </button>
    </form>
  );
}
