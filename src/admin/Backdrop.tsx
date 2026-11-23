import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Decorative wallpaper is automatic and never occupies a dashboard control slot.
export default function Backdrop() {
  const video = useRef<HTMLVideoElement>(null);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => setEligible(motion.matches && !connection?.saveData);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!eligible || !player) return;
    const play = () => {
      if (document.hidden) {
        player.pause();
        return;
      }
      void player.play().catch(() => {
        // Keep the poster visible if autoplay is restricted.
        // A subsequent user gesture can retry without a visible Film button.
      });
    };
    play();
    document.addEventListener("visibilitychange", play);
    document.addEventListener("pointerdown", play, { once: true });
    document.addEventListener("keydown", play, { once: true });
    return () => {
      document.removeEventListener("visibilitychange", play);
      document.removeEventListener("pointerdown", play);
      document.removeEventListener("keydown", play);
    };
  }, [eligible]);

  return createPortal(
    <div className="c1-backdrop" aria-hidden="true">
      {eligible && <video ref={video} autoPlay muted playsInline loop preload="auto"
        disablePictureInPicture poster="/images/poster.webp" src="/videos/wallpaper.mp4"
        onError={() => setEligible(false)} />}
    </div>,
    document.body
  );
}
