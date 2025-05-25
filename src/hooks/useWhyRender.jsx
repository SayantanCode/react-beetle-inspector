import { useRef, useEffect } from "react";
import deepCompare from "../utils/deepCompare";
import { globalRenderStats } from "../utils/renderStats";
export const useWhyRender = (componentName, props = {}) => {
  const prevProps = useRef(props);
  const renderCount = useRef(1);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const changedProps = Object.entries(props).reduce((acc, [key, value]) => {
      if (!deepCompare(value, prevProps.current[key])) {
        acc[key] = {
          from: prevProps.current[key],
          to: value,
        };
      }
      return acc;
    }, {});

    const name = componentName || "Unknown";
    globalRenderStats.set(name, (globalRenderStats.get(name) || 0) + 1);

    console.groupCollapsed(
      `%c[${name}] Render #${renderCount.current}`,
      "color: dodgerblue;"
    );

    if (Object.keys(changedProps).length === 0) {
      console.log("No prop changes.");
    } else {
      console.log("Changed Props:", changedProps);
    }

    console.trace(`[${name}] render trace`);
    console.groupEnd();

    prevProps.current = props;
    renderCount.current += 1;
  });
};
