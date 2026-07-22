"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import type { AggregateStatus } from "./statusKind";
import { iconPillStyle, iconDotStyle, keyframesCSS } from "./styles";

interface StatusIconProps {
  /** Aggregated traffic-light state (color + pulse). */
  aggregate: AggregateStatus;
  /** Human label used for tooltip + aria-label. */
  label: string;
  /** Expand into the full panel. */
  onExpand: () => void;
  /** Persisted position from localStorage (shared with the expanded panel). */
  position?: { x: number; y: number };
  /** Callback when drag stops, to persist position. */
  onDragStop?: (x: number, y: number) => void;
}

/**
 * Collapsed state of the deploy widget: a small draggable "Aggiornamenti" pill
 * badge whose border color reflects the aggregate build state (green operational
 * / amber building / red error). Clicking it (without dragging) expands into the
 * full StatusToast.
 *
 * Shares the drag-position localStorage anchor with StatusToast so the widget
 * stays put across collapse/expand. Portals to <body> to escape stacking
 * contexts, mirroring StatusToast.
 */
export function StatusIcon({
  aggregate,
  label,
  onExpand,
  position,
  onDragStop,
}: StatusIconProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  /* Distinguish a click (expand) from the tail end of a drag (react-draggable
     still fires onClick after a drag; this guard suppresses that). */
  const draggedRef = useRef(false);

  /* Inject keyframes CSS on mount (shared id with StatusToast — first wins) */
  useEffect(() => {
    if (typeof document === "undefined") return;

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

  /* Force z-index with !important to win over any host-app CSS rules */
  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.setProperty("z-index", "999999", "important");
    }
  }, []);

  /* Default position: top-right corner (lazy to avoid hydration mismatch) */
  const defaultPosition = useMemo(() => {
    if (position) return position;
    return {
      x: typeof window !== "undefined" ? window.innerWidth - 190 : 800,
      y: 20,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragStart = () => {
    draggedRef.current = false;
  };

  const handleDrag = () => {
    draggedRef.current = true;
  };

  const handleDragStop = (_e: DraggableEvent, dragData: DraggableData) => {
    if (onDragStop) {
      onDragStop(dragData.x, dragData.y);
    }
  };

  const handleClick = () => {
    if (draggedRef.current) return;
    onExpand();
  };

  const buttonStyle: React.CSSProperties = {
    ...iconPillStyle,
    borderColor: aggregate.color,
    boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 12px ${aggregate.color}66`,
  };

  const dotStyle: React.CSSProperties = {
    ...iconDotStyle,
    backgroundColor: aggregate.color,
    boxShadow: `0 0 8px ${aggregate.color}`,
    ...(aggregate.animated
      ? { animation: "dsw-pulse 1.5s ease-in-out infinite" }
      : {}),
  };

  const icon = (
    <Draggable
      bounds="body"
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      defaultPosition={defaultPosition}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
    >
      <div
        ref={nodeRef}
        style={{ position: "fixed", top: 0, left: 0, zIndex: 999999 }}
      >
        <button
          type="button"
          style={buttonStyle}
          onClick={handleClick}
          aria-label={label}
          title={label}
        >
          <span style={dotStyle} />
          <span>Aggiornamenti</span>
        </button>
      </div>
    </Draggable>
  );

  if (typeof document === "undefined") return icon;
  return createPortal(icon, document.body);
}
