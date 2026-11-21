import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play } from "lucide-react";

export default function Backdrop() {
  const video = useRef<HTMLVideoElement>(null);
  const [eligible, setEligible] = useState(false);
  const [paused, setPaused] = useState(false);
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
    const update = () => {
      if (document.hidden || paused) player.pause();
      else void player.play().catch(error => {
        if (error.name !== "AbortError") setPaused(true);
      });
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [eligible, paused]);
  return <>
    {createPortal(<div className="c1-backdrop" aria-hidden="true">
      {eligible && <video ref={video} muted playsInline loop preload="metadata" disablePictureInPicture
        poster="/images/poster.webp" src="/videos/wallpaper.mp4" onError={() => setEligible(false)} />}
    </div>, document.body)}
    {eligible && <button className="c1-motion" aria-label={paused ? "Play background video" : "Pause background video"}
      onClick={() => setPaused(value => !value)}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button>}
  </>;
}
