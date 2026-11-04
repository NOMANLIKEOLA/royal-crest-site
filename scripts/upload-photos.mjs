// Run with: npm run photos
// Reads ./photos/<year>/ and uploads to the "truck-photos" bucket, then creates/updates rows in "trucks".
//   photos/2024/blue-01/1.jpg, 2.jpg ...  -> one truck with several photos (folder name = truck name)
//   photos/2024/truck-a.jpg                -> one truck with one photo
// Re-running is safe: it never overwrites mileage, VIN, color or status you edited in Supabase.
import { createClient } from "@supabase/supabase-js";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const BUCKET = "truck-photos";
const ROOT = "photos";
const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isImage = (f) => extname(f).toLowerCase() in TYPES;

async function upload(truckSlug, file) {
  const ext = extname(file).toLowerCase();
  const objectPath = `${truckSlug}/${slug(basename(file, extname(file)))}${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, readFileSync(file), {
    contentType: TYPES[ext],
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`${file}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

if (!existsSync(ROOT)) {
  console.error(`Folder "${ROOT}" not found. Create it in the project root with one folder per year inside.`);
  process.exit(1);
}

const jobs = [];
for (const year of readdirSync(ROOT).filter((d) => /^\d{4}$/.test(d)).sort()) {
  const dir = join(ROOT, year);
  for (const entry of readdirSync(dir).sort(natural)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      const files = readdirSync(path).filter(isImage).sort(natural).map((f) => join(path, f));
      if (files.length) jobs.push({ year: Number(year), slug: `${year}-${slug(entry)}`, files });
    } else if (isImage(entry)) {
      jobs.push({ year: Number(year), slug: `${year}-${slug(basename(entry, extname(entry)))}`, files: [path] });
    }
  }
}

if (jobs.length === 0) {
  console.error("No photos found in photos/<year>/");
  process.exit(1);
}

for (const job of jobs) {
  const images = [];
  for (const file of job.files) images.push(await upload(job.slug, file));
  const { error } = await supabase.from("trucks").upsert({ slug: job.slug, year: job.year, images }, { onConflict: "slug" });
  if (error) throw new Error(`${job.slug}: ${error.message}`);
  console.log(`${job.slug}: ${images.length} photo(s)`);
}
console.log(`Done. ${jobs.length} truck(s). Edit mileage, VIN and color in the Supabase Table Editor.`);