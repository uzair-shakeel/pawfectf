"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Temporary bridge — keep /dashboard/cars as the real route */
export default function PetsAliasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/cars");
  }, [router]);
  return null;
}
