import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#18181B",
          color: "#FFFFFF",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        Н
      </div>
    ),
    size,
  );
}
