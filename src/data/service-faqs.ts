export type FaqItem = { q: string; a: string };
export type ServiceFaqMap = Record<string, FaqItem[]>;

/**
 * Key by the service route segment used by DynamicServicePage (e.g., "residential",
 * "automotive", "rekeying", "duplication", "extraction", "consultation").
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
  ]
};