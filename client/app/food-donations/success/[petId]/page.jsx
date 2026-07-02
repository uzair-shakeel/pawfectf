"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new website path with header/footer
    router.replace(`/website/food-donations/success/${params.petId}`);
  }, [params.petId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}
