import { ImageResponse } from "next/og";

export function renderBrandIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#ededed",
          fontSize: size * 0.42,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        CC
      </div>
    ),
    { width: size, height: size }
  );
}
