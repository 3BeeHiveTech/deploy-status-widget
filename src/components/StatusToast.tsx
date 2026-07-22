"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import type { StatusResponse } from "../types";
import type { AggregateStatus } from "./statusKind";
import { CheckRow } from "./CheckRow";
import {
  containerStyle,
  headerStyle,
  headerTitleStyle,
  dragHandleStyle,
  dismissButtonStyle,
  dismissButtonHoverBg,
  checksContainerStyle,
  headerDotStyle,
  keyframesCSS,
} from "./styles";

/** Fixed panel width (see containerStyle) + a viewport safety margin. */
const TOAST_WIDTH = 300;
const VIEWPORT_MARGIN = 12;

/**
 * Clamp a desired top-left position so the ENTIRE panel stays inside the
 * viewport. The collapsed pill is small and typically sits near the right edge,
 * but the expanded panel is wider (300px) and taller, so reusing the pill's
 * anchor verbatim pushed the panel off-screen (right/bottom). We clamp against
 * the measured height so it always fits.
 */
function clampToViewport(desired: { x: number; y: number }, height: number): { x: number; y: number } {
  if (typeof window === "undefined") return desired;
  const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - TOAST_WIDTH - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN);
  return {
    x: Math.min(Math.max(desired.x, VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(desired.y, VIEWPORT_MARGIN), maxY),
  };
}

interface StatusToastProps {
  data: StatusResponse;
  /** Aggregated traffic-light state — colors the header dot. */
  aggregate: AggregateStatus;
  /** Header title, resolved per aggregate state by the parent. */
  title: string;
  /** Collapse back to the icon (the ✕ button). */
  onCollapse: () => void;
  /** Persisted position from localStorage */
  position?: { x: number; y: number };
  /** Callback when drag stops, to persist position */
  onDragStop?: (x: number, y: number) => void;
}

/**
 * Floating toast container with drag support.
 *
 * Renders a dark-themed panel with:
 * - Drag handle in the header (class: deploy-widget-handle)
 * - Aggregate-state title with a traffic-light dot (pulses while in flight)
 * - Collapse (✕) button — folds the panel back into the icon
 * - List of CheckRow components
 *
 * Position is controlled + clamped to the viewport (on mount, on resize, and on
 * drag-stop) so the panel can never open or be dragged off-screen.
 */
export function StatusToast({
  data,
  aggregate,
  title,
  onCollapse,
  position,
  onDragStop,
}: StatusToastProps) {
  const [dismissHovered, setDismissHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  /* Header dot mirrors the collapsed icon's traffic-light color and only
     pulses while something is in flight. */
  const headerDot: React.CSSProperties = {
    ...headerDotStyle,
    backgroundColor: aggregate.color,
    animation: aggregate.animated
      ? "dsw-pulse 1.5s ease-in-out infinite"
      : "none",
  };

  /* Controlled position, initialized to a clamped anchor (top-right by default).
     Height is unknown at first paint (0) → re-clamped in the layout effect. */
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const desired = position ?? {
      x: typeof window !== "undefined" ? window.innerWidth - TOAST_WIDTH - VIEWPORT_MARGIN : 800,
      y: VIEWPORT_MARGIN,
    };
    return clampToViewport(desired, 0);
  });

  /* Inject keyframes CSS on mount */
  useEffect(() => {
    if (typeof document === "undefined") return;

    /* Avoid injecting duplicate style tags */
    const existingStyle = document.getElementById("dsw-keyframes");
    if (existingStyle) return;

    const style = document.createElement("style");
    style.id = "dsw-keyframes";
    style.textContent = keyframesCSS;
    document.head.appendChild(style);
    styleRef.current = style;

    return () => {
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  /* Force z-index with !important — React inline styles don't support !important,
     so we apply it imperatively after mount to win over any host-app CSS rules */
  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.setProperty("z-index", "999999", "important");
    }
  }, []);

  /* Re-clamp once the real height is known and whenever the viewport resizes, so
     the panel is always fully visible regardless of the (small) pill's anchor. */
  useLayoutEffect(() => {
    const reclamp = () => {
      const height = nodeRef.current?.offsetHeight ?? 0;
      setPos((prev) => clampToViewport(prev, height));
    };
    reclamp();
    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrag = (_e: DraggableEvent, dragData: DraggableData) => {
    setPos({ x: dragData.x, y: dragData.y });
  };

  const handleDragStop = (_e: DraggableEvent, dragData: DraggableData) => {
    const clamped = clampToViewport({ x: dragData.x, y: dragData.y }, nodeRef.current?.offsetHeight ?? 0);
    setPos(clamped);
    if (onDragStop) {
      onDragStop(clamped.x, clamped.y);
    }
  };

  const toast = (
    <Draggable
      handle=".deploy-widget-handle"
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      position={pos}
      onDrag={handleDrag}
      onStop={handleDragStop}
    >
      <div ref={nodeRef} style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div
            className="deploy-widget-handle"
            style={dragHandleStyle}
          >
            <div style={headerTitleStyle}>
              <div style={headerDot} />
              <span>{title}</span>
            </div>
          </div>

          {/* Collapse button — folds the panel back into the icon */}
          <button
            onClick={onCollapse}
            style={{
              ...dismissButtonStyle,
              backgroundColor: dismissHovered
                ? dismissButtonHoverBg /* dark-mode-blue-400 */
                : "transparent",
              color: dismissHovered ? "#FFFFFF" : "#AAA9A9",
            }}
            onMouseEnter={() => setDismissHovered(true)}
            onMouseLeave={() => setDismissHovered(false)}
            aria-label="Comprimi stato deploy"
            type="button"
          >
            &#x2715;
          </button>
        </div>

        {/* Check rows */}
        <div style={checksContainerStyle}>
          {data.checks.map((check) => (
            <CheckRow key={`${check.type}-${check.label}`} check={check} />
          ))}
        </div>
      </div>
    </Draggable>
  );

  /* Portal to document.body to escape ancestor stacking contexts */
  if (typeof document === "undefined") return toast;
  return createPortal(toast, document.body);
}
