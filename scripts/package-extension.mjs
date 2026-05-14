import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "extension");
const outputDir = path.join(root, "dist");
const outputFile = path.join(outputDir, "instagram-native-video-controls.zip");

const crcTable = new Uint32Array(256);

for (let n = 0; n < 256; n += 1) {
  let c = n;

  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }

  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

async function collectFiles(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    const zipPath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, zipPath)));
    } else if (entry.isFile()) {
      files.push({ absolutePath, zipPath });
    }
  }

  return files.sort((a, b) => a.zipPath.localeCompare(b.zipPath));
}

function writeDosDateTime(date) {
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  return { dosDate, dosTime };
}

function localFileHeader(fileName, file) {
  const name = Buffer.from(fileName);
  const header = Buffer.alloc(30);

  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(file.dosTime, 10);
  header.writeUInt16LE(file.dosDate, 12);
  header.writeUInt32LE(file.crc, 14);
  header.writeUInt32LE(file.size, 18);
  header.writeUInt32LE(file.size, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);

  return Buffer.concat([header, name]);
}

function centralDirectoryHeader(fileName, file) {
  const name = Buffer.from(fileName);
  const header = Buffer.alloc(46);

  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(file.dosTime, 12);
  header.writeUInt16LE(file.dosDate, 14);
  header.writeUInt32LE(file.crc, 16);
  header.writeUInt32LE(file.size, 20);
  header.writeUInt32LE(file.size, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(file.offset, 42);

  return Buffer.concat([header, name]);
}

function endOfCentralDirectory(fileCount, centralDirectorySize, centralDirectoryOffset) {
  const header = Buffer.alloc(22);

  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(fileCount, 8);
  header.writeUInt16LE(fileCount, 10);
  header.writeUInt32LE(centralDirectorySize, 12);
  header.writeUInt32LE(centralDirectoryOffset, 16);
  header.writeUInt16LE(0, 20);

  return header;
}

await mkdir(outputDir, { recursive: true });

const files = [];
let offset = 0;
const chunks = [];

for (const file of await collectFiles(sourceDir)) {
  const content = await readFile(file.absolutePath);
  const fileStat = await stat(file.absolutePath);
  const { dosDate, dosTime } = writeDosDateTime(fileStat.mtime);
  const metadata = {
    crc: crc32(content),
    dosDate,
    dosTime,
    offset,
    size: content.length,
  };
  const header = localFileHeader(file.zipPath, metadata);

  chunks.push(header, content);
  offset += header.length + content.length;
  files.push({ ...file, ...metadata });
}

const centralDirectoryOffset = offset;
const centralDirectoryChunks = files.map((file) => centralDirectoryHeader(file.zipPath, file));
const centralDirectorySize = centralDirectoryChunks.reduce((total, chunk) => total + chunk.length, 0);
const endHeader = endOfCentralDirectory(files.length, centralDirectorySize, centralDirectoryOffset);

await writeFile(outputFile, Buffer.concat([...chunks, ...centralDirectoryChunks, endHeader]));
console.log(`Created ${path.relative(root, outputFile)}`);
