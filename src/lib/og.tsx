import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = "Francisco Cascalheira — Software Developer";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#0a0b0d",
          color: "#f5f5f6",
          backgroundImage:
            "radial-gradient(1000px 500px at 85% -10%, rgba(224,167,62,0.20), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#6e6f76",
            }}
          >
            {"/// Software developer · Porto · PT"}
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#e0a73e" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>
            Francisco Cascalheira
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 40, color: "#a1a1a6" }}>
            I build software that
            <span style={{ color: "#e0a73e", marginLeft: 12 }}>actually ships.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
            fontSize: 24,
            color: "#a1a1a6",
          }}
        >
          <div style={{ color: "#f5f5f6" }}>franciscocascalheira.com</div>
          <div>In production · City of Porto</div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
