import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "extension", "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const requiredIconSizes = ["16", "32", "48", "128"];
const errors = [];

if (manifest.manifest_version !== 3) {
  errors.push("manifest_version must be 3.");
}

if (!manifest.name) {
  errors.push("manifest.name is required.");
}

if (!manifest.version) {
  errors.push("manifest.version is required.");
}

if (!manifest.description || manifest.description.length > 132) {
  errors.push("manifest.description is required and must be 132 characters or less.");
}

for (const size of requiredIconSizes) {
  const iconPath = manifest.icons?.[size];

  if (!iconPath) {
    errors.push(`manifest.icons.${size} is required.`);
    continue;
  }

  try {
    await access(path.join(root, "extension", iconPath));
  } catch {
    errors.push(`Missing icon file: ${iconPath}`);
  }
}

for (const contentScript of manifest.content_scripts ?? []) {
  for (const script of contentScript.js ?? []) {
    try {
      await access(path.join(root, "extension", script));
    } catch {
      errors.push(`Missing content script: ${script}`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Extension manifest looks ready.");
