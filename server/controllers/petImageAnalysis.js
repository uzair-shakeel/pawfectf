const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require("multer");

const SCRIPT_PATH = path.join(__dirname, "../../scripts/analyze_pet_image.py");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

exports.uploadAnalyzeImage = upload.single("image");

const BREED_ALIASES = {
  husky: "Husky syberyjski",
  "siberian husky": "Husky syberyjski",
  "husky syberyjski": "Husky syberyjski",
  "german shepherd": "Owczarek niemiecki",
  "owczarek niemiecki": "Owczarek niemiecki",
  labrador: "Labrador retriever",
  "labrador retriever": "Labrador retriever",
  "golden retriever": "Golden retriever",
  golden: "Golden retriever",
  chihuahua: "Chihuahua",
  bulldog: "Buldog angielski",
  "french bulldog": "Buldog francuski",
  "buldog francuski": "Buldog francuski",
  "buldog angielski": "Buldog angielski",
  rottweiler: "Rottweiler",
  beagle: "Beagle",
  poodle: "Pudel",
  pudel: "Pudel",
  "jack russell": "Jack russell terrier",
  "jack russell terrier": "Jack russell terrier",
  dachshund: "Jamnik",
  jamnik: "Jamnik",
  malamute: "Alaskan malamute",
  "alaskan malamute": "Alaskan malamute",
  "border collie": "Border collie",
  shiba: "Shiba inu",
  "shiba inu": "Shiba inu",
  "yorkshire terrier": "Yorkshire terrier",
  yorkie: "Yorkshire terrier",
  "mixed breed": "Kundel / mieszaniec",
  mixed: "Kundel / mieszaniec",
  mix: "Kundel / mieszaniec",
  mongrel: "Kundel / mieszaniec",
  kundel: "Kundel / mieszaniec",
  mieszaniec: "Kundel / mieszaniec",
};

function resolvePythonBin() {
  const candidates = [
    process.env.PYTHON_PATH,
    path.join(__dirname, "../../scripts/.venv/bin/python3"),
    path.join(__dirname, "../../scripts/.venv/bin/python"),
    path.join(__dirname, "../scripts/.venv/bin/python3"),
    "/var/www/rafraf/pawfectf/scripts/.venv/bin/python3",
    "python3",
    "python",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes("/") || candidate.includes("\\")) {
      if (fs.existsSync(candidate)) return candidate;
      continue;
    }
    return candidate;
  }
  return "python3";
}

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function loadSpeciesData() {
  const candidates = [
    path.join(__dirname, "../../client/public/data/species.json"),
    path.join(__dirname, "../data/species.json"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, "utf8"));
      }
    } catch {
      /* continue */
    }
  }
  return [];
}

function matchSpecies(raw, speciesData) {
  const n = normalize(raw);
  if (!n) return "";
  if (/(pies|dog|canine|puppy|szczen)/.test(n)) return "Pies";
  if (/(kot|cat|feline|kitten|koci)/.test(n)) return "Kot";
  const exact = speciesData.find((s) => normalize(s.species) === n);
  return exact?.species || "";
}

function isMixedBreedLabel(label) {
  return /mieszaniec|mixed|kundel|other|mix\b/i.test(String(label || ""));
}

function scoreBreed(rawNorm, breedNorm) {
  if (!rawNorm || !breedNorm) return 0;
  if (rawNorm === breedNorm) return 1;
  if (breedNorm.includes(rawNorm) || rawNorm.includes(breedNorm)) {
    return Math.min(rawNorm.length, breedNorm.length) / Math.max(rawNorm.length, breedNorm.length);
  }

  const rawTokens = rawNorm.split(" ").filter((t) => t.length > 2);
  const breedTokens = new Set(breedNorm.split(" ").filter((t) => t.length > 2));
  if (!rawTokens.length || !breedTokens.size) return 0;

  let hits = 0;
  for (const token of rawTokens) {
    if (breedTokens.has(token)) hits += 1;
    else if ([...breedTokens].some((bt) => bt.includes(token) || token.includes(bt))) hits += 0.75;
  }
  return hits / Math.max(rawTokens.length, breedTokens.size);
}

function matchBreed(raw, breeds, candidates = []) {
  if (!breeds?.length) return "";

  const guesses = [raw, ...(candidates || [])].filter(Boolean);
  let best = "";
  let bestScore = 0;

  for (const guess of guesses) {
    const n = normalize(guess);
    if (!n) continue;

    const aliased = BREED_ALIASES[n];
    if (aliased && breeds.includes(aliased)) return aliased;

    const exact = breeds.find((b) => normalize(b) === n);
    if (exact) return exact;

    for (const breed of breeds) {
      if (isMixedBreedLabel(breed)) continue;
      const score = scoreBreed(n, normalize(breed));
      if (score > bestScore) {
        bestScore = score;
        best = breed;
      }
    }
  }

  if (best && bestScore >= 0.28) return best;

  const saidMixed = guesses.some((g) => isMixedBreedLabel(g));
  if (saidMixed || !best) {
    return breeds.find((b) => isMixedBreedLabel(b)) || "";
  }
  return best;
}

