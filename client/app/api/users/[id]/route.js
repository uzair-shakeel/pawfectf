import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, "");

        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization');

        console.log(`[API Route] Fetching user info for ID: ${id}`);

        const headers = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
            const response = await fetch(`${backendUrl}/api/users/${id}`, {
                method: 'GET',
                headers,
                signal: controller.signal,
                cache: 'no-store',
            });

            clearTimeout(timeoutId);

            console.log(`[API Route] Backend response status: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'User not found' }));
                console.error(`[API Route] Backend error:`, errorData);
                return NextResponse.json(
                    errorData,
                    { status: response.status }
                );
            }

            const data = await response.json();
            return NextResponse.json(data);
        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                console.error('[API Route] Request timeout');
                return NextResponse.json(
                    { message: 'Request timeout - server took too long to respond' },
                    { status: 504 }
                );
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('[API Route] Error fetching user info:', error);
        return NextResponse.json(
            { message: 'Network error - could not connect to server', error: error.message },
            { status: 500 }
        );
    }
}

// Configure route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
