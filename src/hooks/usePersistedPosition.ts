"use client";

import { useState, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

interface UsePersistedPositionResult {
  /** Current stored position, or undefined if no position saved */
  position: Position | undefined;
  /** Callback to save a new position to localStorage */
  onDragStop: (x: number, y: number) => void;
}

const DEFAULT_STORAGE_KEY = "deploy-widget-position";

/**
 * Read a position from localStorage (SSR-safe).
 */
function readPosition(key: string): Position | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as Position;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return parsed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Hook to persist drag position in localStorage.
 *
 * Returns the last saved position (or undefined) and a callback
 * to save a new position when dragging stops.
 *
 * @param storageKey - localStorage key (default "deploy-widget-position")
 */
export function usePersistedPosition(
  storageKey: string = DEFAULT_STORAGE_KEY,
): UsePersistedPositionResult {
  const [position, setPosition] = useState<Position | undefined>(() =>
    readPosition(storageKey),
  );

  const onDragStop = useCallback(
    (x: number, y: number) => {
      const newPosition = { x, y };
      setPosition(newPosition);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPosition));
        } catch {
          /* localStorage full or unavailable — ignore */
        }
      }
    },
    [storageKey],
  );

  return { position, onDragStop };
}
