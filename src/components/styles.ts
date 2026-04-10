import type { CSSProperties } from "react";

/*
 * Inline style objects using I Love Natura dark theme palette.
 *
 * Hex-to-token reference:
 * #041015 = dark-mode-blue-200
 * #09202B = dark-mode-blue-300
 * #0D3041 = dark-mode-blue-400
 * #17506D = dark-mode-blue-600
 * #00F4B3 = dark-mode-regeneration-600
 * #00DF80 = state-colors-success-400
 * #F54135 = state-colors-error-600
 * #FF8B16 = state-colors-warning-400
 * #CFDBE5 = dark-mode-blue-1100
 * #AAA9A9 = black-300
 * #FFFFFF = white
 */

/** Toast container — fixed position, dark glass panel */
export const containerStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 999999,
  width: 300,
  borderRadius: 12,
  backgroundColor: "#09202B", /* dark-mode-blue-300 */
  border: "1px solid #17506D", /* dark-mode-blue-600 */
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: "#FFFFFF", /* white */
  overflow: "hidden",
  userSelect: "none",
};

/** Header row — title + dismiss button container */
export const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px 8px 12px",
  borderBottom: "1px solid rgba(23, 80, 109, 0.5)", /* dark-mode-blue-600 @ 50% */
};

/** Header title area (indicator dot + text) */
export const headerTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF", /* white */
  cursor: "grab",
};

/** Drag handle area — spans the header title for grab cursor */
export const dragHandleStyle: CSSProperties = {
  cursor: "grab",
  flex: 1,
};

/** Dismiss (x) button */
export const dismissButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: "#AAA9A9", /* black-300 */
  cursor: "pointer",
  padding: "4px 6px",
  borderRadius: 6,
  fontSize: 16,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.15s, color 0.15s",
};

/** Dismiss button hover background — dark-mode-blue-400 */
export const dismissButtonHoverBg = "#0D3041";

/** Check rows container */
export const checksContainerStyle: CSSProperties = {
  padding: "4px 0",
};

/** Individual check row */
export const checkRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  fontSize: 12,
  transition: "background-color 0.15s",
};

/** Check row hover background */
export const checkRowHoverBg = "#0D3041"; /* dark-mode-blue-400 */

/** Status indicator dot — base style (shared by all states) */
export const statusDotBaseStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
};

/** Check label text */
export const checkLabelStyle: CSSProperties = {
  flex: 1,
  color: "#CFDBE5", /* dark-mode-blue-1100 */
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Status text (e.g. "building", "ready") */
export const statusTextStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "lowercase",
};

/** Elapsed time text */
export const elapsedTextStyle: CSSProperties = {
  fontSize: 11,
  color: "#AAA9A9", /* black-300 */
  whiteSpace: "nowrap",
};

/** Header deploying dot — animated pulse */
export const headerDotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#00F4B3", /* dark-mode-regeneration-600 */
  animation: "dsw-pulse 1.5s ease-in-out infinite",
};

/* ── Color constants ─────────────────────────────────────────────── */

/** Building/active indicator — dark-mode-regeneration-600 */
export const COLOR_BUILDING = "#00F4B3";

/** Success/ready — state-colors-success-400 */
export const COLOR_READY = "#00DF80";

/** Error — state-colors-error-600 */
export const COLOR_ERROR = "#F54135";

/** Warning/queued — state-colors-warning-400 */
export const COLOR_QUEUED = "#FF8B16";

/* ── Keyframes CSS (injected via <style> tag) ────────────────────── */

export const keyframesCSS = `
@keyframes dsw-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
`;
