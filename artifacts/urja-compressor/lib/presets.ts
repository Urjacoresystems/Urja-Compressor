export type Spec = { w: number; h: number; minKB: number; maxKB: number };

export const PHOTO_SPECS: Spec[] = [
  { w: 100, h: 120, minKB: 20, maxKB: 50 },
  { w: 200, h: 230, minKB: 20, maxKB: 50 },
  { w: 350, h: 350, minKB: 20, maxKB: 300 },
  { w: 413, h: 531, minKB: 20, maxKB: 50 },
];

export const SIGNATURE_SPECS: Spec[] = [
  { w: 140, h: 60, minKB: 10, maxKB: 20 },
  { w: 350, h: 150, minKB: 20, maxKB: 300 },
  { w: 413, h: 177, minKB: 10, maxKB: 20 },
];

export const specKey = (spec: Spec) => `${spec.w}x${spec.h}`;

export const formatSpecLabel = (spec: Spec) =>
  `${spec.w} × ${spec.h} px · ${spec.minKB}–${spec.maxKB} KB`;
