import { NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim().replace(/\/$/, '');
const API_BASE_URL = API_BASE ? `${API_BASE}/api` : '/api';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const petDataStr = formData.get('petData');

    console.log('[Food Donation API] Received request');
    console.log('[Food Donation API] Pet data string:', petDataStr);

    const petData = JSON.parse(petDataStr);

    console.log('[Food Donation API] Parsed pet data:', petData);

    // Get the auth token from the request
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    console.log('[Food Donation API] Has auth header:', !!authHeader);

    // Create a new FormData for the backend
    const backendFormData = new FormData();

    // Add the pet data with type field
    const petPayload = {
      title: petData.name,
      name: petData.name,
      description: petData.description,
      species: petData.species,
      breed: petData.breed || '',
      ageMonths: petData.age && !isNaN(parseInt(petData.age)) ? parseInt(petData.age) * 12 : undefined,
      gender: petData.gender,
      size: petData.size,
      type: 'food_donation',
      status: 'Pending',
      adoptionStatus: 'Available',
      isUrgent: petData.foodNeed?.urgency === 'high' || petData.foodNeed?.urgency === 'critical',
      foodNeed: JSON.stringify(petData.foodNeed || {}),
      shelter: JSON.stringify(petData.shelter || {}),
      location: JSON.stringify({
        type: 'Point',
        coordinates: petData.location?.coordinates || [21.01178, 52.22977],
        city: petData.location?.city || 'Unknown',
        address: petData.shelter?.address || 'Unknown'
      })
    };

    console.log('[Food Donation API] Pet payload:', petPayload);

    // Add images from formData
    const images = formData.getAll('images');
    console.log('[Food Donation API] Number of images:', images.length);

    images.forEach((image) => {
      backendFormData.append('images', image);
    });

    // Add pet data - only add fields that have values
    Object.keys(petPayload).forEach((key) => {
      const value = petPayload[key];
      if (value === undefined || value === null) {
        return; // Skip undefined/null values
      }
      // All values are already properly formatted (strings or stringified objects)
      backendFormData.append(key, value);
    });

    // Make request to backend
    const headers = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    console.log('[Food Donation API] Sending to backend:', `${API_BASE_URL}/pets`);

    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers,
      body: backendFormData,
    });

    const data = await response.json();

    console.log('[Food Donation API] Backend response status:', response.status);
    console.log('[Food Donation API] Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to create pet' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Food Donation API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
