"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const RedirectContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    // Forward any existing query params to the new pets page
    const qs = searchParams.toString();
    router.replace(qs ? `/website/pets?${qs}` : "/website/pets");
  }, [router, searchParams]);
  return null;
};

const Page = () => (
  <Suspense fallback={null}>
    <RedirectContent />
  </Suspense>
);

export default Page;