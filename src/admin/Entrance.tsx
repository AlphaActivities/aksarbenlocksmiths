import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
// Timing and measured logo flight follow Missy's read-only 232babd reference.
export default function Entrance({ attention }: { attention: number | null }) {
  const logo = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(() => {
    try { return sessionStorage.getItem("c1-intro-viewed") ? "done" : "welcome"; }
    catch { return "welcome"; }
  });
  const complete = useRef(false);
  const initiallyDone = useRef(phase === "done");
  const [greeted, setGreeted] = useState(false);
  const finished = phase === "done";
  useEffect(() => {
    if (initiallyDone.current || finished) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    const greeting = setTimeout(() => setGreeted(true), 850);
    const flight = setTimeout(() => {
      const destination = Array.from(document.querySelectorAll("[data-brand-target]"))
        .find(element => element.getBoundingClientRect().width)
        ?.getBoundingClientRect();
      const origin = logo.current?.getBoundingClientRect();
      if (destination && origin) {
        logo.current?.animate(
          [
            { transform: "translate(0,0) scale(1)", offset: 0 },
            {
              transform: `translate(${destination.x + destination.width / 2 - origin.x - origin.width / 2}px,${destination.y + destination.height / 2 - origin.y - origin.height / 2}px) scale(${destination.width / origin.width})`,
              offset: 1,
            },
          ],
          {
            duration: 1060,
            fill: "forwards",
            easing: "cubic-bezier(.33,0,.18,1)",
          },
        );
      }
      setPhase("fly");
    }, 4000);
    const fade = setTimeout(() => setPhase("fade"), 5060);
    const finish = setTimeout(() => setPhase("done"), 5380);
    return () => {
      clearTimeout(greeting);
      clearTimeout(flight);
      clearTimeout(fade);
      clearTimeout(finish);
    };
  }, [finished]);
  useEffect(() => {
    if (phase === "done" && !complete.current) {
      complete.current = true;
      document.documentElement.dataset.c1Ready = "true";
      try { sessionStorage.setItem("c1-intro-viewed", "1"); }
      catch { /* The introduction still works when storage is unavailable. */ }
    }
  }, [phase]);
  if (phase === "done") return null;
  return (
    <div
      className={`c1-entrance ${phase}`}
      role="status"
      aria-label="Opening your private callback queue"
    >
      <p className="c1-greeting">Welcome to Aksarben</p>
      {greeted && attention !== null && attention > 0 && (
        <span className="c1-launch-bell">
          <Bell size={16} aria-hidden="true" /> {attention} need attention
        </span>
      )}
      <div className="c1-launch-logo" ref={logo}>
        <img src="/images/shield-logo.webp" alt="" />
        <span />
      </div>
      <div className="c1-launch-copy">
        <span className="c1-ring" />
        <p>
          Entering your
          <br />
          callback dashboard
        </p>
        <p className="c1-typed-date">
          {new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }).format(new Date())}
        </p>
      </div>
      <button type="button" onClick={() => setPhase("done")}>
        Skip introduction
      </button>
    </div>
  );
}
