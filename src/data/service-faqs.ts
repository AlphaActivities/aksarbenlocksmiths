export type FaqItem = { q: string; a: string };
export type ServiceFaqMap = Record<string, FaqItem[]>;

/**
 * Key by the service route segment used by DynamicServicePage (e.g., "residential",
 * "automotive", "rekeying", "duplication", "extraction", "consultation", "emergency", "lock-repair").
 * Keep answers short, factual, and non-promissory. Avoid exact time guarantees.
 */
export const SERVICE_FAQS: ServiceFaqMap = {
  "residential": [
    { q: "Should I rekey or replace my locks after a move?", a: "Rekeying is often enough to invalidate old keys, while replacement makes sense for worn hardware or security upgrades." },
    { q: "Do you offer keyless or smart lock options?", a: "Yes, we install and support a range of smart deadbolts and keypads chosen for reliability and ease of use." },
    { q: "Can you key multiple doors alike?", a: "Yes, we can key compatible locks alike to reduce key clutter across main entry points." }
  ],
  "automotive": [
    { q: "Do you program transponder and push-to-start keys?", a: "Yes, mobile programmers pair most transponders and smart fobs on-site when vehicle support is available." },
    { q: "What should I prepare for a new key?", a: "Have your VIN, proof of ownership, and any remaining keys. We'll confirm availability for your year, make, and model." },
    { q: "Is towing required?", a: "Usually not. Mobile service is designed to cut and program many keys curbside, when supported by the vehicle." }
  ],
  "rekeying": [
    { q: "When is rekeying better than replacing?", a: "Choose rekeying when hardware functions well and you need new keys. Replace to fix wear or add features like higher-grade deadbolts." },
    { q: "Can you rekey to a single key for the house?", a: "Yes, compatible cylinders can be keyed alike for convenient access." },
    { q: "How long does rekeying take?", a: "Timing depends on door count and hardware type. You'll receive a clear estimate before work begins." }
  ],
  "duplication": [
    { q: "Can you duplicate high-security or restricted keys?", a: "We support many restricted keyways. Availability depends on system and authorization." },
    { q: "Will a copy work as well as the original?", a: "Cutting from code or a high-quality original yields the best results and reduces sticking." },
    { q: "Do you duplicate car keys too?", a: "Yes, including chip keys and many smart fobs, subject to vehicle support." }
  ],
  "extraction": [
    { q: "Can you remove a broken key without replacing the lock?", a: "Often yes. If the lock is otherwise healthy, extraction plus a fresh key is a common fix." },
    { q: "Why do keys break?", a: "Wear, bent keys, or misaligned doors increase stress on keys and cylinders." },
    { q: "What happens after extraction?", a: "We test function, advise on rekey or replacement if wear is present, and cut a fresh key if needed." }
  ],
  "consultation": [
    { q: "Do you provide on-site security assessments?", a: "Yes. We review doors, locks, lighting, and traffic to recommend practical upgrades." },
    { q: "Can you work within a budget?", a: "We provide options at different price points and prioritize the highest-impact upgrades first." },
    { q: "Do you support phased improvements?", a: "Yes, we can schedule staged upgrades to minimize disruption." }
  ],
  "emergency": [
    { q: "What qualifies as a locksmith emergency?", a: "Situations like home lockouts, broken keys, or urgent security breaches qualify as emergencies. We respond 24/7." },
    { q: "How fast can an emergency locksmith arrive?", a: "Response times vary by location and traffic conditions. We provide estimated arrival times when you call." },
    { q: "Do you charge extra for emergency calls?", a: "After-hours and emergency service may have different rates. Pricing is explained clearly before work begins." }
  ],
  "lock-repair": [
    { q: "What issues can be repaired versus replaced?", a: "Misalignment, loose hardware, and worn latches are often repairable. Severely worn or incompatible parts may require replacement." },
    { q: "Will you tell me when replacement is smarter?", a: "Yes, we explain costs and benefits so you can decide with clarity." },
    { q: "Do repairs come with new keys?", a: "If rekeying is part of the repair, we'll supply a fresh key set." }
  ]
};