import React from "react";
import clsx from "clsx";

interface PillBadgeProps {
  children: React.ReactNode;
  variant?: "services" | "about" | "testimonials" | "pricing" | "contact";
}

const PillBadge: React.FC<PillBadgeProps> = ({ children, variant = "services" }) => {
  const gradientMap = {
    services: "from-red-600 via-blue-600 to-red-600",
    about: "from-pink-500 via-purple-500 to-pink-500",
    testimonials: "from-blue-500 via-cyan-500 to-blue-500",
    pricing: "from-orange-600 via-orange-400 to-amber-500",
    contact: "from-red-500 via-rose-500 to-red-500",
  };

  return (
    <div className={clsx(
      "inline-block px-6 py-2 rounded-full font-semibold text-white text-lg mb-6 shadow-lg",
      "bg-gradient-to-r animate-gradient-slide bg-[length:200%_auto] bg-[position:0%_50%]",
      gradientMap[variant]
    )}>
      {children}
    </div>
  );
};

export default PillBadge;