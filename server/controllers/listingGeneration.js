const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze images using GPT-4 Vision
async function analyzeImagesWithVision(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  const imageContents = imageUrls.map(url => ({
    type: "image_url",
    image_url: { url: url }
  }));

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a pet image analysis expert. Analyze the provided pet images and extract factual visual information. Return a JSON object with these fields:\n- primary_color: the main visible color of the pet\n- secondary_color: any secondary visible colors or markings\n- visible_breed_features: apparent physical features (e.g., floppy ears, short tail, long snout)\n- visible_condition: apparent physical condition (healthy, well-groomed, underweight, etc.)\n- visible_defects: array of any visible physical issues or injuries\n- additional_notes: any other relevant visual observations\n\nBe factual and only report what you can clearly see."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze these pet images and provide factual visual details:" },
            ...imageContents
          ]
        }
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("[Vision Analysis] Error analyzing images:", error);
    return null;
  }
}

const SYSTEM_PROMPT = `
PAWFECT — UNIVERSAL PET ADOPTION LISTING PROMPT

OUTPUT LANGUAGE: English
PROMPT LANGUAGE: English

You generate a heartwarming, factual, scannable pet adoption listing for Pawfect.
No excessive exaggeration, keep it focused on the pet's traits, health, and needs.

========================
0) INPUTS (provided as JSON)
========================
You may receive:
- seller_input: user-entered data and notes about the pet (medium trust)
- photo_claims: claims extracted from images (CV/OCR) (medium trust; must be phrased as "Visible in photos:")

State all information as direct facts. Do NOT use attributions like "(per owner)", "according to the shelter", "owner-reported", "visible in photos", or "given by shelter".

========================
1) GLOBAL HARD RULES
========================
- Do not invent missing values.
- Keep everything scannable: short lines, grouped blocks.
- If something is missing: omit it (no “unknown”), unless your product requires a placeholder.
- **CRITICAL: Do NOT attribute information to sources. No "(per owner)", "per shelter", "owner claims", etc.**

========================
2) REQUIRED OUTPUT STRUCTURE (exact English headings)
========================
## Highlights
## Pet Details
## Personality & Behavior
## Health & Needs
## About Me
## Adoption Details
## Summary

========================
3) SECTION RULES
========================

3.1 Highlights
- Start with a bold summary line: **Meet [Name], a wonderful [Age] old [Breed] [Species] looking for a forever home.**
- Follow with 4–7 bullet points covering:
  - Gender and Size
  - Coat length and color
  - Health status summary (e.g., Vaccinated, Neutered)
  - Key personality traits (e.g., Playful, Good with kids)
  - Adoption status/fee summary

3.2 Pet Details
Include only if present:
- Species: Species
- Breed: Breed
- Age: Age in months
- Gender: Gender
- Size: Size
- Color: Color
- Coat Length: Coat Length

3.3 Personality & Behavior
- Summarize the pet's personality traits.
- Use bullets for key traits.

3.4 Health & Needs
- Health Status: list the health status (e.g., Vaccinated, Microchipped).
- Special Needs: list any special needs or requirements.

3.5 About Me
- Rewrite the owner's manual description (seller_input.description) into a heartwarming, professional English narrative.
- **CRITICAL: Do NOT use introductory phrases like "The owner provided the following notes:" or "According to the shelter...". Start directly with the information.**
- If the description is empty, OMIT this section.

3.6 Adoption Details
- Adoption Fee: the adoption fee and currency.
- Status: Available/Pending/Adopted.
- Location: Provide location details if available.

3.7 Summary
- 1–2 factual and emotional sentences: why this pet is special and what kind of home they need.

========================
4) FORMATTING RULES (CRITICAL)
========================
- Use ## for each main section heading (e.g., ## Highlights).
- Do not use ** for headings.
- If a section is empty or has no data, OMIT the heading and the section entirely.
- Use bullet points (•) for lists.
- NEVER output a heading if there is no content for it.
- Ensure the output is clean, professional, and heartwarming.
`;

exports.generateListing = async (req, res) => {
  try {
    const inputData = req.body;

    if (!inputData) {
      return res.status(400).json({ error: "Input data is required" });
    }

    // Extract images from pet_listing if present
    const petListing = inputData.pet_listing || inputData;
    const imageUrls = petListing.images || [];

    // Analyze images with vision if URLs are provided
    let visionAnalysis = null;
    if (imageUrls.length > 0) {
      visionAnalysis = await analyzeImagesWithVision(imageUrls);
    }

    // Merge vision analysis into input data as photo_claims
    const enrichedData = {
      ...inputData,
      photo_claims: visionAnalysis || inputData.photo_claims || {}
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "developer", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(enrichedData) },
      ],
      temperature: 0.7,
    });

    // Log exact raw response
    console.log("========== RAW API RESPONSE ==========");
    console.log(JSON.stringify(response, null, 2));
    console.log("========== END RAW RESPONSE ==========");
    console.log("\\n========== GENERATED LISTING CONTENT ==========");
    console.log(response.choices[0].message.content);
    console.log("========== END LISTING CONTENT ==========");

    const generatedListing = response.choices[0].message.content;

    res.json({
      listing: generatedListing,
      vision_analysis: visionAnalysis,
      success: true
    });
  } catch (error) {
    console.error("========== API ERROR ==========");
    console.error(error);
    console.error("========== END ERROR ==========");
    res.status(500).json({ error: "Failed to generate listing", details: error.message });
  }
};
