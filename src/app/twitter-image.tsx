import { renderOgImage, ogSize, ogContentType, ogAlt } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = ogAlt;

export default async function Image() {
  return renderOgImage();
}
