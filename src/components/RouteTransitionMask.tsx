import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fixed, pointer-events-none mask that briefly shows during route swaps.
 * Color matches the site base (#0b1220). Duration is tiny, so no perceived delay,
 * only removal of the flash. No visual change to page content.
 */
export default function RouteTransitionMask() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const id = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        setVisible(false);
      });
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        zIndex: 0,
        backgroundColor: '#0b1220',
        opacity: visible ? 1 : 0,
        transition: 'opacity 80ms linear',
      }}
    />
  );
}
