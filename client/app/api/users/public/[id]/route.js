import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

        console.log(`[API Route] Fetching public user info for ID: ${id}`);
        console.log(`[API Route] Backend URL: ${backendUrl}`);

        const response = await fetch(`${backendUrl}/api/users/public/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

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
        console.log(`[API Route] Successfully fetched user data`);
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API Route] Error fetching public user info:', error);
        return NextResponse.json(
            { message: 'Network error - could not connect to server', error: error.message },
            { status: 500 }
        );
    }
}
