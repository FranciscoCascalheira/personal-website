/** A single slow radial glow — the one ambient light element in the design.
 *  Purely decorative; hidden from assistive tech and disabled under
 *  reduced-motion via CSS. Positioned by the caller. */
export function AmbientGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -z-10 ${className}`}
      style={{
        background:
          "radial-gradient(closest-side, var(--glow), transparent 72%)",
      }}
    />
  );
}