function runPython({ args, stdinPayload }) {
  return new Promise((resolve, reject) => {
    const pythonBin = resolvePythonBin();
    const child = spawn(pythonBin, [SCRIPT_PATH, ...args], {
      cwd: path.join(__dirname, "../.."),
      env: process.env,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => {
      reject(
        new Error(
          `Failed to start Python (${pythonBin}). ` +
            `Set PYTHON_PATH in server/.env to your venv python. ${err.message}`
        )
      );
    });
    child.on("close", (code) => {
      let parsed;
      try {
        parsed = JSON.parse(stdout.trim() || "{}");
      } catch {
        return reject(
          new Error(
            `Python returned invalid JSON (code ${code}). ${stderr || stdout || "No output"}`
          )
        );
      }
      if (code !== 0 || parsed.error) {
        return reject(new Error(parsed.error || stderr || `Python exited with code ${code}`));
      }
      resolve(parsed);
    });

    if (stdinPayload != null) {
      child.stdin.write(String(stdinPayload));
    }
    child.stdin.end();
  });
}

function mapAnalysisResult(raw) {
  const speciesData = loadSpeciesData();
  const species = matchSpecies(raw.species, speciesData);
  const breeds = speciesData.find((s) => s.species === species)?.breeds || [];
  const breed = matchBreed(raw.breed, breeds, raw.breed_candidates || []);
  const gender = raw.gender === "Male" || raw.gender === "Female" ? raw.gender : "";
  const size = ["Small", "Medium", "Large", "Extra Large"].includes(raw.size) ? raw.size : "";

  return {
    species,
    breed,
    gender,
    size,
    description: typeof raw.description === "string" ? raw.description.trim() : "",
  };
}

function buildPetPrompt(speciesData) {
  const lines = (speciesData || []).map((item) => {
    const breeds = item.breeds || [];
    return `${item.species}: ${breeds.join(", ")}`;
  });
  const breedBlock =
    lines.join("\n") ||
    "Pies: Husky syberyjski, Kundel / mieszaniec\nKot: Mixed Breed";

  return `You are an expert pet breed identifier for a Polish adoption site.
Analyze the photo carefully (ears, snout, coat, body, eyes, markings).

Return ONLY valid JSON (no markdown):
{
  "species": "Pies" or "Kot" or "",
  "breed": "EXACT string from the allowed list below",
  "breed_candidates": ["up to 3 exact allowed breed names, best first"],
  "gender": "Male" or "Female" or "",
  "size": "Small" or "Medium" or "Large" or "Extra Large" or "",
  "description": "2-4 warm Polish sentences for an adoption bio, no pet name"
}

ALLOWED SPECIES + BREEDS (breed MUST be copied exactly from this list):
${breedBlock}

Hard rules:
- Prefer a specific breed when visual traits match (e.g. Siberian Husky features => "Husky syberyjski", Chihuahua => "Chihuahua").
- Use "Kundel / mieszaniec" or "Mixed Breed" ONLY when the animal clearly looks mixed or you truly cannot identify a breed.
- Never invent breed names outside the list.
- If unsure between specific breeds, pick the closest specific breed, not mixed.
- Do not invent a pet name in description.`;
}

function parseModelJson(text) {
  let cleaned = String(text || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned || "{}");
}

function getXaiClient() {
  const OpenAI = require("openai");
  return new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });
}

function extractResponseText(response) {
  if (response?.output_text) return response.output_text;
  if (!Array.isArray(response?.output)) return "";
  return response.output
    .flatMap((item) => item.content || [])
    .map((c) => c.text || "")
    .join("\n")
    .trim();
}

async function analyzeWithXai(buffer, mimeType = "image/jpeg") {
  const mime = mimeType || "image/jpeg";
  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
  const speciesData = loadSpeciesData();
  const model = process.env.XAI_VISION_MODEL || "grok-4.5";
  const xai = getXaiClient();

  const response = await xai.responses.create({
    model,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_image",
            image_url: dataUrl,
            detail: "high",
          },
          {
            type: "input_text",
            text: buildPetPrompt(speciesData),
          },
        ],
      },
    ],
  });

  const raw = parseModelJson(extractResponseText(response));
  return mapAnalysisResult({
    species: raw.species || "",
    breed: raw.breed || "",
    breed_candidates: Array.isArray(raw.breed_candidates) ? raw.breed_candidates : [],
    gender: raw.gender || "",
    size: raw.size || "",
    description: raw.description || "",
  });
}

