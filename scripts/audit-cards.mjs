import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cardsPath = path.join(root, "data", "cards.json");
const publicDir = path.join(root, "public");
const reportPath = path.join(root, "CARD_AUDIT.md");
const placeholderPath = "/images/cards/placeholder.webp";

const cards = JSON.parse(fs.readFileSync(cardsPath, "utf8"));

function publicPath(assetPath) {
  if (!assetPath || !assetPath.startsWith("/")) return null;
  return path.join(publicDir, ...assetPath.split("/").filter(Boolean));
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpgDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function webpDimensions(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X" && buffer.length >= 30) {
    return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  }
  if (chunk === "VP8 " && buffer.length >= 30) {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L" && buffer.length >= 25) {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }
  return null;
}

function imageInfo(assetPath) {
  const filePath = publicPath(assetPath);
  if (!filePath || !fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  const dimensions = pngDimensions(buffer) ?? jpgDimensions(buffer) ?? webpDimensions(buffer);
  return {
    filePath,
    size: buffer.length,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  };
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const issues = {
  placeholder: [],
  missingImage: [],
  missingFile: [],
  mediumResolution: [],
  lowResolution: [],
  missingSource: [],
  missingRules: [],
  duplicateNames: [],
};

const byName = new Map();

for (const card of cards) {
  const nameKey = `${card.name}|${card.category}|${card.expansion}`;
  byName.set(nameKey, [...(byName.get(nameKey) ?? []), card]);

  if (!hasText(card.image)) {
    issues.missingImage.push(card);
  } else {
    if (card.image === placeholderPath) issues.placeholder.push(card);

    const info = imageInfo(card.image);
    if (!info) {
      issues.missingFile.push(card);
    } else if (card.image !== placeholderPath) {
      if ((info.width !== null && info.width < 180) || (info.height !== null && info.height < 250) || info.size < 50_000) {
        issues.lowResolution.push({ ...card, imageInfo: info });
      } else if ((info.width !== null && info.width < 360) || (info.height !== null && info.height < 500)) {
        issues.mediumResolution.push({ ...card, imageInfo: info });
      }
    }
  }

  if (!hasText(card.sourceUrl)) issues.missingSource.push(card);
  if (!hasText(card.effect) || !hasText(card.timing) || !hasText(card.target)) issues.missingRules.push(card);
}

for (const group of byName.values()) {
  if (group.length > 1) issues.duplicateNames.push(group);
}

function cardLabel(card) {
  return `\`${card.id}\` - ${card.name} / ${card.expansion}`;
}

function renderList(cardsOrRows, render = cardLabel, limit = 80) {
  if (!cardsOrRows.length) return "- None\n";
  const rows = cardsOrRows.slice(0, limit).map((item) => `- ${render(item)}`);
  if (cardsOrRows.length > limit) rows.push(`- ...and ${cardsOrRows.length - limit} more`);
  return `${rows.join("\n")}\n`;
}

const imageCount = cards.filter((card) => hasText(card.image) && card.image !== placeholderPath).length;
const report = `# Card Database Audit

Generated: ${new Date().toISOString()}

## Summary

- Total cards: ${cards.length}
- Cards with non-placeholder image: ${imageCount}
- Placeholder images: ${issues.placeholder.length}
- Missing image value: ${issues.missingImage.length}
- Missing image files: ${issues.missingFile.length}
- Usable medium images: ${issues.mediumResolution.length}
- Tiny / low-quality images: ${issues.lowResolution.length}
- Missing sourceUrl: ${issues.missingSource.length}
- Missing timing / target / effect: ${issues.missingRules.length}
- Duplicate name/category/expansion groups: ${issues.duplicateNames.length}

## Placeholder Images

${renderList(issues.placeholder)}

## Missing Image Values

${renderList(issues.missingImage)}

## Missing Image Files

${renderList(issues.missingFile, (card) => `${cardLabel(card)} -> ${card.image}`)}

## Usable Medium Images

${renderList(
  issues.mediumResolution,
  (card) =>
    `${cardLabel(card)} -> ${card.image} (${card.imageInfo.width ?? "?"}x${card.imageInfo.height ?? "?"}, ${Math.round(
      card.imageInfo.size / 1024
    )} KB)`
)}

## Tiny / Low-Quality Images

${renderList(
  issues.lowResolution,
  (card) =>
    `${cardLabel(card)} -> ${card.image} (${card.imageInfo.width ?? "?"}x${card.imageInfo.height ?? "?"}, ${Math.round(
      card.imageInfo.size / 1024
    )} KB)`
)}

## Missing Rule Fields

${renderList(issues.missingRules)}

## Missing Sources

${renderList(issues.missingSource)}

## Duplicate Name / Category / Expansion Groups

${
  issues.duplicateNames.length
    ? `${issues.duplicateNames
        .map((group) => `- ${group[0].name} / ${group[0].category} / ${group[0].expansion}: ${group.map((card) => `\`${card.id}\``).join(", ")}`)
        .join("\n")}\n`
    : "- None\n"
}
`;

fs.writeFileSync(reportPath, report, "utf8");
console.log(`Wrote ${path.relative(root, reportPath)}`);
console.log(`Cards: ${cards.length}, placeholders: ${issues.placeholder.length}, low-res: ${issues.lowResolution.length}`);
