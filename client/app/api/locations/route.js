import { NextResponse } from "next/server";

const POPULAR = [
  { name: "Warszawa", region: "Mazowieckie" },
  { name: "Kraków", region: "Małopolskie" },
  { name: "Wrocław", region: "Dolnośląskie" },
  { name: "Poznań", region: "Wielkopolskie" },
  { name: "Gdańsk", region: "Pomorskie" },
  { name: "Łódź", region: "Łódzkie" },
  { name: "Szczecin", region: "Zachodniopomorskie" },
  { name: "Lublin", region: "Lubelskie" },
  { name: "Bydgoszcz", region: "Kujawsko-pomorskie" },
  { name: "Katowice", region: "Śląskie" },
  { name: "Białystok", region: "Podlaskie" },
  { name: "Gdynia", region: "Pomorskie" },
  { name: "Częstochowa", region: "Śląskie" },
  { name: "Radom", region: "Mazowieckie" },
  { name: "Toruń", region: "Kujawsko-pomorskie" },
  { name: "Kielce", region: "Świętokrzyskie" },
  { name: "Rzeszów", region: "Podkarpackie" },
  { name: "Olsztyn", region: "Warmińsko-mazurskie" },
];

const placeName = (item) => {
  const a = item.address || {};
  return a.city || a.town || a.village || a.municipality || a.suburb || item.name || "";
};

export async function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim();

  if (q.length < 2) {
    const filtered = POPULAR.filter((city) =>
      !q || city.name.toLowerCase().includes(q.toLowerCase())
    );
    return NextResponse.json({ results: filtered });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("q", q);
    url.searchParams.set("countrycodes", "pl");
    url.searchParams.set("limit", "12");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "pl");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "RafrafPetAdoption/1.0 (https://rafraf.pl)",
        "Accept-Language": "pl",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: POPULAR.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) });
    }

    const data = await res.json();
    const seen = new Set();
    const results = [];

    for (const item of data) {
      const name = placeName(item);
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        name,
        region: item.address?.state || "",
      });
      if (results.length >= 10) break;
    }

    return NextResponse.json({ results: results.length ? results : POPULAR.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) });
  } catch {
    return NextResponse.json({
      results: POPULAR.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
    });
  }
}
