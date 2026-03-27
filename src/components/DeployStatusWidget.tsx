"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { StatusResponse } from "../types";
import { useDeployStatus } from "../hooks/useDeployStatus";
import { usePersistedPosition } from "../hooks/usePersistedPosition";
import { StatusToast } from "./StatusToast";

export interface DeployStatusWidgetProps {
  /** API endpoint path (default "/api/deploy-status") */
  apiPath?: string;
  /** Polling interval in ms (default 30000) */
  pollInterval?: number;
  /** Initial position if no saved position exists */
  defaultPosition?: { x: number; y: number };
}

const DISMISSED_KEY = "deploy-widget-dismissed";

/**
 * Compute a fingerprint of the current checks to detect new deployments.
 * When the fingerprint changes, the widget re-appears even if previously dismissed.
 */
function computeFingerprint(data: StatusResponse): string {
  return data.checks
    .map((c) => `${c.type}:${c.label}:${c.status}`)
    .sort()
    .join("|");
}

/**
 * Read the dismissed fingerprint from localStorage (SSR-safe).
 */
function getDismissedFingerprint(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

/**
 * Save the dismissed fingerprint to localStorage (SSR-safe).
 */
function setDismissedFingerprint(fingerprint: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISMISSED_KEY, fingerprint);
  } catch {
    /* localStorage full or unavailable — ignore */
  }
}

/**
 * Clear the dismissed fingerprint from localStorage (SSR-safe).
 */
function clearDismissedFingerprint(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DISMISSED_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Top-level deploy status widget component.
 *
 * Renders a floating, draggable, dismissable toast when deployments
 * are in progress. Renders nothing when idle, on error, or dismissed.
 *
 * Dismiss logic: stores a fingerprint of current check statuses.
 * The widget re-appears when the fingerprint changes (new deployment).
 */
export function DeployStatusWidget({
  apiPath = "/api/deploy-status",
  pollInterval = 30000,
  defaultPosition,
}: DeployStatusWidgetProps) {
  const { data, error } = useDeployStatus(apiPath, pollInterval);
  const { position, onDragStop } = usePersistedPosition();
  const [dismissed, setDismissed] = useState(false);

  const fingerprint = useMemo(
    () => (data ? computeFingerprint(data) : null),
    [data],
  );

  /* Check if this fingerprint was previously dismissed */
  useEffect(() => {
    if (!fingerprint) return;
    const saved = getDismissedFingerprint();
    if (saved === fingerprint) {
      setDismissed(true);
    } else {
      /* Fingerprint changed — new deployment, clear dismiss state */
      setDismissed(false);
      clearDismissedFingerprint();
    }
  }, [fingerprint]);

  const handleDismiss = useCallback(() => {
    if (fingerprint) {
      setDismissedFingerprint(fingerprint);
    }
    setDismissed(true);
  }, [fingerprint]);

  /* Render nothing when: no data, error, not deploying, or dismissed */
  if (!data || error || !data.deploying || dismissed) {
    return null;
  }

  return (
    <StatusToast
      data={data}
      onDismiss={handleDismiss}
      position={defaultPosition ?? position}
      onDragStop={onDragStop}
    />
  );
}
