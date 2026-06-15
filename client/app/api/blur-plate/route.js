import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[blur-plate] Received file:", file.name, "size:", file.size, "type:", file.type);

    // Create a new FormData to send to the external API
    const apiFormData = new FormData();
    apiFormData.append("file", file);

    // Try the external API
    const apiUrl = "http://174.138.64.65/detect";
    console.log("[blur-plate] Calling external API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
    });

    console.log("[blur-plate] External API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[blur-plate] API error:", errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[blur-plate] API response keys:", Object.keys(data));

    // Check if we got a valid blurred image
    if (!data.image_base64 && !data.processed_image) {
      console.warn("[blur-plate] No blurred image in response");
      // Return the original file if no blur was applied
      return NextResponse.json({
        error: "No blur applied - API returned no processed image",
        processed_image: null
      }, { status: 500 });
    }

    // Return the response from the API
    return NextResponse.json(data);
  } catch (error) {
    console.error("[blur-plate] Error in API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to blur number plate" },
      { status: 500 }
    );
  }
}
