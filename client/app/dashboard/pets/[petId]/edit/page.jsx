"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Temporary bridge — keep /dashboard/cars/[carId]/edit as the real route */
export default function PetsEditAliasRedirect() {
  const router = useRouter();
  const { petId } = useParams();
  useEffect(() => {
    if (petId) router.replace(`/dashboard/cars/${petId}/edit`);
  }, [router, petId]);
  return null;
}
