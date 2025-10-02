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
  ],
  "car-lockout": [
    { q: "What should I do if I'm locked out of my car?", a: "Stay in a safe, well-lit area if possible and call a licensed locksmith. Avoid coat hangers or prying tools, which can damage weatherstripping, sensors, or airbags." },
    { q: "Can you unlock my car without damage?", a: "Yes. We use non-destructive entry tools and techniques designed for modern vehicles, including protected door latches and frameless windows." },
    { q: "How fast can a technician arrive?", a: "Response times vary by traffic and distance. We provide an ETA on your call and update you in transit." },
    { q: "Are after-hours car lockouts more expensive?", a: "After-hours and holiday service may have different rates. We confirm pricing before work begins." }
  ],
  "car-key-replacement": [
    { q: "Can you make a car key without the original?", a: "Yes. We decode the lock or use VIN-based key code retrieval for many models, then program the transponder or smart key on-site." },
    { q: "Do you program push-to-start fobs?", a: "We program most proximity fobs and remotes, including immobilizer pairing and remote functions where supported." },
    { q: "Will you need my vehicle on site?", a: "Yes, programming and verification require the vehicle present with a charged battery and all existing keys available." },
    { q: "Should I reprogram or erase lost keys?", a: "For security, we can erase missing keys from the vehicle's memory so they no longer start the car." }
  ],
  "residential-rekey": [
    { q: "When should I rekey my home locks?", a: "Rekey after moving, lost or stolen keys, tenant turnover, or anytime you want to change who has access without replacing hardware." },
    { q: "What is rekeying versus replacing locks?", a: "Rekeying changes the pins inside the cylinder to work with a new key. Replacement swaps the entire lockset and is only needed for worn or upgrade reasons." },
    { q: "Can you match all doors to one key?", a: "Yes. We can key-alike compatible locks so one key operates multiple doors if the hardware supports it." },
    { q: "How long does rekeying take?", a: "Most homes take 30–90 minutes depending on the number of cylinders and any needed adjustments." }
  ],
  "commercial-locksmith": [
    { q: "Do you service commercial door hardware?", a: "Yes. We service lever sets, mortise locks, exit devices, door closers, restricted key systems, and master key systems." },
    { q: "Can you set up a master key system?", a: "We design and implement hierarchies so managers, departments, and tenants have the right access with audit-friendly key control." },
    { q: "Do you offer restricted or patented keys?", a: "We supply restricted key systems that prevent unauthorized duplication and support tracked issuance." },
    { q: "Can you repair or adjust door closers and panic bars?", a: "Yes. We repair, adjust, or replace closers and exit devices to meet life-safety and code requirements." }
  ],
  "safe-ignition": [
    { q: "Do you open home or office safes?", a: "We open many safe types using non-destructive methods when possible, then service or reset combinations as needed." },
    { q: "My ignition is sticking or won't turn, can you fix it?", a: "Yes. We diagnose wafers and housings, clean or replace components, and cut keys to factory specs to restore smooth turning." },
    { q: "Will an ignition repair require a new key?", a: "Sometimes. We can rekey the new ignition to match your existing key when the platform allows." },
    { q: "Can you extract broken keys from ignitions or locks?", a: "Yes. We remove broken fragments and check for internal damage before cutting a replacement key." }
  ]
};