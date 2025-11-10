// useEngagementTracker.js — DEV visibility mode

import { useEffect, useRef } from "react";
import { logStudentEngagement } from "../api/Student";

export default function useEngagementTracker() {
  const activeMinutes = useRef(0);
  const lastActivity = useRef(Date.now());
  const minuteInterval = useRef(null);
  const flushInterval = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const tryStart = () => {
      const email = localStorage.getItem("userEmail");
      const role = localStorage.getItem("userRole");
      const accessRole = localStorage.getItem("accessRole");
      const token = localStorage.getItem("authToken");

      const effectiveRole = accessRole || role || "student";

      if (!email || !effectiveRole) {
        console.debug("[ENGAGEMENT] Waiting for tokens...");
        return false;
      }

      console.debug("[ENGAGEMENT] Tracker started", { email, effectiveRole });

      const resetTimer = () => {
        lastActivity.current = Date.now();
      };
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("click", resetTimer);

      // Count minutes every 15s (dev mode, faster feedback)
      minuteInterval.current = setInterval(() => {
        const now = Date.now();
        const diff = (now - lastActivity.current) / 1000;
        if (diff < 120) {
          activeMinutes.current += 1;
          console.debug("[ENGAGEMENT] Minute logged. Total:", activeMinutes.current);
        } else {
          console.debug("[ENGAGEMENT] Skipped minute (inactive >120s)");
        }
      }, 15000);

      const flushEngagement = async () => {
        console.debug("[ENGAGEMENT] Flush triggered, buffer =", activeMinutes.current);
        if (activeMinutes.current > 0) {
          try {
            if (effectiveRole === "student") {
              await logStudentEngagement(email, activeMinutes.current, token);
            }
            console.debug("[ENGAGEMENT] Flushed", activeMinutes.current, "minutes");
          } catch (err) {
            console.error("[ENGAGEMENT] Flush failed:", err);
          }
          activeMinutes.current = 0;
        }
      };

      // Flush every 30s in dev mode
      flushInterval.current = setInterval(flushEngagement, 30000);

      // Manual trigger for debugging
      window.forceFlushEngagement = flushEngagement;

      // Also flush on unload
      window.addEventListener("beforeunload", flushEngagement);

      started.current = true;

      return () => {
        clearInterval(minuteInterval.current);
        clearInterval(flushInterval.current);
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        window.removeEventListener("click", resetTimer);
        window.removeEventListener("beforeunload", flushEngagement);
        flushEngagement();
      };
    };

    let cleanup = null;
    const retry = setInterval(() => {
      if (!started.current) {
        cleanup = tryStart();
        if (cleanup) clearInterval(retry);
      }
    }, 2000);

    return () => {
      if (cleanup) cleanup();
      clearInterval(retry);
    };
  }, []);
}
