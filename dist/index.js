"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  DeployStatusWidget: () => DeployStatusWidget
});
module.exports = __toCommonJS(src_exports);

// src/components/DeployStatusWidget.tsx
var import_react6 = require("react");

// src/hooks/useDeployStatus.ts
var import_react = require("react");
function useDeployStatus(apiPath = "/api/deploy-status", pollInterval = 3e4) {
  const [data, setData] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(false);
  const fetchStatus = (0, import_react.useCallback)(async () => {
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
  (0, import_react.useEffect)(() => {
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
var import_react2 = require("react");
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
  const [position, setPosition] = (0, import_react2.useState)(
    () => readPosition(storageKey)
  );
  const onDragStop = (0, import_react2.useCallback)(
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
var import_react4 = require("react");
var import_react_dom = require("react-dom");
var import_react_draggable = __toESM(require("react-draggable"));

// src/components/CheckRow.tsx
var import_react3 = require("react");

// src/components/styles.ts
var containerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 999999,
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
var iconPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  height: 34,
  padding: "0 14px",
  borderRadius: 999,
  backgroundColor: "#09202B",
  /* dark-mode-blue-300 */
  border: "2px solid #17506D",
  /* dark-mode-blue-600 — overridden per-state */
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  cursor: "grab",
  color: "#FFFFFF",
  /* white */
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1,
  whiteSpace: "nowrap",
  userSelect: "none"
};
var iconDotStyle = {
  width: 14,
  height: 14,
  borderRadius: "50%",
  flexShrink: 0
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
var import_jsx_runtime = require("react/jsx-runtime");
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
  const [hovered, setHovered] = (0, import_react3.useState)(false);
  const { color, text, isAnimated } = (0, import_react3.useMemo)(
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
  const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: dotStyle }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: checkLabelStyle, children: check.label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { ...statusTextStyle, color }, children: text }),
    check.startedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: elapsedTextStyle, children: formatElapsed(check.startedAt) })
  ] });
  if (hasUrl) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var import_jsx_runtime2 = require("react/jsx-runtime");
var TOAST_WIDTH = 300;
var VIEWPORT_MARGIN = 12;
function clampToViewport(desired, height) {
  if (typeof window === "undefined") return desired;
  const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - TOAST_WIDTH - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN);
  return {
    x: Math.min(Math.max(desired.x, VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(desired.y, VIEWPORT_MARGIN), maxY)
  };
}
function StatusToast({
  data,
  aggregate,
  title,
  onCollapse,
  position,
  onDragStop
}) {
  const [dismissHovered, setDismissHovered] = (0, import_react4.useState)(false);
  const nodeRef = (0, import_react4.useRef)(null);
  const styleRef = (0, import_react4.useRef)(null);
  const headerDot = {
    ...headerDotStyle,
    backgroundColor: aggregate.color,
    animation: aggregate.animated ? "dsw-pulse 1.5s ease-in-out infinite" : "none"
  };
  const [pos, setPos] = (0, import_react4.useState)(() => {
    const desired = position ?? {
      x: typeof window !== "undefined" ? window.innerWidth - TOAST_WIDTH - VIEWPORT_MARGIN : 800,
      y: VIEWPORT_MARGIN
    };
    return clampToViewport(desired, 0);
  });
  (0, import_react4.useEffect)(() => {
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
  (0, import_react4.useEffect)(() => {
    if (nodeRef.current) {
      nodeRef.current.style.setProperty("z-index", "999999", "important");
    }
  }, []);
  (0, import_react4.useLayoutEffect)(() => {
    const reclamp = () => {
      const height = nodeRef.current?.offsetHeight ?? 0;
      setPos((prev) => clampToViewport(prev, height));
    };
    reclamp();
    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
  }, []);
  const handleDrag = (_e, dragData) => {
    setPos({ x: dragData.x, y: dragData.y });
  };
  const handleDragStop = (_e, dragData) => {
    const clamped = clampToViewport({ x: dragData.x, y: dragData.y }, nodeRef.current?.offsetHeight ?? 0);
    setPos(clamped);
    if (onDragStop) {
      onDragStop(clamped.x, clamped.y);
    }
  };
  const toast = /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_react_draggable.default,
    {
      handle: ".deploy-widget-handle",
      nodeRef,
      position: pos,
      onDrag: handleDrag,
      onStop: handleDragStop,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ref: nodeRef, style: containerStyle, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: headerStyle, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "div",
            {
              className: "deploy-widget-handle",
              style: dragHandleStyle,
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: headerTitleStyle, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: headerDot }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: title })
              ] })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              onClick: onCollapse,
              style: {
                ...dismissButtonStyle,
                backgroundColor: dismissHovered ? dismissButtonHoverBg : "transparent",
                color: dismissHovered ? "#FFFFFF" : "#AAA9A9"
              },
              onMouseEnter: () => setDismissHovered(true),
              onMouseLeave: () => setDismissHovered(false),
              "aria-label": "Comprimi stato deploy",
              type: "button",
              children: "\u2715"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: checksContainerStyle, children: data.checks.map((check) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CheckRow, { check }, `${check.type}-${check.label}`)) })
      ] })
    }
  );
  if (typeof document === "undefined") return toast;
  return (0, import_react_dom.createPortal)(toast, document.body);
}

