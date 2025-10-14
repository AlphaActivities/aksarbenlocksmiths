// Verify required media exists and is not a tiny placeholder.
import fs from "node:fs";
import path from "node:path";

// Dev bypass: skip strict media validation outside production or when explicitly requested
const isProd = process.env.NODE_ENV === 'production';
const skip = process.env.SKIP_MEDIA_CHECK === '1';
if (!isProd || skip) {
  console.log('[verify-media] Skipped (NODE_ENV!=' + (isProd ? 'production' : 'production') + ' or SKIP_MEDIA_CHECK=1)');
  process.exit(0);
}

const KB = 1024;
const MIN_VIDEO_BYTES = 1 * KB;   // you can raise this later
const MIN_THUMB_BYTES = 1 * KB;   // you can raise this later

const required = [
  // Videos
  { type: "video", rel: "/public/videos/ResidentialLockoutVideo.mp4",      min: MIN_VIDEO_BYTES },
  { type: "video", rel: "/public/videos/AutomotiveLockoutsVideo.mp4",       min: MIN_VIDEO_BYTES },
  { type: "video", rel: "/public/videos/KeyExtractionVideo.mp4",            min: MIN_VIDEO_BYTES },
  { type: "video", rel: "/public/videos/DuplicationVideo.mp4",              min: MIN_VIDEO_BYTES },
  { type: "video", rel: "/public/videos/LockReKeying.mp4",                  min: MIN_VIDEO_BYTES },
  { type: "video", rel: "/public/videos/SecurityConsultation.mp4",          min: MIN_VIDEO_BYTES },

  // Thumbnails
  { type: "thumb", rel: "/public/images/services-thumbnails/Residential-Service-Photo.webp", min: MIN_THUMB_BYTES },
  { type: "thumb", rel: "/public/images/services-thumbnails/Automotive-Lockout.webp",        min: MIN_THUMB_BYTES },
  { type: "thumb", rel: "/public/images/services-thumbnails/Broken-Key-Extraction.webp",     min: MIN_THUMB_BYTES },
  { type: "thumb", rel: "/public/images/services-thumbnails/Key-Duplication.webp",           min: MIN_THUMB_BYTES },
  { type: "thumb", rel: "/public/images/services-thumbnails/Lock-ReKeying.webp",             min: MIN_THUMB_BYTES },
  { type: "thumb", rel: "/public/images/services-thumbnails/Security-Consultation.webp",     min: MIN_THUMB_BYTES },
];

function statOrNull(absPath) {
  try { return fs.statSync(absPath); } catch { return null; }
}

const root = process.cwd();
let failed = false;
const rows = [];

for (const item of required) {
  const abs = path.resolve(root, item.rel.replace(/^\//, ""));
  const s = statOrNull(abs);
  if (!s) {
    failed = true;
    rows.push([item.type, item.rel, "MISSING", `min ${item.min}`, "❌"]);
  } else {
    const ok = s.size >= item.min;
    if (!ok) failed = true;
    rows.push([item.type, item.rel, String(s.size), `min ${item.min}`, ok ? "✅" : "❌"]);
  }
}

// pretty print
const pad = (str, n) => String(str).padEnd(n);
const widths = [8, 90, 12, 12, 3];
const header = ["type", "path", "bytes", "min", "ok"];
const table =
  header.map((h,i)=>pad(h,widths[i])).join(" ") + "\n" +
  rows.map(r=>r.map((c,i)=>pad(c,widths[i])).join(" ")).join("\n");

console.log(table);

if (failed) {
  console.error("\n🚨 Media check failed. Re-upload real files in /public before building.");
  process.exit(1);
} else {
  console.log("\n✅ Media check passed. All required files exist and meet minimum size.");
}
