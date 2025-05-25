import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { subscribeToApiLogs } from "../apiLogger";
import { getRenderStats } from "../utils/renderStats";

export const DebugOverlay = () => {
  const [logs, setLogs] = useState([]);
  const [components, setComponents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });

  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const posRef = useRef({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  });
  const dragRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });
  const draggedRef = useRef(false); // Track if drag occurred during pointer events

  const updatePosition = (x, y) => {
    const el = buttonRef.current;
    if (!el) return;

    const clampedX = Math.max(0, Math.min(x, window.innerWidth - el.offsetWidth));
    const clampedY = Math.max(0, Math.min(y, window.innerHeight - el.offsetHeight));

    el.style.left = `${clampedX}px`;
    el.style.top = `${clampedY}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";

    posRef.current = { x: clampedX, y: clampedY };
  };

  const calculatePanelPosition = () => {
    const panel = panelRef.current;
    if (!panel) return;

    const { offsetWidth: panelWidth, offsetHeight: panelHeight } = panel;
    const { x, y } = posRef.current;
    const isLeft = x < window.innerWidth / 2;
    const isTop = y < window.innerHeight / 2;
    const panelX = isLeft ? x + 10 : x - panelWidth - 10;
    const panelY = isTop ? y + 10 : y - panelHeight - 10;
    setPanelPosition({ x: panelX, y: panelY });
  };

  useLayoutEffect(() => {
    if (visible) {
      calculatePanelPosition();
    }
  }, [visible]);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const handleDown = (e) => {
      dragRef.current.isDragging = true;
      draggedRef.current = false; // reset drag detection flag
      dragRef.current.offsetX = e.clientX - el.offsetLeft;
      dragRef.current.offsetY = e.clientY - el.offsetTop;
    };

    const handleMove = (e) => {
      if (!dragRef.current.isDragging) return;
      draggedRef.current = true; // movement detected, it's a drag
      const x = e.clientX - dragRef.current.offsetX;
      const y = e.clientY - dragRef.current.offsetY;
      updatePosition(x, y);
    };

    const handleUp = () => {
      dragRef.current.isDragging = false;
    };

    el.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      el.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  useEffect(() => {
    const keyHandler = (e) => {
      if (e.ctrlKey && e.key === "`") {
        setHidden((prev) => !prev);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  useEffect(() => {
    const unsub = subscribeToApiLogs(setLogs);
    const interval = setInterval(() => {
      setComponents(getRenderStats());
    }, 2000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  if (hidden) {
    // Instead of returning null, we keep rendering the button but hide it via CSS.
    // This preserves refs and event listeners allowing dragging after unhide.
    return (
      <div
        ref={buttonRef}
        onClick={() => {
          // onClick only toggles visible if not dragged
          if (!draggedRef.current) {
            setVisible((prev) => !prev);
          }
        }}
        style={{
          position: "fixed",
          zIndex: 10000,
          left: posRef.current.x,
          top: posRef.current.y,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "#000",
          color: "#fff",
          display: "none", // hide visually
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          cursor: "grab",
          userSelect: "none",
        }}
        title="Toggle Debug Panel"
      >
        🐞
      </div>
    );
  }

  return (
    <>
      <div
        ref={buttonRef}
        onClick={() => {
          // Prevent toggle if dragging happened
          if (!draggedRef.current) {
            setVisible((prev) => !prev);
          }
        }}
        style={{
          position: "fixed",
          zIndex: 10000,
          left: posRef.current.x,
          top: posRef.current.y,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          cursor: "grab",
          userSelect: "none",
        }}
        title="Toggle Debug Panel"
      >
        🐞
      </div>

      {visible && (
        <div
          ref={panelRef}
          className="debug-panel"
          style={{
            position: "fixed",
            top: panelPosition.y,
            left: panelPosition.x,
            zIndex: 10001,
            width: 320,
            maxHeight: 400,
            overflowY: "auto",
            backgroundColor: "#111",
            color: "#fff",
            fontFamily: "monospace",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            transition: "opacity 0.3s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Debug Info</strong>
            <button
              onClick={() => setVisible(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Top Rendered Components</strong>
            <ul style={{ paddingLeft: 15 }}>
              {components.map(([name, count], idx) => (
                <li key={idx}>
                  {name}: {count}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>API Calls ({logs.length})</strong>
            <ul style={{ paddingLeft: 15 }}>
              {logs
                .slice(-5)
                .reverse()
                .map((log, idx) => (
                  <li key={idx}>
                    <div style={{ wordBreak: "break-word" }}>
                      {log.method} {log.url}
                    </div>
                    <small>
                      {log.duration}ms | {log.status} |{" "}
                      {log.time.toLocaleTimeString()}
                    </small>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

