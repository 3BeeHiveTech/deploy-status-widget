"use client";

import React, { useState, useMemo } from "react";
import type { CheckResult } from "../types";
import {
  checkRowStyle,
  checkRowHoverBg,
  statusDotBaseStyle,
  checkLabelStyle,
  statusTextStyle,
  elapsedTextStyle,
  COLOR_BUILDING,
  COLOR_READY,
  COLOR_ERROR,
  COLOR_QUEUED,
} from "./styles";

/** Vercel states that indicate an active build */
const BUILDING_STATES = new Set([
  "BUILDING",
  "INITIALIZING",
  "in_progress",
]);

/** States that indicate a queued build */
const QUEUED_STATES = new Set(["QUEUED", "queued"]);

/** States that indicate success / idle */
const READY_STATES = new Set(["READY", "idle", "completed"]);

interface CheckRowProps {
  check: CheckResult;
}

/**
 * Compute a human-readable elapsed time string from an ISO timestamp.
 * Returns "Xm ago" or "Xs ago".
 */
function formatElapsed(startedAt: string): string {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  if (elapsed < 0) return "";
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

/**
 * Resolve status to a color and display text.
 */
function getStatusDisplay(status: string): {
  color: string;
  text: string;
  isAnimated: boolean;
} {
  if (BUILDING_STATES.has(status)) {
    return {
      color: COLOR_BUILDING, /* dark-mode-regeneration-600 */
      text: status === "in_progress" ? "building" : status.toLowerCase(),
      isAnimated: true,
    };
  }
  if (QUEUED_STATES.has(status)) {
    return {
      color: COLOR_QUEUED, /* state-colors-warning-400 */
      text: "queued",
      isAnimated: true,
    };
  }
  if (READY_STATES.has(status)) {
    return {
      color: COLOR_READY, /* state-colors-success-400 */
      text: status === "READY" ? "ready" : status,
      isAnimated: false,
    };
  }
  if (status === "ERROR" || status === "CANCELED") {
    return {
      color: COLOR_ERROR, /* state-colors-error-600 */
      text: status.toLowerCase(),
      isAnimated: false,
    };
  }
  /* Fallback for unknown states */
  return {
    color: COLOR_READY,
    text: status.toLowerCase(),
    isAnimated: false,
  };
}

/**
 * Individual check status row.
 *
 * Displays: label, colored status dot (animated when building),
 * status text, and elapsed time since startedAt.
 * Clicking the row opens check.url in a new tab (if provided).
 */
export function CheckRow({ check }: CheckRowProps) {
  const [hovered, setHovered] = useState(false);
  const { color, text, isAnimated } = useMemo(
    () => getStatusDisplay(check.status),
    [check.status],
  );

  const hasUrl = Boolean(check.url);

  const dotStyle = {
    ...statusDotBaseStyle,
    backgroundColor: color,
    ...(isAnimated ? { animation: "dsw-pulse 1.5s ease-in-out infinite" } : {}),
  };

  const rowStyle: React.CSSProperties = {
    ...checkRowStyle,
    cursor: hasUrl ? "pointer" : "default",
    backgroundColor: hovered && hasUrl ? checkRowHoverBg : "transparent",
    textDecoration: "none",
    color: "inherit",
  };

  const content = (
    <>
      <div style={dotStyle} />
      <span style={checkLabelStyle}>{check.label}</span>
      <span style={{ ...statusTextStyle, color }}>{text}</span>
      {check.startedAt && (
        <span style={elapsedTextStyle}>{formatElapsed(check.startedAt)}</span>
      )}
    </>
  );

  if (hasUrl) {
    return (
      <a
        href={check.url}
        target="_blank"
        rel="noopener noreferrer"
        style={rowStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={`Open ${check.label} dashboard`}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      style={rowStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </div>
  );
}
