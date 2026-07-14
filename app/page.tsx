"use client";

import { useEffect } from "react";
import HomepageMinimal from "@/components/HomepageMinimal";
import { initHomepageAnimations } from "@/lib/gsapAnimations";
import "./homepage.css";

export default function Home() {
  useEffect(() => initHomepageAnimations(), []);
  return <HomepageMinimal />;
}
