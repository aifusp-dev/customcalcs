const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: string) {
  return HEX_COLOR_REGEX.test(value);
}

/**
 * Returns black or white, whichever gives better contrast against the
 * given hex color, so accent-colored buttons stay readable.
 */
export function getContrastColor(hex: string) {
  if (!isValidHexColor(hex)) return "#000000";

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

export const ACCENT_COLOR_PRESETS = [
  "#ffffff",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
];
