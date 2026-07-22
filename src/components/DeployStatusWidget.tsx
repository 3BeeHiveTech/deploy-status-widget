"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useDeployStatus } from "../hooks/useDeployStatus";
import { usePersistedPosition } from "../hooks/usePersistedPosition";
import { StatusToast } from "./StatusToast";
import { StatusIcon } from "./StatusIcon";
import { getAggregateStatus, type AggregateKind } from "./statusKind";

export interface DeployStatusWidgetProps {
  /** API endpoint path (default "/api/deploy-status") */
  apiPath?: string;
  /** Polling interval in ms (default 30000) */
  pollInterval?: number;
  /** Initial position if no saved position exists */
  defaultPosition?: { x: number; y: number };
}

/** Header title per aggregate state (Italian, matching the host app). */
const STATUS_LABELS: Record<AggregateKind, string> = {
  operational: "Tutto operativo",
  building: "Sta arrivando un aggiornamento!",
  error: "Errore in un deploy",
};

/**
 * Top-level deploy status widget.
 *
 * Collapsed by default into a small draggable traffic-light icon
 * (green = operational, amber = building, red = error). Clicking the icon
 * expands the full StatusToast panel; the panel's ✕ collapses back to the icon.
 * Renders nothing only when there is no data yet or the request errored.
 *
 * Collapse/expand is session state (React) — a refresh reopens collapsed.
 */
export function DeployStatusWidget({
  apiPath = "/api/deploy-status",
  pollInterval = 30000,
  defaultPosition,
}: DeployStatusWidgetProps) {
  const { data, error } = useDeployStatus(apiPath, pollInterval);
  const { position, onDragStop } = usePersistedPosition();
  const [expanded, setExpanded] = useState(false);

  const aggregate = useMemo(
    () => (data ? getAggregateStatus(data.checks) : null),
    [data],
  );

  const handleExpand = useCallback(() => setExpanded(true), []);
  const handleCollapse = useCallback(() => setExpanded(false), []);

  /* Render nothing when there is no data yet or the request errored. */
  if (!data || error || !aggregate) {
    return null;
  }

  const pos = defaultPosition ?? position;
  const label = STATUS_LABELS[aggregate.kind];

  if (!expanded) {
    return (
      <StatusIcon
        aggregate={aggregate}
        label={label}
        onExpand={handleExpand}
        position={pos}
        onDragStop={onDragStop}
      />
    );
  }

  return (
    <StatusToast
      data={data}
      aggregate={aggregate}
      title={label}
      onCollapse={handleCollapse}
      position={pos}
      onDragStop={onDragStop}
    />
  );
}
