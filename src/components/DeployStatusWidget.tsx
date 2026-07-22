"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useDeployStatus } from "../hooks/useDeployStatus";
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
  /**
   * Hide the built-in collapsed pill entirely. Pair with `open`/`onOpenChange`
   * to trigger the panel from host UI (e.g. a button inside an admin banner).
   */
  hideTrigger?: boolean;
  /**
   * Controlled panel visibility. Leave undefined to keep the built-in
   * uncontrolled pill → panel flow.
   */
  open?: boolean;
  /** Fired when the panel asks to close (its ✕) or the pill asks to open. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Surfaces the aggregate traffic-light state (null while loading/on error)
   * so host UI can mirror it — e.g. pulse a badge while a deploy is in flight.
   */
  onAggregateChange?: (kind: AggregateKind | null) => void;
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
 * Hosts can instead drive the panel themselves (embedded-trigger mode) via
 * `hideTrigger` + `open`/`onOpenChange`, and mirror the traffic-light state
 * through `onAggregateChange`.
 *
 * The widget is ANCHORED top-right in both states and no longer persists a drag
 * position. Persisting it (shared between the small pill and the wide panel)
 * stranded the collapsed pill "in the middle" whenever a stale/mismatched
 * coordinate was reused, so we drop persistence entirely: both states default to
 * their (viewport-clamped) top-right anchor on every open/close. Dragging still
 * works within a single open panel; collapsing re-pins top-right.
 */
export function DeployStatusWidget({
  apiPath = "/api/deploy-status",
  pollInterval = 30000,
  defaultPosition,
  hideTrigger = false,
  open,
  onOpenChange,
  onAggregateChange,
}: DeployStatusWidgetProps) {
  const { data, error } = useDeployStatus(apiPath, pollInterval);
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);

  /* Controlled vs uncontrolled panel visibility. When `open` is provided the
     host owns the state; we only echo intents through onOpenChange. */
  const isControlled = open !== undefined;
  const expanded = isControlled ? open : uncontrolledExpanded;

  const aggregate = useMemo(
    () => (data ? getAggregateStatus(data.checks) : null),
    [data],
  );

  /* Notify the host of aggregate changes through a ref so an unstable callback
     identity never re-fires the effect. */
  const onAggregateChangeRef = useRef(onAggregateChange);
  onAggregateChangeRef.current = onAggregateChange;
  const aggregateKind = aggregate?.kind ?? null;
  useEffect(() => {
    onAggregateChangeRef.current?.(aggregateKind);
  }, [aggregateKind]);

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledExpanded(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const handleExpand = useCallback(() => setExpanded(true), [setExpanded]);
  const handleCollapse = useCallback(() => setExpanded(false), [setExpanded]);

  /* Render nothing when there is no data yet or the request errored. */
  if (!data || error || !aggregate) {
    return null;
  }

  const label = STATUS_LABELS[aggregate.kind];

  if (!expanded) {
    if (hideTrigger) {
      return null;
    }
    return (
      <StatusIcon
        aggregate={aggregate}
        label={label}
        onExpand={handleExpand}
        position={defaultPosition}
      />
    );
  }

  return (
    <StatusToast
      data={data}
      aggregate={aggregate}
      title={label}
      onCollapse={handleCollapse}
      position={defaultPosition}
    />
  );
}
