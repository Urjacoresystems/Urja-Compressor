"use client";
import { useState } from "react";
import ImageCompressor from "@/components/ImageCompressor";
import PdfCompressor from "@/components/PdfCompressor";
import AdUnit from "@/components/AdUnit";

export default function Home() {
  const [tab, setTab] = useState<"image" | "pdf">("image");
  return (
    <>
      <header className="mx-auto max-w-5xl px-5 pb-6 pt-10">
        <div className="flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
            <circle cx="17" cy="17" r="6" fill="#244232" />
            <path d="M17 3v5M17 26v5M3 17h5M26 17h5M7 7l3.5 3.5M23.5 23.5L27 27M27 7l-3.5 3.5M10.5 23.5L7 27" stroke="#244232" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <h1 className="font-deva text-4xl text-moss">ऊर्जा <span className="font-serif text-3xl font-normal italic text-slate2">compressor</span></h1>
        </div>
        <p className="mt-4 max-w-xl font-serif text-xl leading-relaxed text-slate2">
          Get your photo, signature and documents down to the size required. Nothing is uploaded; it all happens in your browser.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-lg border border-beige bg-cream p-6 shadow-soft sm:p-8">
              <div className="mb-8 flex gap-6 border-b border-beige">
                {(["image", "pdf"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} aria-current={tab === t}
                    className={`-mb-px border-b-2 pb-3 font-serif text-lg transition ${tab === t ? "border-moss text-moss" : "border-transparent text-slate2 hover:text-moss"}`}>
                    {t === "image" ? "Photo & signature" : "PDF"}
                  </button>
                ))}
              </div>
              {tab === "image" ? <ImageCompressor /> : <PdfCompressor />}
            </section>

            <aside className="font-serif text-slate2">
              <p className="text-lg text-moss">Before you upload</p>
              <p className="mt-2 text-[15px] leading-relaxed">Requirements can vary. Confirm the dimensions and file size before uploading.</p>
            </aside>
          </div>

          <aside className="mx-auto w-full max-w-[300px]">
            {/* AdSense Header */}
            <AdUnit slot="header" />
          </aside>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10">
        {/* AdSense Footer */}
        <AdUnit slot="footer" />
        <p className="mt-6 text-sm text-slate2">ऊर्जा compressor · Free to use, no sign-up. Files never leave your device.</p>
      </footer>
    </>
  );
}
