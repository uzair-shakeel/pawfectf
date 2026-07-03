import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

        // Get the authorization header from the request
        const authHeader = request.headers.get('authorization');

        console.log(`[API Route] Fetching user info for ID: ${id}`);

        const headers = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${backendUrl}/api/users/${id}`, {
            method: 'GET',
            headers,
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
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API Route] Error fetching user info:', error);
        return NextResponse.json(
            { message: 'Network error - could not connect to server', error: error.message },
            { status: 500 }
        );
    }
}
