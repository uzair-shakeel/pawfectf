import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    // Get the image data from the request
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the temp directory exists
    const tempDir = join(process.cwd(), 'public', 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Generate a unique filename
    const filename = `edited-${uuidv4()}.jpg`;
    const filepath = join(tempDir, filename);
    
    // Save the file
    await writeFile(filepath, buffer);
    
    // Return the path to the saved file (relative to public)
    return NextResponse.json({ 
      success: true,
      filePath: `/temp/${filename}` 
    });
  } catch (error) {
    console.error('Error saving edited image:', error);
    return NextResponse.json(
      { error: 'Failed to save image', details: error.message },
      { status: 500 }
    );
  }
} 