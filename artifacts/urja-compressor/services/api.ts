/**
 * API layer for the future Spring Boot backend. Not called yet: all processing is client-side.
 * Flip USE_BACKEND when the REST API is live.
 * Expected endpoints: POST /auth/login, GET/POST /templates, GET /presets
 */
import { PHOTO_SPECS, SIGNATURE_SPECS, type Spec } from "@/lib/presets";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
const USE_BACKEND = false;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("urja_token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }), ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type SavedTemplate = { id?: string; name: string; width: number; height: number; maxKB: number };
export type Presets = { photos: Spec[]; signatures: Spec[] };

export const api = {
  getPresets: async (): Promise<Presets> =>
    (USE_BACKEND ? http("/presets") : { photos: PHOTO_SPECS, signatures: SIGNATURE_SPECS }),
  login: (email: string, password: string) =>
    http<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  listTemplates: async (): Promise<SavedTemplate[]> => (USE_BACKEND ? http("/templates") : []),
  saveTemplate: (t: SavedTemplate) => http<SavedTemplate>("/templates", { method: "POST", body: JSON.stringify(t) }),
};
