"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Temporary bridge — keep /dashboard/cars/add as the real route */
export default function PetsAddAliasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/cars/add");
  }, [router]);
  return null;
}