async function analyzeFromTempFile(buffer, originalName = "pet.jpg") {
  const ext = path.extname(originalName || "") || ".jpg";
  const tempPath = path.join(
    os.tmpdir(),
    `pawfect-analyze-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`
  );
  fs.writeFileSync(tempPath, buffer);
  try {
    const raw = await runPython({
      args: ["--image", tempPath],
      stdinPayload: null,
    });
    return mapAnalysisResult(raw);
  } finally {
    try {
      fs.unlinkSync(tempPath);
    } catch {
      /* ignore */
    }
  }
}

exports.analyzePetImage = async (req, res) => {
  try {
    if (!process.env.XAI_API_KEY) {
      return res.status(503).json({ message: "XAI_API_KEY is not configured on the server." });
    }

    let buffer = null;
    let mimeType = "image/jpeg";

    if (req.file?.buffer) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype || "image/jpeg";
    } else {
      const { imageBase64, mimeType: bodyMime } = req.body || {};
      if (!imageBase64) {
        return res.status(400).json({ message: "image file or imageBase64 is required." });
      }
      const rawB64 = String(imageBase64).includes(",")
        ? String(imageBase64).split(",")[1]
        : String(imageBase64);
      buffer = Buffer.from(rawB64, "base64");
      mimeType = bodyMime || "image/jpeg";
    }

    // Primary path: Node + xAI (no Python needed)
    try {
      const result = await analyzeWithXai(buffer, mimeType);
      return res.json(result);
    } catch (directErr) {
      console.error("[Pet Image Analysis] direct xAI failed, trying Python:", directErr.message);
    }

    // Optional fallback if Python is available
    if (!fs.existsSync(SCRIPT_PATH)) {
      return res.status(500).json({
        message: "Image analysis failed and Python fallback is not available.",
      });
    }

    const result = await analyzeFromTempFile(
      buffer,
      mimeType.includes("png") ? "pet.png" : "pet.jpg"
    );
    return res.json(result);
  } catch (error) {
    console.error("[Pet Image Analysis]", error);
    return res.status(500).json({
      message: error.message || "Failed to analyze pet image.",
    });
  }
};

exports.punctuateText = async (req, res) => {
  try {
    if (!process.env.XAI_API_KEY) {
      return res.status(503).json({ message: "XAI_API_KEY is not configured on the server." });
    }

    const { text, lang } = req.body || {};
    const raw = String(text || "").trim();
    if (!raw) {
      return res.status(400).json({ message: "text is required." });
    }

    // Prefer direct xAI Responses API (more reliable than spawning Python for short text)
    try {
      const OpenAI = require("openai");
      const xai = new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: "https://api.x.ai/v1",
      });
      const model = process.env.XAI_VISION_MODEL || "grok-4.5";
      const langHint = String(lang || "").startsWith("pl")
        ? "The transcript may be Polish, English, or mixed."
        : "The transcript may be English, Polish, or mixed.";

      const response = await xai.responses.create({
        model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `You clean raw speech-to-text into natural written sentences.

${langHint}

Requirements:
- Add proper punctuation: periods, commas, question marks, exclamation marks
- Split into short clear sentences (like a normal paragraph people can read)
- Capitalize sentence starts
- Keep the speaker's words and language mix — DO NOT translate
- Light grammar fixes only when needed for readability (e.g. "are you write" → "are you writing")
- Do NOT invent new facts or remove meaning
- Return ONLY the corrected text
- No quotes, no markdown, no explanation

Bad example:
Okres i desant Bike i is very Trendy Booking You Can I tylko with you Willy boki decym bite is very dog is very friendly What the fuck are you write in this in english in Polish czy coś się

Good example:
Okres i desant Bike i is very trendy. Booking? You can. I tylko with you. Willy boki decym bite is very dog, is very friendly. What the fuck are you writing? Is this in English, in Polish, czy coś się?

Transcript:
${raw}`,
              },
            ],
          },
        ],
      });

      let fixed = (response.output_text || "").trim();
      if (!fixed && Array.isArray(response.output)) {
        fixed = response.output
          .flatMap((item) => item.content || [])
          .map((c) => c.text || "")
          .join("\n")
          .trim();
      }
      if (
        (fixed.startsWith('"') && fixed.endsWith('"')) ||
        (fixed.startsWith("'") && fixed.endsWith("'"))
      ) {
        fixed = fixed.slice(1, -1).trim();
      }
      if (fixed) {
        return res.json({ text: fixed });
      }
    } catch (directErr) {
      console.error("[PunctuateText] direct xAI failed, trying Python:", directErr.message);
    }

    // Fallback: Python script
    if (!fs.existsSync(SCRIPT_PATH)) {
      return res.status(500).json({ message: "Punctuation service unavailable." });
    }
    const result = await runPython({
      args: ["--punctuate", "--lang", lang || "pl-PL"],
      stdinPayload: raw,
    });
    return res.json({ text: result.text || raw });
  } catch (error) {
    console.error("[Punctuate Text]", error);
    return res.status(500).json({
      message: error.message || "Failed to punctuate text.",
    });
  }
};
