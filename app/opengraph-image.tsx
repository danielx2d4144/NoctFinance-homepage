import { ImageResponse } from "next/og";

// Next serves this at /opengraph-image and wires the <meta> tags automatically.
// Satori (the renderer) supports a subset of CSS: any element with more than
// one child needs an explicit display:flex, and there is no cascade.
export const alt =
  "NoctFinance — lend and borrow on-chain, without broadcasting your balance sheet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          backgroundImage:
            "radial-gradient(1000px 500px at 15% -10%, rgba(34,211,238,0.16), transparent 70%)",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: "linear-gradient(135deg, #22d3ee, #a3e635)",
            }}
          />
          <div style={{ fontSize: 34, color: "#fafafa", letterSpacing: -0.5 }}>
            NoctFinance
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              fontSize: 26,
              color: "#22d3ee",
              letterSpacing: 3,
            }}
          >
            // PRIVACY-PRESERVING MONEY MARKET
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 66,
              lineHeight: 1.12,
              color: "#fafafa",
              letterSpacing: -2,
            }}
          >
            <div>Lend and borrow on-chain —</div>
            <div style={{ color: "#a3e635" }}>without broadcasting</div>
            <div>your balance sheet.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 24,
            color: "rgba(250,250,250,0.55)",
          }}
        >
          <div>shielded positions</div>
          <div style={{ color: "rgba(250,250,250,0.25)" }}>·</div>
          <div>zk-verified solvency</div>
          <div style={{ color: "rgba(250,250,250,0.25)" }}>·</div>
          <div>in-browser proving</div>
        </div>
      </div>
    ),
    size,
  );
}
