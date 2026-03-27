// src/components/DeployStatusWidget.tsx
import { useState as useState5, useCallback as useCallback3 } from "react";

// src/hooks/useDeployStatus.ts
import { useState, useEffect, useCallback } from "react";
function useDeployStatus(apiPath = "/api/deploy-status", pollInterval = 3e4) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(apiPath);
      if (!response.ok) {
        setError(true);
        return;
      }
      const json = await response.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    }
  }, [apiPath]);
  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, pollInterval);
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

// src/hooks/usePersistedPosition.ts
import { useState as useState2, useCallback as useCallback2 } from "react";
var DEFAULT_STORAGE_KEY = "deploy-widget-position";
function readPosition(key) {
  if (typeof window === "undefined") return void 0;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return void 0;
    const parsed = JSON.parse(stored);
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return parsed;
    }
    return void 0;
  } catch {
    return void 0;
  }
}
function usePersistedPosition(storageKey = DEFAULT_STORAGE_KEY) {
  const [position, setPosition] = useState2(
    () => readPosition(storageKey)
  );
  const onDragStop = useCallback2(
    (x, y) => {
      const newPosition = { x, y };
      setPosition(newPosition);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPosition));
        } catch {
        }
      }
    },
    [storageKey]
  );
  return { position, onDragStop };
}

// src/components/StatusToast.tsx
import { useState as useState4, useRef, useEffect as useEffect2, useMemo as useMemo2 } from "react";
import Draggable from "react-draggable";

// src/components/CheckRow.tsx
import { useState as useState3, useMemo } from "react";

// src/components/styles.ts
var containerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 99999,
  width: 300,
  borderRadius: 12,
  backgroundColor: "#09202B",
  /* dark-mode-blue-300 */
  border: "1px solid #17506D",
  /* dark-mode-blue-600 */
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: "#FFFFFF",
  /* white */
  overflow: "hidden",
  userSelect: "none"
};
var headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px 8px 12px",
  borderBottom: "1px solid rgba(23, 80, 109, 0.5)"
  /* dark-mode-blue-600 @ 50% */
};
var headerTitleStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF",
  /* white */
  cursor: "grab"
};
var dragHandleStyle = {
  cursor: "grab",
  flex: 1
};
var dismissButtonStyle = {
  background: "none",
  border: "none",
  color: "#AAA9A9",
  /* black-300 */
  cursor: "pointer",
  padding: "4px 6px",
  borderRadius: 6,
  fontSize: 16,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.15s, color 0.15s"
};
var dismissButtonHoverBg = "#0D3041";
var checksContainerStyle = {
  padding: "4px 0"
};
var checkRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  fontSize: 12,
  transition: "background-color 0.15s"
};
var checkRowHoverBg = "#0D3041";
var statusDotBaseStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0
};
var checkLabelStyle = {
  flex: 1,
  color: "#CFDBE5",
  /* dark-mode-blue-1100 */
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
var statusTextStyle = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "lowercase"
};
var elapsedTextStyle = {
  fontSize: 11,
  color: "#AAA9A9",
  /* black-300 */
  whiteSpace: "nowrap"
};
var headerDotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#00F4B3",
  /* dark-mode-regeneration-600 */
  animation: "dsw-pulse 1.5s ease-in-out infinite"
};
var COLOR_BUILDING = "#00F4B3";
var COLOR_READY = "#00DF80";
var COLOR_ERROR = "#F54135";
var COLOR_QUEUED = "#FF8B16";
var keyframesCSS = `
@keyframes dsw-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
`;

// src/components/CheckRow.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var BUILDING_STATES = /* @__PURE__ */ new Set([
  "BUILDING",
  "INITIALIZING",
  "in_progress"
]);
var QUEUED_STATES = /* @__PURE__ */ new Set(["QUEUED", "queued"]);
var READY_STATES = /* @__PURE__ */ new Set(["READY", "idle", "completed"]);
function formatElapsed(startedAt) {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  if (elapsed < 0) return "";
  const seconds = Math.floor(elapsed / 1e3);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}
