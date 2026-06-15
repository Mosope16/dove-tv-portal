"use client";

import { useEffect } from "react";

export function AutoPrint() {
  useEffect(() => {
    // Wait for a brief moment to ensure fonts and styles are loaded
    const timeout = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
