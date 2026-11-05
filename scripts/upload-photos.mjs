// npm run photos       -> uploads/updates photos and trucks (never deletes)
// npm run photos:sync  -> same, then also REMOVES trucks and photos that are no longer in ./photos
//
//   photos/2024/blue-01/1.jpg, 2.jpg ...  -> one truck with several photos (folder name = truck name)
//   photos/2024/truck-a.jpg                -> one truck with one photo
// Your edits to color, miles, VIN, status etc. in Supabase are never overwritten.
import { createClient } from "@supabase/supabase-js";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const PRUNE = process.argv.includes("--prune");

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
    cacheControl: "3600",
  });
  if (error) throw new Error(`${file}: ${error.message}`);
  const base = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  // The ?v= stamp changes whenever the file changes, so browsers never show an old copy
  return { objectPath, url: `${base}?v=${Math.floor(statSync(file).mtimeMs)}` };
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
  console.error("No photos found in photos/<year>/. Nothing was changed.");
  process.exit(1);
}

// 1. Upload everything that is in the folders
const keep = new Map(); // truck slug -> Set of storage paths that should exist
for (const job of jobs) {
  const images = [];
  const paths = new Set();
  for (const file of job.files) {
    const r = await upload(job.slug, file);
    images.push(r.url);
    paths.add(r.objectPath);
  }
  const { error } = await supabase.from("trucks").upsert({ slug: job.slug, year: job.year, images }, { onConflict: "slug" });
  if (error) throw new Error(`${job.slug}: ${error.message}`);
  keep.set(job.slug, paths);
  console.log(`${job.slug}: ${images.length} photo(s)`);
}

// 2. Optional: remove whatever is no longer in the folders
if (PRUNE) {
  const protectedSlugs = new Set();

  const { data: rows, error: rowsError } = await supabase.from("trucks").select("id, slug");
  if (rowsError) throw new Error(rowsError.message);

  for (const row of rows ?? []) {
    if (keep.has(row.slug)) continue;
    const { count } = await supabase.from("reservations").select("id", { count: "exact", head: true }).eq("truck_id", row.id);
    if (count) {
      protectedSlugs.add(row.slug);
      console.warn(`Kept ${row.slug}: it has reservations, so it was not deleted.`);
      continue;
    }
    const { error } = await supabase.from("trucks").delete().eq("id", row.id);
    if (error) throw new Error(`${row.slug}: ${error.message}`);
    console.log(`Removed truck ${row.slug}`);
  }

  const { data: folders } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
  for (const folder of folders ?? []) {
    if (folder.id !== null) continue; // only look inside folders
    if (protectedSlugs.has(folder.name)) continue;
    const { data: files } = await supabase.storage.from(BUCKET).list(folder.name, { limit: 1000 });
    const wanted = keep.get(folder.name);
    const stale = (files ?? [])
      .map((f) => `${folder.name}/${f.name}`)
      .filter((path) => !wanted || !wanted.has(path));
    if (stale.length) {
      const { error } = await supabase.storage.from(BUCKET).remove(stale);
      if (error) throw new Error(error.message);
      console.log(`Deleted ${stale.length} old file(s) from ${folder.name}`);
    }
  }
}

console.log(`Done. ${jobs.length} truck(s).${PRUNE ? "" : " (Use npm run photos:sync to also remove deleted trucks and photos.)"}`);