function getStatusDisplay(status) {
  if (BUILDING_STATES.has(status)) {
    return {
      color: COLOR_BUILDING,
      /* dark-mode-regeneration-600 */
      text: status === "in_progress" ? "building" : status.toLowerCase(),
      isAnimated: true
    };
  }
  if (QUEUED_STATES.has(status)) {
    return {
      color: COLOR_QUEUED,
      /* state-colors-warning-400 */
      text: "queued",
      isAnimated: true
    };
  }
  if (READY_STATES.has(status)) {
    return {
      color: COLOR_READY,
      /* state-colors-success-400 */
      text: status === "READY" ? "ready" : status,
      isAnimated: false
    };
  }
  if (status === "ERROR" || status === "CANCELED") {
    return {
      color: COLOR_ERROR,
      /* state-colors-error-600 */
      text: status.toLowerCase(),
      isAnimated: false
    };
  }
  return {
    color: COLOR_READY,
    text: status.toLowerCase(),
    isAnimated: false
  };
}
function CheckRow({ check }) {
  const [hovered, setHovered] = useState3(false);
  const { color, text, isAnimated } = useMemo(
    () => getStatusDisplay(check.status),
    [check.status]
  );
  const hasUrl = Boolean(check.url);
  const dotStyle = {
    ...statusDotBaseStyle,
    backgroundColor: color,
    ...isAnimated ? { animation: "dsw-pulse 1.5s ease-in-out infinite" } : {}
  };
  const rowStyle = {
    ...checkRowStyle,
    cursor: hasUrl ? "pointer" : "default",
    backgroundColor: hovered && hasUrl ? checkRowHoverBg : "transparent",
    textDecoration: "none",
    color: "inherit"
  };
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { style: dotStyle }),
    /* @__PURE__ */ jsx("span", { style: checkLabelStyle, children: check.label }),
    /* @__PURE__ */ jsx("span", { style: { ...statusTextStyle, color }, children: text }),
    check.startedAt && /* @__PURE__ */ jsx("span", { style: elapsedTextStyle, children: formatElapsed(check.startedAt) })
  ] });
  if (hasUrl) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href: check.url,
        target: "_blank",
        rel: "noopener noreferrer",
        style: rowStyle,
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        title: `Open ${check.label} dashboard`,
        children: content
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: rowStyle,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      children: content
    }
  );
}

// src/components/StatusToast.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function StatusToast({
  data,
  onDismiss,
  position,
  onDragStop
}) {
  const [dismissHovered, setDismissHovered] = useState4(false);
  const nodeRef = useRef(null);
  const styleRef = useRef(null);
  useEffect2(() => {
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
  const handleDragStop = (_e, dragData) => {
    if (onDragStop) {
      onDragStop(dragData.x, dragData.y);
    }
  };
  const defaultPosition = useMemo2(() => {
    if (position) return position;
    return {
      x: typeof window !== "undefined" ? window.innerWidth - 320 : 800,
      y: 20
    };
  }, []);
  return /* @__PURE__ */ jsx2(
    Draggable,
    {
      handle: ".deploy-widget-handle",
      bounds: "body",
      nodeRef,
      defaultPosition,
      onStop: handleDragStop,
      children: /* @__PURE__ */ jsxs2("div", { ref: nodeRef, style: containerStyle, children: [
        /* @__PURE__ */ jsxs2("div", { style: headerStyle, children: [
          /* @__PURE__ */ jsx2(
            "div",
            {
              className: "deploy-widget-handle",
              style: dragHandleStyle,
              children: /* @__PURE__ */ jsxs2("div", { style: headerTitleStyle, children: [
                /* @__PURE__ */ jsx2("div", { style: headerDotStyle }),
                /* @__PURE__ */ jsx2("span", { children: "Deploying" })
              ] })
            }
          ),
          /* @__PURE__ */ jsx2(
            "button",
            {
              onClick: onDismiss,
              style: {
                ...dismissButtonStyle,
                backgroundColor: dismissHovered ? dismissButtonHoverBg : "transparent",
                color: dismissHovered ? "#FFFFFF" : "#AAA9A9"
              },
              onMouseEnter: () => setDismissHovered(true),
              onMouseLeave: () => setDismissHovered(false),
              "aria-label": "Dismiss deploy status",
              type: "button",
              children: "\u2715"
            }
          )
        ] }),
        /* @__PURE__ */ jsx2("div", { style: checksContainerStyle, children: data.checks.map((check) => /* @__PURE__ */ jsx2(CheckRow, { check }, `${check.type}-${check.label}`)) })
      ] })
    }
  );
}

// src/components/DeployStatusWidget.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function DeployStatusWidget({
  apiPath = "/api/deploy-status",
  pollInterval = 3e4,
  defaultPosition
}) {
  const { data, error } = useDeployStatus(apiPath, pollInterval);
  const { position, onDragStop } = usePersistedPosition();
  const [dismissed, setDismissed] = useState5(false);
  const handleDismiss = useCallback3(() => {
    setDismissed(true);
  }, []);
  if (!data || error || !data.deploying || dismissed) {
    return null;
  }
  return /* @__PURE__ */ jsx3(
    StatusToast,
    {
      data,
      onDismiss: handleDismiss,
      position: defaultPosition ?? position,
      onDragStop
    }
  );
}
export {
  DeployStatusWidget
};
//# sourceMappingURL=index.mjs.map