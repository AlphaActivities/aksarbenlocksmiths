// Blog data, categories, and types. Backdated across five years with a recent ramp.
export type BlogCategory = "emergency" | "keys" | "residential" | "commercial";

export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  city: string;
  date: string; // ISO format, local business timezone America/Chicago
  excerpt: string;
  coverImage: string; // public path under /images/blog
  altText: string; // Descriptive alt text for the blog's cover image
  body: string; // plain text paragraphs separated by \n\n
  keywords: string[]; // SEO keywords array for schema
}

export const BLOG_CATEGORIES: { slug: BlogCategory; label: string }[] = [
  { slug: "emergency", label: "Emergency & Lockouts" },
  { slug: "keys", label: "Keys and Duplication" },
  { slug: "residential", label: "Residential Locksmith" },
  { slug: "commercial", label: "Commercial Locksmith" },
];

export const BLOG_POSTS: BlogPost[] = [
  // New post - Spare Car Key
  {
    slug: "why-papillion-drivers-need-a-spare-car-key",
    title: "Why Every Papillion Driver Should Have a Spare Car Key",
    category: "keys",
    city: "Papillion",
    date: "2021-03-17T00:00:00Z",
    excerpt: "Spare keys save time and money. Learn when to duplicate and what to bring to a key appointment.",
    coverImage: "/images/blog/handing-new-key.webp",
    altText: "Locksmith handing new spare car key to Papillion driver",
    body: "Getting locked out or losing your only car key can quickly turn into a major problem. For Papillion drivers, having a spare car key on hand means faster solutions, lower costs, and less stress. A spare key helps you avoid emergency lockouts, expensive dealership replacements, and wasted time waiting for help. Whether it's for your daily commute, family vehicle, or backup security, a spare key is one of the smartest ways Papillion drivers can stay prepared.\n\nAvoiding Emergency Lockouts\nWith a spare, you can skip the emergency call, tow, or overnight wait. Keep one at home or with a trusted family member for peace of mind.\n\nSaving Money Long Term\nProgramming or replacing one lost fob is often more expensive than cutting and coding a second spare while you still have a working key.\n\nConvenience for Families\nMultiple drivers for the same car? Spares prevent schedule conflicts and make sharing easier without constantly trading keys.\n\nFaster Service When Trouble Strikes\nLocksmiths in Omaha can program new spares much quicker if at least one working key is available. Without it, the process may require dealer codes or longer wait times.\n\nTips for Storing Your Spare Safely\nNever hide your spare inside the vehicle. Instead, keep it in a safe place at home, give one to a spouse, or use a coded lockbox for quick retrieval.\n\nFAQ Block:\n- Do I need proof of ownership for a spare key? Yes, locksmiths and dealers require ID and registration or title.\n- Can aftermarket keys work? Many do, but compatibility depends on your make and model. Ask before ordering.\n- Should I program more than one spare? If you can, yes — it's cheaper to do multiple at once.\n- How long does it take? With the right equipment and a working key, usually less than 30 minutes.\n- Do locksmiths erase old fobs? Only if requested for security reasons, such as after a theft.\n\nClosing CTA:\nDon't wait until you're stranded. Call Aksarben Locksmiths today to cut and program your spare key, so you're always prepared."
    keywords: ["Papillion spare car key", "Papillion locksmith", "car key replacement Papillion", "emergency locksmith Papillion", "Aksarben Locksmiths"]
  },

  // Year 1, five years ago
  {
    slug: "what-to-do-if-youre-locked-out-in-omaha",
    title: "What To Do If You Are Locked Out In Omaha",
    category: "emergency",
    city: "Omaha",
    date: "2020-02-15T00:00:00Z",
    excerpt: "Simple steps you can take during a lockout, how to stay safe, and when to call a licensed local locksmith.",
    coverImage: "/images/blog/car-lockout.webp",
    altText: "Person locked out of car in Omaha calling emergency locksmith",
    body:
      "Getting locked out happens to everyone.\n\nStay calm, confirm you have permission to access the property, and avoid risky entry attempts.\n\nCall a licensed local locksmith who can verify ownership and provide a damage free entry where possible.\n\nIn Omaha, mobile technicians can reach most neighborhoods quickly depending on traffic and current demand.",
    keywords: ["Omaha lockout", "emergency locksmith Omaha", "locked out Omaha", "24 hour locksmith Omaha", "Aksarben Locksmiths"]
  },
  {
    slug: "5-tips-to-keep-your-bellevue-home-secure",
    title: "Five Tips To Keep Your Bellevue Home Secure",
    category: "residential",
    city: "Bellevue",
    date: "2020-10-05T00:00:00Z",
    excerpt: "From door hardware to lighting and rekey schedules, here is how Bellevue families can boost everyday security.",
    coverImage: "/images/blog/house-lock.webp",
    altText: "Secure deadbolt lock on Bellevue home front door",
    body:
      "Security builds from basics first.\n\nUse quality deadbolts, strike plates with long screws, and keep door frames in good shape.\n\nRekey after moving or after key loss, and consider smart locks where appropriate.\n\nAsk a locksmith to evaluate weak points around sliding doors and garage entries.",
    keywords: ["Bellevue home security", "residential locksmith Bellevue", "home locks Bellevue", "rekey locks Bellevue", "Aksarben Locksmiths"]
  },

  // Year 2, four years ago
  {
    slug: "common-lock-problems-la-vista-businesses-face",
    title: "Common Lock Problems La Vista Businesses Face",
    category: "commercial",
    city: "La Vista",
    date: "2021-11-10T00:00:00Z",
    excerpt: "Door closer issues, worn cylinders, and key control gaps can cost time and security for local shops.",
    coverImage: "/images/blog/office-rekey.webp",
    altText: "Commercial locksmith rekeying office locks in La Vista business",
    body:
      "Busy doors wear faster.\n\nPlan maintenance for door closers, panic hardware, and cylinders.\n\nAdopt master key systems to control access and simplify keyed entries.\n\nSchedule after hours service to reduce downtime.",
    keywords: ["La Vista commercial locksmith", "business locks La Vista", "commercial door repair La Vista", "master key systems La Vista", "Aksarben Locksmiths"]
  },

  // Year 3, three years ago
  {
    slug: "avoid-late-night-lockouts-in-council-bluffs",
    title: "How To Avoid Late Night Lockouts In Council Bluffs",
    category: "emergency",
    city: "Council Bluffs",
    date: "2022-04-07T00:00:00Z",
    excerpt: "A few easy habits to reduce after hours emergencies and keep your evening on track.",
    coverImage: "/images/blog/locksmith-van.webp",
    altText: "Emergency locksmith van responding to late night call in Council Bluffs",
    body:
      "Create a key routine and a spare plan.\n\nStore a spare with a trusted person or in a secure lock box.\n\nConsider smart deadbolts for family access.\n\nIf you do get locked out, request your ETA during the call.\n\nArrival times vary based on demand, distance, and traffic.",
    keywords: ["Council Bluffs emergency locksmith", "late night lockout Council Bluffs", "24 hour locksmith Council Bluffs", "lockout prevention Council Bluffs", "Aksarben Locksmiths"]
  },
  {
    slug: "rekey-vs-replace-omaha",
    title: "Rekey Versus Replace, Omaha Homeowner Guide",
    category: "residential",
    city: "Omaha",
    date: "2022-09-22T00:00:00Z",
    excerpt: "When is it smarter to rekey instead of replacing the whole lock. Cost, security, and timelines explained.",
    coverImage: "/images/blog/keys-desk.webp",
    altText: "House keys on desk showing rekey versus replace options for Omaha homeowners",
    body:
      "Rekey keeps your existing hardware and changes which keys operate it.\n\nReplace when hardware is damaged or outdated.\n\nAfter a move or lost keys, rekey is usually the quickest path to restore control.",
    keywords: ["Omaha rekey locks", "rekey vs replace Omaha", "residential locksmith Omaha", "lock rekeying Omaha", "Aksarben Locksmiths"]
  },

  // Year 4, two years ago
  {
    slug: "car-key-programming-omaha-guide",
    title: "Car Key Programming, Omaha Driver Guide",
    category: "keys",
    city: "Omaha",
    date: "2023-02-12T00:00:00Z",
    excerpt: "What programming involves, which models can be done mobile, and what information you should have ready.",
    coverImage: "/images/blog/car-key-programming.webp",
    body: "If your key fob stops working in Omaha, you usually need programming, pairing, or a fresh fob coded to your vehicle. This quick guide shows what to bring and how a professional locksmith gets you moving again.\n\nWhat to bring to your appointment:\n• Photo ID and proof you own or are authorized to use the vehicle\n• Your vehicle make, model, year, and VIN (visible through the windshield)\n• Any existing keys or fobs, even if they only partly work\n• If possible, the exact key blade or remote part number\n\nHow key fob programming works:\nA mobile locksmith connects a diagnostic tool to your vehicle, verifies ownership, and places the car in programming mode. The new fob is then coded to your vehicle's immobilizer or remote system. Most sessions take only a few minutes once we have the correct fob and security access.\n\nOEM vs aftermarket fobs:\nBoth can work, but compatibility matters. A quality aftermarket unit can be a good choice when the original is unavailable. Your locksmith can advise which options are reliable for your specific make and model.\n\nCommon issues we solve every week:\n• Lost or stolen fobs that require erasing old profiles for security\n• Spare fob additions for families sharing the same car\n• Remote start and proximity (push-to-start) pairing\n• Battery, range, or intermittent signal problems\n\nSecurity and verification:\nLicensed locksmiths will confirm ownership before programming and may erase missing fobs so they can no longer start your vehicle. This protects you if a lost fob turns up later.\n\nWhen to call a pro vs the dealer:\nDealers are great for warranty work. For out-of-warranty or urgent situations, a mobile locksmith can come to you in Omaha and nearby cities, saving the tow and the wait.\n\nNext step — get help now:\nIf you need a working fob today, a mobile technician can come to your location, verify ownership, and program a new unit so you can get back on the road.\n\nPro tip:\nAsk for the newly programmed fob's details so you can order a spare later without guesswork."
  },
  {
    slug: "master-key-systems-for-gretna-shops",
    title: "Master Key Systems For Gretna Shops",
    category: "commercial",
    city: "Gretna",
    date: "2023-08-30T00:00:00Z",
    excerpt: "Improve access control while keeping daily operations simple. A quick overview for small teams.",
    coverImage: "/images/blog/key-cutting.webp",
    altText: "Locksmith cutting master keys for Gretna business access control system",
    body:
      "Master systems give managers higher level keys while employees carry limited access keys.\n\nThey reduce key duplication sprawl and improve accountability.\n\nWork with a locksmith to design a system that can grow with your business.",
    keywords: ["Gretna master key systems", "commercial locksmith Gretna", "business access control Gretna", "master keys Gretna", "Aksarben Locksmiths"]
  },

  // Year 5, recent ramp
  {
    slug: "top-5-emergency-locksmith-myths-omaha",
    title: "Top Five Emergency Locksmith Myths In Omaha",
    category: "emergency",
    city: "Omaha",
    date: "2024-11-15T00:00:00Z",
    excerpt: "Separating fact from fiction so you know what to expect when you call for help.",
    coverImage: "/images/blog/locksmith-tools.webp",
    altText: "Professional locksmith tools dispelling common myths about emergency locksmith services in Omaha",
    body:
      "Not every lock needs drilling.\n\nLicensed techs can often open doors without damage depending on the hardware.\n\nAsk questions, request your ETA during the call, and expect transparent pricing.",
    keywords: ["Omaha locksmith myths", "emergency locksmith facts Omaha", "locksmith misconceptions Omaha", "professional locksmith Omaha", "Aksarben Locksmiths"]
  },
  {
    slug: "transparent-locksmith-pricing-omaha",
    title: "Transparent Locksmith Pricing In Omaha",
    category: "residential",
    city: "Omaha",
    date: "2025-03-20T00:00:00Z",
    excerpt: "What drives pricing, how quotes work, and why transparency matters for trust.",
    coverImage: "/images/blog/happy-customer.webp",
    altText: "Happy Omaha customer receiving transparent pricing quote from professional locksmith",
    body:
      "Quotes consider distance, time, hardware, and complexity.\n\nClear pricing prevents surprises and builds long term relationships.\n\nAlways request a written estimate before work begins.",
    keywords: ["Omaha locksmith pricing", "transparent locksmith costs Omaha", "locksmith quotes Omaha", "fair pricing locksmith Omaha", "Aksarben Locksmiths"]
  },
  {
    slug: "mobile-locksmith-bellevue-time-saver",
    title: "Mobile Locksmith In Bellevue, A Real Time Saver",
    category: "emergency",
    city: "Bellevue",
    date: "2025-06-05T00:00:00Z",
    excerpt: "When mobile service makes sense and how to plan your appointment.",
    coverImage: "/images/blog/car-ignition.webp",
    altText: "Mobile locksmith working on car ignition repair in Bellevue",
    body:
      "Mobile units bring tools to you which reduces towing and downtime.\n\nAvailability depends on current demand.\n\nShare your exact location and lock or vehicle details to speed things up.",
    keywords: ["Bellevue mobile locksmith", "mobile locksmith service Bellevue", "car locksmith Bellevue", "emergency locksmith Bellevue", "Aksarben Locksmiths"]
  },
  {
    slug: "serving-omaha-for-over-a-decade",
    title: "How Aksarben Locksmiths Has Served Omaha For Over A Decade",
    category: "commercial",
    city: "Omaha",
    date: "2025-08-28T00:00:00Z",
    excerpt: "A quick look at our mobile service history and commitment to local customers.",
    coverImage: "/images/blog/house-key-duplication.webp",
    altText: "Aksarben Locksmiths providing house key duplication service in Omaha for over a decade",
    body:
      "From emergency unlocks to planned rekeys, our focus is dependable help and clear communication.\n\nWe invest in training, modern key machines, and customer first service.\n\nThank you Omaha and the surrounding cities for your trust.",
    keywords: ["Omaha locksmith decade service", "established locksmith Omaha", "trusted locksmith Omaha", "local locksmith Omaha", "Aksarben Locksmiths"]
  },
];

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}