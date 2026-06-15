import { NextResponse } from "next/server";

// const API_BASE_URL = "https://photo-detect-api-lxbhx.ondigitalocean.app";
const API_BASE_URL = "https://ojest.pl/image/separation";

export async function POST(request) {
  try {
    console.log("HIT /api/detect-image route");
    const contentType = request.headers.get("content-type") || "";
    let imageFile = null;
    let imageUrl = null;

    // Handle both FormData and JSON requests
    if (contentType.includes("application/json")) {
      // JSON request with image_url
      const jsonData = await request.json();
      imageUrl = jsonData.image_url;

      if (!imageUrl) {
        return NextResponse.json(
          { error: "No image_url provided" },
          { status: 400 }
        );
      }
    } else {
      // FormData request
      const formData = await request.formData();
      imageFile = formData.get("image");
      imageUrl = formData.get("image_url");
    }

    if (!imageFile && !imageUrl) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Forward to the detection API
    // According to API docs, it supports both FormData and JSON
    const apiEndpoint = `${API_BASE_URL}/api/detect`;

    console.log("Calling detection API:", {
      endpoint: apiEndpoint,
      hasImageFile: !!imageFile,
      hasImageUrl: !!imageUrl,
      imageUrl: imageUrl?.substring(0, 50) + "...",
      contentType: contentType,
    });

    let response;

    if (imageFile) {
      // If we have a file, send as FormData
      const apiFormData = new FormData();
      apiFormData.append("image", imageFile);

      response = await fetch(apiEndpoint, {
        method: "POST",
        body: apiFormData,
      });
    } else if (imageUrl) {
      // Normalize the image URL - ensure it's a full, publicly accessible URL
      // Cloudinary URLs are already full URLs and publicly accessible
      let normalizedUrl = imageUrl.trim();

      // If it's not already a full URL (starts with http:// or https://)
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        // Check if it's a Cloudinary URL without protocol (starts with //)
        if (normalizedUrl.startsWith("//")) {
          normalizedUrl = `https:${normalizedUrl}`;
        } else if (
          normalizedUrl.includes("cloudinary.com") ||
          normalizedUrl.includes("res.cloudinary.com")
        ) {
          // Cloudinary URL missing protocol
          normalizedUrl = `https://${normalizedUrl}`;
        } else {
          // For relative paths, construct full URL using API base
          // The external API needs a publicly accessible URL
          const API_BASE =
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            "";
          if (API_BASE) {
            // Remove leading slash if present to avoid double slashes
            const cleanPath = normalizedUrl.startsWith("/")
              ? normalizedUrl.slice(1)
              : normalizedUrl;
            normalizedUrl = `${API_BASE}/${cleanPath}`;
          } else {
            // Fallback: assume it might be a protocol-relative URL
            normalizedUrl = normalizedUrl.startsWith("//")
              ? `https:${normalizedUrl}`
              : `https://${normalizedUrl}`;
          }
        }
      }

      // Ensure Cloudinary URLs are properly formatted
      // Cloudinary URLs should be: https://res.cloudinary.com/{cloud_name}/...
      if (
        normalizedUrl.includes("cloudinary.com") &&
        !normalizedUrl.includes("res.cloudinary.com")
      ) {
        // If it's cloudinary.com but not res.cloudinary.com, it might need adjustment
        normalizedUrl = normalizedUrl.replace(
          "cloudinary.com",
          "res.cloudinary.com"
        );
      }

      console.log("Normalized image URL for Cloudinary:", {
        original: imageUrl?.substring(0, 100),
        normalized: normalizedUrl?.substring(0, 100),
        isCloudinary: normalizedUrl?.includes("cloudinary.com"),
        isFullUrl: /^https?:\/\//i.test(normalizedUrl),
      });

      // If we have a URL, send as JSON (as per API documentation)
      // The API accepts image_url directly as JSON and can fetch from Cloudinary
      response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: normalizedUrl,
        }),
      });
    } else {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Detection API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        hasImageFile: !!imageFile,
        hasImageUrl: !!imageUrl,
      });
      return NextResponse.json(
        { error: `Detection API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Detection API success response:", {
      success: data.success,
      category: data.category,
      detected_label: data.detected_label,
      confidence: data.confidence,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in detect-image route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image detection" },
      { status: 500 }
    );
  }
}