// src/components/StatusIcon.tsx
var import_react5 = require("react");
var import_react_dom2 = require("react-dom");
var import_react_draggable2 = __toESM(require("react-draggable"));
var import_jsx_runtime3 = require("react/jsx-runtime");
function StatusIcon({
  aggregate,
  label,
  onExpand,
  position,
  onDragStop
}) {
  const nodeRef = (0, import_react5.useRef)(null);
  const styleRef = (0, import_react5.useRef)(null);
  const draggedRef = (0, import_react5.useRef)(false);
  (0, import_react5.useEffect)(() => {
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
  (0, import_react5.useEffect)(() => {
    if (nodeRef.current) {
      nodeRef.current.style.setProperty("z-index", "999999", "important");
    }
  }, []);
  const defaultPosition = (0, import_react5.useMemo)(() => {
    if (position) return position;
    return {
      x: typeof window !== "undefined" ? window.innerWidth - 190 : 800,
      y: 20
    };
  }, []);
  const handleDragStart = () => {
    draggedRef.current = false;
  };
  const handleDrag = () => {
    draggedRef.current = true;
  };
  const handleDragStop = (_e, dragData) => {
    if (onDragStop) {
      onDragStop(dragData.x, dragData.y);
    }
  };
  const handleClick = () => {
    if (draggedRef.current) return;
    onExpand();
  };
  const buttonStyle = {
    ...iconPillStyle,
    borderColor: aggregate.color,
    boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 12px ${aggregate.color}66`
  };
  const dotStyle = {
    ...iconDotStyle,
    backgroundColor: aggregate.color,
    boxShadow: `0 0 8px ${aggregate.color}`,
    ...aggregate.animated ? { animation: "dsw-pulse 1.5s ease-in-out infinite" } : {}
  };
  const icon = /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    import_react_draggable2.default,
    {
      bounds: "body",
      nodeRef,
      defaultPosition,
      onStart: handleDragStart,
      onDrag: handleDrag,
      onStop: handleDragStop,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "div",
        {
          ref: nodeRef,
          style: { position: "fixed", top: 0, left: 0, zIndex: 999999 },
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              type: "button",
              style: buttonStyle,
              onClick: handleClick,
              "aria-label": label,
              title: label,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: dotStyle }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "Aggiornamenti" })
              ]
            }
          )
        }
      )
    }
  );
  if (typeof document === "undefined") return icon;
  return (0, import_react_dom2.createPortal)(icon, document.body);
}

// src/components/statusKind.ts
var ERROR_STATES = /* @__PURE__ */ new Set(["ERROR", "CANCELED"]);
var ACTIVE_STATES = /* @__PURE__ */ new Set([
  "BUILDING",
  "INITIALIZING",
  "in_progress",
  "QUEUED",
  "queued"
]);
function getAggregateStatus(checks) {
  if (checks.some((check) => ERROR_STATES.has(check.status))) {
    return { kind: "error", color: COLOR_ERROR, animated: false };
  }
  if (checks.some((check) => ACTIVE_STATES.has(check.status))) {
    return { kind: "building", color: COLOR_QUEUED, animated: true };
  }
  return { kind: "operational", color: COLOR_READY, animated: false };
}

// src/components/DeployStatusWidget.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var STATUS_LABELS = {
  operational: "Tutto operativo",
  building: "Sta arrivando un aggiornamento!",
  error: "Errore in un deploy"
};
function DeployStatusWidget({
  apiPath = "/api/deploy-status",
  pollInterval = 3e4,
  defaultPosition
}) {
  const { data, error } = useDeployStatus(apiPath, pollInterval);
  const { position, onDragStop } = usePersistedPosition();
  const [expanded, setExpanded] = (0, import_react6.useState)(false);
  const aggregate = (0, import_react6.useMemo)(
    () => data ? getAggregateStatus(data.checks) : null,
    [data]
  );
  const handleExpand = (0, import_react6.useCallback)(() => setExpanded(true), []);
  const handleCollapse = (0, import_react6.useCallback)(() => setExpanded(false), []);
  if (!data || error || !aggregate) {
    return null;
  }
  const pos = defaultPosition ?? position;
  const label = STATUS_LABELS[aggregate.kind];
  if (!expanded) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      StatusIcon,
      {
        aggregate,
        label,
        onExpand: handleExpand,
        position: pos,
        onDragStop
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    StatusToast,
    {
      data,
      aggregate,
      title: label,
      onCollapse: handleCollapse,
      position: pos,
      onDragStop
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeployStatusWidget
});
//# sourceMappingURL=index.js.map