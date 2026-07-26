"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { initWebsiteMotion } from "@/lib/gsapAnimations";

export default function MotionRuntime() {
  const pathname = usePathname();
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    cleanupRef.current();
    const frame = requestAnimationFrame(() => {
      cleanupRef.current = initWebsiteMotion(document.body);
      document.documentElement.dataset.motionReady = "true";
    });

    return () => {
      cancelAnimationFrame(frame);
      cleanupRef.current();
      cleanupRef.current = () => undefined;
    };
  }, [pathname]);

  return null;
}
