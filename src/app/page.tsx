"use client";

import { useState, useEffect } from "react";
import CVBuilder from "@/components/CVBuilder";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <CVBuilder />;
}
