"use client";

import React, { useState, useCallback } from "react";
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

/**
 * Top-level deploy status widget component.
 *
 * Renders a floating, draggable, dismissable toast when deployments
 * are in progress. Renders nothing when idle or on error.
 *
 * Dismiss is session-only (React state). Refreshing the page
 * resets the dismiss — the widget always shows if something is building.
 */
export function DeployStatusWidget({
  apiPath = "/api/deploy-status",
  pollInterval = 30000,
  defaultPosition,
}: DeployStatusWidgetProps) {
  const { data, error } = useDeployStatus(apiPath, pollInterval);
  const { position, onDragStop } = usePersistedPosition();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

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
