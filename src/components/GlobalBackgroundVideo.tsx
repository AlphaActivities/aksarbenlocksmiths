import React, { useEffect, useRef } from "react";

const GlobalBackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const ensurePlay = () => {
      if (vid.paused) {
        vid.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", ensurePlay);
    window.addEventListener("focus", ensurePlay);

    ensurePlay();

    return () => {
      document.removeEventListener("visibilitychange", ensurePlay);
      window.removeEventListener("focus", ensurePlay);
    };
  }, []);

  return (
    <>
      <img
        src="/images/poster.webp"
        alt=""
        aria-hidden="true"
        className="hero-poster hero-bg fixed top-0 left-0 z-[-1] pointer-events-none select-none"
        loading="eager"
        decoding="async"
      />

      <video
        ref={videoRef}
        className="hero-video hero-bg fixed top-0 left-0 z-[-1] pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/poster.webp"
        aria-hidden="true"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      >
        <source
          src="/videos/wallpaper.mp4"
          type="video/mp4"
          media="(prefers-reduced-motion: no-preference)"
        />
      </video>
    </>
  );
};

export default GlobalBackgroundVideo;
