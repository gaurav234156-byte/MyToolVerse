"use client";

import * as React from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="container max-w-xl py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Contact us
      </h1>
      <p className="mt-3 text-muted-foreground">
        Found a bug, have a tool request, or just want to say hi? Send a
        message and we&apos;ll get back to you.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm text-muted-foreground">
        <Mail className="h-4 w-4 text-primary" />
        support@mytoolverse.com
      </div>

      {submitted ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="font-medium">Message sent</p>
          <p className="text-sm text-muted-foreground">
            Thanks for reaching out — we&apos;ll reply by email soon.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="mt-8 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input id="name" required placeholder="Your name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="How can we help?"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" className="mt-2 self-start">
            Send message
          </Button>
        </form>
      )}
    </div>
  );
}
