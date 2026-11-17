import { useState, type FormEvent } from "react";
// A bounded intake assistant: no arrival-time or price promises, and no third-party chat data transfer.
export default function CallbackAssistant() {
  const [open, setOpen] = useState(false),
    [mode, setMode] = useState("choose"),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setNotice("");
    if (import.meta.env.VITE_ENABLE_FORM_SEND !== "true") {
      setNotice(
        "Online intake is unavailable in this preview. Please call (402) 556-6715.",
      );
      setBusy(false);
      return;
    }
    try {
      const fields = Object.fromEntries(new FormData(form)) as Record<
        string,
        string
      >;
      const body = new URLSearchParams({
        ...fields,
        "form-name": "contact",
        source: "chat",
        handoff_id: key,
        urgency: "scheduled",
        message: `Requested timing: ${fields.timing}. ${fields.message || ""}`,
      });
      const r = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!r.ok) throw new Error("not_accepted");
      setMode("received");
      setNotice(
        "The website accepted your callback request. Staff will review pricing and availability. For an emergency, call now.",
      );
    } catch {
      setNotice(
        "Your request has not been confirmed. Retry or call (402) 556-6715.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-label="Callback assistant"
      className="mx-auto max-w-3xl px-6 py-8 text-white"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-xl border border-white/30 px-5 py-3"
      >
        Need help? Request a callback
      </button>
      {open && (
        <div className="mt-4 rounded-2xl border border-white/20 bg-[#0d152b] p-6">
          <h2 className="text-xl font-semibold">How can we help?</h2>
          <p className="my-4">
            Locked out? Call our existing emergency number now.
          </p>
          <a
            className="inline-block rounded-lg bg-red-700 px-5 py-3 font-semibold"
            href="tel:+14025566715"
          >
            Call (402) 556-6715
          </a>
          {mode === "choose" && (
            <p className="mt-5">
              <button
                type="button"
                onClick={() => setMode("scheduled")}
                className="rounded-lg border border-white/30 px-4 py-3"
              >
                Scheduled work, a quote, or talk to staff
              </button>
            </p>
          )}
          {mode === "scheduled" && (
            <form className="mt-5 grid gap-4" onSubmit={(e) => void submit(e)}>
              <p>
                For rekeying, auto keys, pricing, availability or unusual work,
                staff will review your request. No arrival time or quotation is
                promised here.
              </p>
              <label>
                Name
                <input
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="mt-1 block w-full rounded bg-white/10 p-3"
                />
              </label>
              <label>
                Callback number
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={40}
                  pattern="[+0-9() .-]{7,40}"
                  autoComplete="tel"
                  className="mt-1 block w-full rounded bg-white/10 p-3"
                />
              </label>
              <label>
                Service
                <select
                  name="service"
                  className="mt-1 block w-full rounded bg-[#17243f] p-3"
                >
                  <option>Residential</option>
                  <option>Automotive</option>
                  <option>Commercial</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Area or ZIP
                <input
                  name="area"
                  required
                  maxLength={120}
                  className="mt-1 block w-full rounded bg-white/10 p-3"
                />
              </label>
              <label>
                Preferred timing
                <input
                  name="timing"
                  required
                  maxLength={120}
                  className="mt-1 block w-full rounded bg-white/10 p-3"
                />
              </label>
              <label>
                How can staff help?
                <textarea
                  name="message"
                  maxLength={3000}
                  className="mt-1 block w-full rounded bg-white/10 p-3"
                />
              </label>
              <input name="email" type="hidden" value="" />
              <button
                disabled={busy}
                className="rounded-lg bg-red-700 px-5 py-3"
              >
                {busy ? "Sending…" : "Confirm callback request"}
              </button>
            </form>
          )}
          <p role="status" aria-live="polite" className="mt-4">
            {notice}
          </p>
        </div>
      )}
    </section>
  );
}
