"use client";
import { useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "@/lib/imageUtils";

type Props = { src: string; aspect: number | undefined; onCancel: () => void; onDone: (area: Area) => void };

export default function CropModal({ src, aspect, onCancel, onDone }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  return (
    <div role="dialog" aria-modal="true" aria-label="Crop image" className="fixed inset-0 z-50 flex items-center justify-center bg-moss/60 p-4">
      <div className="w-full max-w-xl rounded-lg bg-cream p-5 shadow-soft">
        <div className="relative h-[55vh] overflow-hidden rounded-md bg-slate2/20">
          <Cropper image={src} crop={crop} zoom={zoom} aspect={aspect ?? 4 / 3}
            onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, px) => setArea(px)} />
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm text-slate2">
          Zoom
          <input type="range" min={1} max={4} step={0.05} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="flex-1 accent-moss" />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-quiet" onClick={onCancel}>Cancel</button>
          <button className="btn" disabled={!area} onClick={() => area && onDone(area)}>Use this crop</button>
        </div>
      </div>
    </div>
  );
}
