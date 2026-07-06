import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://rafraf.pl";

export async function POST(request) {
    try {
        const body = await request.json();

        console.log("[API Route] POST /api/auth/signup - Proxying to backend");

        const backendUrl = `${BACKEND_URL}/api/auth/signup`;
        console.log("[API Route] Backend URL:", backendUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(backendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                console.error("[API Route] Backend error:", response.status, data);
                return NextResponse.json(
                    { message: data.message || "Signup failed" },
                    { status: response.status }
                );
            }

            console.log("[API Route] Signup successful");
            return NextResponse.json(data, { status: response.status });
        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError.name === "AbortError") {
                console.error("[API Route] Request timeout");
                return NextResponse.json(
                    { message: "Request timeout - please try again" },
                    { status: 504 }
                );
            }
            throw fetchError;
        }
    } catch (error) {
        console.error("[API Route] Signup error:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
