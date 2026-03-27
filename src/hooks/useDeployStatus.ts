"use client";

import { useState, useEffect, useCallback } from "react";
import type { StatusResponse } from "../types";

interface UseDeployStatusResult {
  data: StatusResponse | null;
  error: boolean;
}

/**
 * Polling hook that fetches deploy status from the API endpoint.
 *
 * - Polls at the given interval (default 30s)
 * - Fetches immediately on mount and when the tab becomes visible
 * - Clears the interval on unmount
 * - Never throws — sets error state on failure
 *
 * @param apiPath - API endpoint path (default "/api/deploy-status")
 * @param pollInterval - Polling interval in ms (default 30000)
 */
export function useDeployStatus(
  apiPath: string = "/api/deploy-status",
  pollInterval: number = 30000,
): UseDeployStatusResult {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(apiPath);
      if (!response.ok) {
        setError(true);
        return;
      }
      const json = (await response.json()) as StatusResponse;
      setData(json);
      setError(false);
    } catch {
      setError(true);
    }
  }, [apiPath]);

  useEffect(() => {
    /* Initial fetch */
    fetchStatus();

    /* Polling interval */
    const intervalId = setInterval(fetchStatus, pollInterval);

    /* Re-fetch when tab becomes visible */
    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchStatus();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [fetchStatus, pollInterval]);

  return { data, error };
}
