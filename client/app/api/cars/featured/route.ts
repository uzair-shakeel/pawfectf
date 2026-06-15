import { NextResponse } from "next/server";


export const revalidate = 60; // cache for 1 minute

export async function GET() {
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  // Try native featured endpoint first; fall back to filtering all cars
  const endpoints = [
    `${backendBase}/cars/featured`,
    `${backendBase}/cars`,
  ];

  let data: any[] | null = null;
  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { next: { revalidate } });
      if (!res.ok) {
        throw new Error(`Upstream ${url} responded ${res.status}`);
      }
      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.cars || [];
      data = list;
      break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!data) {
    return NextResponse.json(
      { message: "Failed to fetch featured cars", error: String(lastError) },
      { status: 502 }
    );
  }

  // If we fetched all cars, filter featured; otherwise assume already featured
  const featured = data.filter((c: any) => c?.isFeatured === true || c?.isFeatured === "true");
  const result = (featured.length > 0 ? featured : data).slice(0, 5);

  return NextResponse.json(result);
}
