type Slot = "header" | "footer";
const LABEL: Record<Slot, string> = { header: "Header", footer: "Footer" };
const SIZE: Record<Slot, string> = {
  header: "h-[320px] w-full max-w-[300px]",
  footer: "h-20 w-full",
};

/** Looks like a quiet margin note until AdSense is approved. Swap the inner div for <ins class="adsbygoogle">. */
export default function AdUnit({ slot }: { slot: Slot }) {
  return (
    <aside aria-label={`${LABEL[slot]} advertisement`} className={`${SIZE[slot]} relative flex items-center justify-center rounded-md border border-dashed border-beige bg-paper/60`}>
      <span className={slot === "header"
        ? "absolute right-3 top-2 font-sans text-xs font-semibold text-slate2"
        : "font-serif text-sm italic text-slate2/60"}>
        Sponsored · {LABEL[slot]}
      </span>
    </aside>
  );
}
