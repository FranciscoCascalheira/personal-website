import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = "Francisco Cascalheira — Software Developer";

// The PUBLIC RECORD identity, in link-preview form: warm ivory paper, ruled
// hairlines, the claim in Instrument Serif, mono marginalia, an amber stamp.
const PAPER = "#f7f3ea";
const INK = "#191510";
const INK_MUTED = "#504a3d";
const FAINT = "#6d6452";
const RULE = "rgba(58, 45, 24, 0.16)";
const RULE_STRONG = "rgba(58, 45, 24, 0.32)";
const AMBER = "#a06a10";
const AMBER_FIELD = "#e3a83c";

/** Fetch Instrument Serif as a TTF Satori can rasterise. Falls back to the
 *  default face if the network is unavailable — the image still renders. */
async function loadSerif(text: string) {
  try {
    const api = `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&text=${encodeURIComponent(
      text
    )}`;
    const css = await (
      await fetch(api, {
        headers: {
          // an old UA makes Google serve TTF instead of woff2 (unsupported)
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko)",
        },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!url?.[1]) return null;
    return await (await fetch(url[1])).arrayBuffer();
  } catch {
    return null;
  }
}

export async function renderOgImage() {
  const claim = "The City of Porto runs its youth-internship programme";
  const rupture = "on software I built alone.";
  const serif = await loadSerif(`${claim} ${rupture}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: PAPER,
          color: INK,
        }}
      >
        {/* running header — mono marginalia + square accent */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${RULE}`,
            paddingBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: FAINT,
            }}
          >
            {"/// FC-Dossier · Software developer · Porto · PT"}
          </div>
          <div style={{ width: 18, height: 18, backgroundColor: AMBER_FIELD }} />
        </div>

        {/* the claim, in the serif voice with the amber rupture */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: serif ? "Instrument Serif" : "serif",
              fontSize: 68,
              lineHeight: 1.02,
              letterSpacing: -1,
            }}
          >
            <span style={{ color: INK }}>{claim} </span>
            <span style={{ color: AMBER, marginLeft: 14 }}>{rupture}</span>
          </div>
        </div>

        {/* colophon — ruled, with the live stamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${RULE_STRONG}`,
            paddingTop: 26,
            fontSize: 22,
            color: INK_MUTED,
          }}
        >
          <div style={{ color: INK, fontSize: 24 }}>
            franciscocascalheira.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: `1.5px solid ${AMBER}`,
              color: AMBER,
              padding: "8px 14px",
              fontSize: 18,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: "#1f7d46",
              }}
            />
            In production · City of Porto
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: serif
        ? [{ name: "Instrument Serif", data: serif, style: "normal" as const }]
        : undefined,
    }
  );
}
