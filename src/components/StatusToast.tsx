"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import type { StatusResponse } from "../types";
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
  onDismiss: () => void;
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
 * - "Deploying" title with animated green dot
 * - Dismiss (x) button
 * - List of CheckRow components
 *
 * Uses react-draggable for drag support with bounds="body".
 * Injects keyframe CSS via a <style> tag for the pulse animation.
 */
export function StatusToast({
  data,
  onDismiss,
  position,
  onDragStop,
}: StatusToastProps) {
  const [dismissHovered, setDismissHovered] = useState(false);
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
              <div style={headerDotStyle} />
              <span>Sta arrivando un aggiornamento!</span>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            style={{
              ...dismissButtonStyle,
              backgroundColor: dismissHovered
                ? dismissButtonHoverBg /* dark-mode-blue-400 */
                : "transparent",
              color: dismissHovered ? "#FFFFFF" : "#AAA9A9",
            }}
            onMouseEnter={() => setDismissHovered(true)}
            onMouseLeave={() => setDismissHovered(false)}
            aria-label="Dismiss deploy status"
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
