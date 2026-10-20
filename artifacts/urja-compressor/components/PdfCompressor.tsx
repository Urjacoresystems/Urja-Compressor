"use client";
import { useState } from "react";
import { compressPdf } from "@/lib/pdfUtils";
import { kb } from "@/lib/imageUtils";
import { buildDownloadName } from "@/lib/fileNames";

const LIMITS = [
  { label: "Under 100 KB", bytes: 100 * 1024 },
  { label: "Under 200 KB", bytes: 200 * 1024 },
  { label: "Under 500 KB", bytes: 500 * 1024 },
  { label: "Under 1 MB", bytes: 1024 * 1024 },
  { label: "Under 2 MB", bytes: 2 * 1024 * 1024 },
  { label: "Under 5 MB", bytes: 5 * 1024 * 1024 },
];

export default function PdfCompressor() {
  const [maxBytes, setMaxBytes] = useState(1024 * 1024);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [out, setOut] = useState<{ url: string; size: number; ok: boolean } | null>(null);
  const [error, setError] = useState("");
  const selectedLimit = LIMITS.find((limit) => limit.bytes === maxBytes) ?? LIMITS[3];

  async function run() {
    if (!file) return;
    setError(""); setOut(null); setProgress(0);
    try {
      const { blob, reachedTarget } = await compressPdf(file, maxBytes, setProgress);
      setOut({ url: URL.createObjectURL(blob), size: blob.size, ok: reachedTarget });
    } catch { setError("This PDF could not be read. It may be password-protected or damaged."); }
    setProgress(null);
  }

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <label className="mb-1 block text-sm text-slate2" htmlFor="pdf-limit">Maximum size</label>
        <select id="pdf-limit" className="field" value={maxBytes} onChange={(e) => setMaxBytes(Number(e.target.value))}>
          {LIMITS.map((limit) => <option key={limit.bytes} value={limit.bytes}>{limit.label}</option>)}
        </select>
      </div>
      <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate2/40 bg-paper text-center transition hover:border-moss">
        <span className="font-serif text-xl text-moss">{file ? file.name : "Choose a PDF"}</span>
        <span className="mt-1 text-sm text-slate2">{file ? kb(file.size) : "Pages are processed in your browser."}</span>
        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setOut(null); }} />
      </label>
      <div className="flex items-center gap-4">
        <button className="btn" disabled={!file || progress !== null} onClick={run}>{progress !== null ? `Compressing ${Math.round(progress * 100)}%` : "Compress PDF"}</button>
        {out && file && <a className="btn-quiet" href={out.url} download={buildDownloadName(file.name, "pdf")}>Download ({kb(out.size)})</a>}
      </div>
      {out && !out.ok && <p className="text-sm text-[#8a4b1f]">Reached {kb(out.size)}, still above {selectedLimit.label.replace(/^Under /, "")}. Split the document or remove pages and try again.</p>}
      {error && <p role="alert" className="text-sm text-[#8a4b1f]">{error}</p>}
      <p className="max-w-prose text-sm text-slate2">Pages are re-saved as images to shrink the file, so text in the result can’t be selected. Fine for portal uploads, not for archiving.</p>
    </div>
  );
}
