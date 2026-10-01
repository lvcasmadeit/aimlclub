"use client";

import { useEffect, useState } from "react";

function readVars<T extends string>(names: readonly T[]) {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    names.map((name) => [name, styles.getPropertyValue(`--${name}`).trim()]),
  ) as Record<T, string>;
}

/**
 * Reads CSS custom properties from :root (for WebGL scenes that can't use CSS colors directly)
 * and re-reads them when the theme class on <html> changes. Pass a module-level constant array.
 */
export function useThemeVars<T extends string>(names: readonly T[]) {
  const [vars, setVars] = useState(() => readVars(names));

  useEffect(() => {
    const observer = new MutationObserver(() => setVars(readVars(names)));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [names]);

  return vars;
}
