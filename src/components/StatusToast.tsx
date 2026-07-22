"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
 * Uses react-draggable for drag support with bounds="body".
 * Injects keyframe CSS via a <style> tag for the pulse animation.
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

  /* Header dot mirrors the collapsed icon's traffic-light color and only
     pulses while something is in flight. */
  const headerDot: React.CSSProperties = {
    ...headerDotStyle,
    backgroundColor: aggregate.color,
    animation: aggregate.animated
      ? "dsw-pulse 1.5s ease-in-out infinite"
      : "none",
  };
  const nodeRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

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

  const handleDragStop = (_e: DraggableEvent, dragData: DraggableData) => {
    if (onDragStop) {
      onDragStop(dragData.x, dragData.y);
    }
  };

  /* Calculate default position: top-right corner (lazy to avoid hydration mismatch) */
  const defaultPosition = useMemo(() => {
    if (position) return position;
    return {
      x: typeof window !== "undefined" ? window.innerWidth - 320 : 800,
      y: 20,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toast = (
    <Draggable
      handle=".deploy-widget-handle"
      bounds="body"
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      defaultPosition={defaultPosition}
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
