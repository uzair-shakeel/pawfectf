import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const petDataString = formData.get('petData');
    const petData = JSON.parse(petDataString);
    
    // Handle image uploads
    const images = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        // In a real app, you'd upload to cloudinary or similar
        // For now, just store the filename
        images.push(`/uploads/${Date.now()}-${value.name}`);
      }
    }

    // Create pet data with images
    const newPet = {
      ...petData,
      images,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending_approval'
    };

    // In a real app, save to database
    console.log('New food donation pet:', newPet);

    return NextResponse.json({
      success: true,
      pet: newPet
    });
  } catch (error) {
    console.error('Error creating food donation pet:', error);
    return NextResponse.json(
      { error: 'Failed to create pet listing' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Mock data for approved food donation pets
    const pets = [
      {
        id: '1',
        name: 'Luna',
        species: 'Dog',
        breed: 'Golden Retriever',
        images: ['/placeholder.jpg'],
        status: 'approved',
        urgency: 'high',
        totalRaised: 450,
        goalAmount: 800,
        donationsCount: 12,
        shelter: {
          name: 'Happy Paws Shelter',
          city: 'Warsaw'
        },
        foodNeed: {
          reason: 'Recovery food needed after surgery',
          estimatedCost: 800
        }
      }
    ];

    return NextResponse.json({ pets });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    );
  }
}