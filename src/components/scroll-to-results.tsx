"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ScrollToResults() {
  const searchParams = useSearchParams();
  const hasQuery = searchParams.has("query");

  useEffect(() => {
    if (hasQuery) {
      // Small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        const resultsElement = document.getElementById("results");
        if (resultsElement) {
          resultsElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
          });
        }
      }, 500); // Wait 500ms for content to load

      return () => clearTimeout(timer);
    }
  }, [hasQuery]);

  return null; // This component doesn't render anything
}
