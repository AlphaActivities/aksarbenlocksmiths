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
    body: "Getting locked out or losing your only car key can quickly turn into a major problem. For Papillion drivers, having a spare car key on hand means faster solutions, lower costs, and less stress. A spare key helps you avoid emergency lockouts, expensive dealership replacements, and wasted time waiting for help. Whether it's for your daily commute, family vehicle, or backup security, a spare key is one of the smartest ways Papillion drivers can stay prepared.\n\nAvoiding Emergency Lockouts\nWith a spare, you can skip the emergency call, tow, or overnight wait. Keep one at home or with a trusted family member for peace of mind.\n\nSaving Money Long Term\nProgramming or replacing one lost fob is often more expensive than cutting and coding a second spare while you still have a working key.\n\nConvenience for Families\nMultiple drivers for the same car? Spares prevent schedule conflicts and make sharing easier without constantly trading keys.\n\nFaster Service When Trouble Strikes\nLocksmiths in Omaha can program new spares much quicker if at least one working key is available. Without it, the process may require dealer codes or longer wait times.\n\nTips for Storing Your Spare Safely\nNever hide your spare inside the vehicle. Instead, keep it in a safe place at home, give one to a spouse, or use a coded lockbox for quick retrieval.\n\nFAQ Block:\nDo I need proof of ownership for a spare key? Yes, locksmiths and dealers require ID and registration or title.\nCan aftermarket keys work? Many do, but compatibility depends on your make and model. Ask before ordering.\nShould I program more than one spare? If you can, yes, it's cheaper to do multiple at once.\nHow long does it take? With the right equipment and a working key, typically within 15–30 minutes.\nDo locksmiths erase old fobs? Only if requested for security reasons, such as after a theft.\n\nClosing CTA:\nDon't wait until you're stranded. Call Aksarben Locksmiths today to cut and program your spare key, so you're always prepared.",
    keywords: ["Papillion spare car key", "Papillion locksmith", "car key replacement Papillion", "emergency locksmith Papillion", "Aksarben Locksmiths"]
  },

  // Year 1, five years ago
  {
    slug: "what-to-do-if-youre-locked-out-in-omaha",
    title: "What To Do If You Are Locked Out In Omaha",
    category: "emergency",
    city: "Omaha",
    date: "2020-02-15T00:00:00Z",
    excerpt: "Locked out of your car or home in Omaha? Learn step-by-step what to do, who to call, and how Aksarben Locksmiths provides fast, affordable emergency lockout service.",
    coverImage: "/images/blog/car-lockout.webp",
    altText: "Omaha locksmith helping driver during emergency car lockout",
    body: "Getting locked out in Omaha can happen to anyone, whether it's your car, your home, or your business. Knowing what to do immediately can save you time, money, and stress.\n\nStay Calm and Assess the Situation\nPanic is natural, but staying calm helps you think clearly. Double-check all doors and windows before assuming you're fully locked out. For vehicles, check every door including the trunk.\n\nKnow Your Options in Omaha\nCar lockouts: Professional locksmiths can unlock your car without damaging the vehicle.\nHome lockouts: Locksmiths use tools to gain entry without breaking locks or frames.\nBusiness lockouts: Commercial locks often require specialized picks and decoding tools.\n\nAvoid Costly Mistakes\nAvoid breaking windows or forcing doors, these repairs cost far more than a locksmith call. Calling Aksarben Locksmiths ensures fast, affordable help across Omaha.\n\nHow Emergency Locksmiths Work in Omaha\nA licensed locksmith can usually arrive within 20–30 minutes. Using professional-grade tools, they can unlock most vehicles and residential locks within minutes, without damage.\n\nPrevent Future Lockouts\nMake a spare key today.\nStore a backup with a trusted friend or family member.\nAsk about keyless entry or smart lock upgrades for long-term solutions.\n\nFAQ: Emergency Lockouts in Omaha\nHow fast can a locksmith get here? Typically within 15–30 minutes in the Omaha metro.\nWill my car or door be damaged? No. Aksarben Locksmiths use non-destructive tools.\nCan locksmiths help at night? Yes. 24/7 emergency service is available.\nHow much does it cost? Pricing depends on lock type and time, but emergency lockout service is far cheaper than repairing broken windows or doors.\n\nCall Aksarben Locksmiths Now\nDon't waste time stranded outside. Aksarben Locksmiths has served Omaha drivers, residents, and businesses for over a decade. Call now for 24/7 emergency lockout service and get back inside safely and quickly.",
    keywords: ["Omaha lockout service", "emergency locksmith Omaha", "car lockout Omaha", "home lockout Omaha", "Aksarben Locksmiths"]
  },
  {
    slug: "5-tips-to-keep-your-bellevue-home-secure",
    title: "Five Tips To Keep Your Bellevue Home Secure",
    category: "residential",
    city: "Bellevue",
    date: "2020-10-05T00:00:00Z",
    excerpt: "Discover five proven ways Bellevue homeowners can keep their homes secure. From reinforced doors and strike plates to smart locks and rekeying, Aksarben Locksmiths shares expert strategies to prevent break-ins and keep your family safe.",
    coverImage: "/images/blog/house-lock.webp",
    altText: "Bellevue locksmith reinforcing front door for better home security",
    body: "Security builds from basics first. Use quality deadbolts, strike plates with long screws, and keep door frames in good shape. Rekey after moving or after key loss, and consider smart locks where appropriate.\n\nHome security audits help you evaluate weak points around sliding doors and garage entries. Check lighting, trim shrubs, and make sure windows lock securely. If you ever lose a key, rekeying is the fastest way to restore control at a lower cost than replacing every lock.\n\nCost-Saving Security Improvements\nYou don't need to spend thousands to improve your Bellevue home's security. Simple upgrades like longer screws in strike plates cost under $10 but significantly increase door strength. Rekeying existing locks costs much less than replacement and provides the same security benefit. Door reinforcement kits, hinge-side reinforcement, and high-strength strike plates improve forced-entry resistance while keeping costs low.\n\nPractical Everyday Habits\nLock doors and windows even during quick errands. Do not hide spare keys outside, give one to a trusted person or use a lockbox. Keep garage remotes out of sight and disable old codes when remotes are lost.\n\nWhen to Call a Locksmith\nIf a key is lost or a lock is sticking, call before it fails completely. A professional can rekey, repair, or replace hardware and advise on smart lock options that fit your budget and door type.\n\nNext Steps\nIf you want fast, friendly help in Bellevue, Aksarben Locksmiths offers clear pricing and mobile service. We can rekey, repair hardware, or recommend targeted upgrades to strengthen the points that matter most.",
    keywords: ["Bellevue home security", "Bellevue locksmith", "home security tips Bellevue", "residential locksmith Bellevue", "Aksarben Locksmiths"]
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
    body: "Busy doors wear faster.\n\nPlan maintenance for door closers, panic hardware, and cylinders.\n\nAdopt master key systems to control access and simplify keyed entries.\n\nSchedule after hours service to reduce downtime.",
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
    body: "Create a key routine and a spare plan.\n\nStore a spare with a trusted person or in a secure lock box.\n\nConsider smart deadbolts for family access.\n\nIf you do get locked out, request your ETA during the call.\n\nArrival times vary based on demand, distance, and traffic.",
    keywords: ["Council Bluffs emergency locksmith", "late night lockout Council Bluffs", "24 hour locksmith Council Bluffs", "lockout prevention Council Bluffs", "Aksarben Locksmiths"]
  },
  {
    slug: "rekey-vs-replace-omaha",
    title: "Rekey Versus Replace, Omaha Homeowner Guide",
    category: "residential",
    city: "Omaha",
    date: "2022-09-22T00:00:00Z",
    excerpt: "When