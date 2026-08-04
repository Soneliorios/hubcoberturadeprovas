/** Card de placeholder (nenhum dado real) exibido borrado sob overlays de CTA. */
export default function CardFantasma({ video }: { video: boolean }) {
  return (
    <div
      aria-hidden
      className="w-[248px] shrink-0 overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="grid aspect-video place-items-center bg-gradient-to-br from-navy/70 to-surface-2">
        <span className="text-3xl opacity-50">{video ? "🎥" : "📄"}</span>
      </div>
      <div className="space-y-2 p-3">
        <div className="h-4 w-16 rounded-full bg-surface-2" />
        <div className="h-3.5 w-4/5 rounded bg-surface-2" />
        <div className="h-3.5 w-3/5 rounded bg-surface-2" />
      </div>
    </div>
  );
}
