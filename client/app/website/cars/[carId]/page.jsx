"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

const RedirectContent = () => {
  const router = useRouter();
  const { carId } = useParams();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (carId) {
      const qs = searchParams.toString();
      router.replace(qs ? `/website/pets/${carId}?${qs}` : `/website/pets/${carId}`);
    }
  }, [router, carId, searchParams]);
  return null;
};

const Page = () => (
  <Suspense fallback={null}>
    <RedirectContent />
  </Suspense>
);

export default Page;
