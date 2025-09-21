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
  body: string; // plain text paragraphs separated by \n\n
}

export const BLOG_CATEGORIES: { slug: BlogCategory; label: string }[] = [
  { slug: "emergency", label: "Emergency & Lockouts" },
  { slug: "keys", label: "Keys and Duplication" },
  { slug: "residential", label: "Residential Locksmith" },
  { slug: "commercial", label: "Commercial Locksmith" },
];

export const BLOG_POSTS: BlogPost[] = [
  // New post - Key Fob Programming
  {
    slug: "key-fob-programming-omaha-guide",
    title: "Key Fob Programming in Omaha, What To Bring and How It Works",
    category: "keys",
    city: "Omaha",
    date: "2025-09-21T00:00:00Z",
    excerpt: "Fast same-day help for key fobs in Omaha. Learn what information to have ready, how programming works, and how to avoid common hiccups so you can get back on the road quickly.",
    coverImage: "/images/blog/key-fob-programming-omaha.webp",
    body: "If your key fob stops working in Omaha, you usually need programming, pairing, or a fresh fob coded to your vehicle. This quick guide shows what to bring and how a professional locksmith gets you moving again.\n\nWhat to bring to your appointment:\n• Photo ID and proof you own or are authorized to use the vehicle\n• Your vehicle make, model, year, and VIN (visible through the windshield)\n• Any existing keys or fobs, even if they only partly work\n• If possible, the exact key blade or remote part number\n\nHow key fob programming works:\nA mobile locksmith connects a diagnostic tool to your vehicle, verifies ownership, and places the car in programming mode. The new fob is then coded to your vehicle's immobilizer or remote system. Most sessions take only a few minutes once we have the correct fob and security access.\n\nOEM vs aftermarket fobs:\nBoth can work, but compatibility matters. A quality aftermarket unit can be a good choice when the original is unavailable. Your locksmith can advise which options are reliable for your specific make and model.\n\nCommon issues we solve every week:\n• Lost or stolen fobs that require erasing old profiles for security\n• Spare fob additions for families sharing the same car\n• Remote start and proximity (push-to-start) pairing\n• Battery, range, or intermittent signal problems\n\nSecurity and verification:\nLicensed locksmiths will confirm ownership before programming and may erase missing fobs so they can no longer start your vehicle. This protects you if a lost fob turns up later.\n\nWhen to call a pro vs the dealer:\nDealers are great for warranty work. For out-of-warranty or urgent situations, a mobile locksmith can come to you in Omaha and nearby cities, saving the tow and the wait.\n\nNext step — get help now:\nIf you need a working fob today, a mobile technician can come to your location, verify ownership, and program a new unit so you can get back on the road.\n\nPro tip:\nAsk for the newly programmed fob's details so you can order a spare later without guesswork."
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
    body:
      "Getting locked out happens to everyone.\n\nStay calm, confirm you have permission to access the property, and avoid risky entry attempts.\n\nCall a licensed local locksmith who can verify ownership and provide a damage free entry where possible.\n\nIn Omaha, mobile technicians can reach most neighborhoods quickly depending on traffic and current demand.",
  },
  {
    slug: "5-tips-to-keep-your-bellevue-home-secure",
    title: "Five Tips To Keep Your Bellevue Home Secure",
    category: "residential",
    city: "Bellevue",
    date: "2020-10-05T00:00:00Z",
    excerpt: "From door hardware to lighting and rekey schedules, here is how Bellevue families can boost everyday security.",
    coverImage: "/images/blog/house-lock.webp",
    body:
      "Security builds from basics first.\n\nUse quality deadbolts, strike plates with long screws, and keep door frames in good shape.\n\nRekey after moving or after key loss, and consider smart locks where appropriate.\n\nAsk a locksmith to evaluate weak points around sliding doors and garage entries.",
  },

  // Year 2, four years ago
  {
    slug: "why-papillion-drivers-need-a-spare-car-key",
    title: "Why Papillion Drivers Need A Spare Car Key",
    category: "keys",
    city: "Papillion",
    date: "2021-03-18T00:00:00Z",
    excerpt: "Spare keys save time and money. Learn when to duplicate and what to bring to a key appointment.",
    coverImage: "/images/blog/handing-new-key.webp",
    body:
      "Modern keys include chips and remotes.\n\nA spare reduces emergency costs and wait times.\n\nBring your vehicle identification number, proof of ownership, and current key if available.\n\nMobile service may be available depending on model and year.",
  },
  {
    slug: "common-lock-problems-la-vista-businesses-face",
    title: "Common Lock Problems La Vista Businesses Face",
    category: "commercial",
    city: "La Vista",
    date: "2021-11-10T00:00:00Z",
    excerpt: "Door closer issues, worn cylinders, and key control gaps can cost time and security for local shops.",
    coverImage: "/images/blog/office-rekey.webp",
    body:
      "Busy doors wear faster.\n\nPlan maintenance for door closers, panic hardware, and cylinders.\n\nAdopt master key systems to control access and simplify keyed entries.\n\nSchedule after hours service to reduce downtime.",
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
    body:
      "Create a key routine and a spare plan.\n\nStore a spare with a trusted person or in a secure lock box.\n\nConsider smart deadbolts for family access.\n\nIf you do get locked out, request your ETA during the call.\n\nArrival times vary based on demand, distance, and traffic.",
  },
  {
    slug: "rekey-vs-replace-omaha",
    title: "Rekey Versus Replace, Omaha Homeowner Guide",
    category: "residential",
    city: "Omaha",
    date: "2022-09-22T00:00:00Z",
    excerpt: "When is it smarter to rekey instead of replacing the whole lock. Cost, security, and timelines explained.",
    coverImage: "/images/blog/keys-desk.webp",
    body:
      "Rekey keeps your existing hardware and changes which keys operate it.\n\nReplace when hardware is damaged or outdated.\n\nAfter a move or lost keys, rekey is usually the quickest path to restore control.",
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
    body:
      "Programming depends on vehicle year and system.\n\nSome models require specialized equipment or PIN codes.\n\nMobile service coverage varies. Call to check current options for your vehicle.",
  },
  {
    slug: "master-key-systems-for-gretna-shops",
    title: "Master Key Systems For Gretna Shops",
    category: "commercial",
    city: "Gretna",
    date: "2023-08-30T00:00:00Z",
    excerpt: "Improve access control while keeping daily operations simple. A quick overview for small teams.",
    coverImage: "/images/blog/key-cutting.webp",
    body:
      "Master systems give managers higher level keys while employees carry limited access keys.\n\nThey reduce key duplication sprawl and improve accountability.\n\nWork with a locksmith to design a system that can grow with your business.",
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
    body:
      "Not every lock needs drilling.\n\nLicensed techs can often open doors without damage depending on the hardware.\n\nAsk questions, request your ETA during the call, and expect transparent pricing.",
  },
  {
    slug: "transparent-locksmith-pricing-omaha",
    title: "Transparent Locksmith Pricing In Omaha",
    category: "residential",
    city: "Omaha",
    date: "2025-03-20T00:00:00Z",
    excerpt: "What drives pricing, how quotes work, and why transparency matters for trust.",
    coverImage: "/images/blog/happy-customer.webp",
    body:
      "Quotes consider distance, time, hardware, and complexity.\n\nClear pricing prevents surprises and builds long term relationships.\n\nAlways request a written estimate before work begins.",
  },
  {
    slug: "mobile-locksmith-bellevue-time-saver",
    title: "Mobile Locksmith In Bellevue, A Real Time Saver",
    category: "emergency",
    city: "Bellevue",
    date: "2025-06-05T00:00:00Z",
    excerpt: "When mobile service makes sense and how to plan your appointment.",
    coverImage: "/images/blog/car-ignition.webp",
    body:
      "Mobile units bring tools to you which reduces towing and downtime.\n\nAvailability depends on current demand.\n\nShare your exact location and lock or vehicle details to speed things up.",
  },
  {
    slug: "serving-omaha-for-over-a-decade",
    title: "How Aksarben Locksmiths Has Served Omaha For Over A Decade",
    category: "commercial",
    city: "Omaha",
    date: "2025-08-28T00:00:00Z",
    excerpt: "A quick look at our mobile service history and commitment to local customers.",
    coverImage: "/images/blog/house-key-duplication.webp",
    body:
      "From emergency unlocks to planned rekeys, our focus is dependable help and clear communication.\n\nWe invest in training, modern key machines, and customer first service.\n\nThank you Omaha and the surrounding cities for your trust.",
  },
];

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}