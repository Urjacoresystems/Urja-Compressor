export function buildDownloadName(originalName: string, extension: "jpg" | "pdf") {
  const lastDot = originalName.lastIndexOf(".");
  const stem = lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const safeStem = stem.replace(/[\\/:*?"<>|]/g, "");
  return `${safeStem}-Urja-Compressor.${extension}`;
}
