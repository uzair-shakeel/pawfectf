const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const SCRIPT_PATH = path.join(__dirname, "../../scripts/analyze_pet_image.py");

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

function matchBreed(raw, breeds) {
  if (!raw || !breeds?.length) return "";
  const n = normalize(raw);
  if (!n) return "";

  let best = "";
  let bestScore = 0;
  for (const breed of breeds) {
    const bn = normalize(breed);
    if (bn === n) return breed;
    if (bn.includes(n) || n.includes(bn)) {
      const score = Math.min(bn.length, n.length) / Math.max(bn.length, n.length);
      if (score > bestScore) {
        bestScore = score;
        best = breed;
      }
    }
  }
  if (bestScore >= 0.4) return best;
  return breeds.find((b) => /mieszaniec|mixed|kundel|other/i.test(b)) || "";
}

function runPythonAnalyze({ imageBase64, mimeType }) {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_PATH || "python";
    const args = [SCRIPT_PATH, "--stdin-b64", "--mime", mimeType || "image/jpeg"];
    const child = spawn(pythonBin, args, {
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
          `Failed to start Python (${pythonBin}). Install Python and deps, or set PYTHON_PATH. ${err.message}`
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

    const payload = String(imageBase64 || "");
    child.stdin.write(payload);
    child.stdin.end();
  });
}

exports.analyzePetImage = async (req, res) => {
  try {
    if (!process.env.XAI_API_KEY) {
      return res.status(503).json({ message: "XAI_API_KEY is not configured on the server." });
    }
    if (!fs.existsSync(SCRIPT_PATH)) {
      return res.status(500).json({ message: `Python script missing: ${SCRIPT_PATH}` });
    }

    const { imageBase64, mimeType } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ message: "imageBase64 is required." });
    }

    const raw = await runPythonAnalyze({ imageBase64, mimeType });
    const speciesData = loadSpeciesData();
    const species = matchSpecies(raw.species, speciesData);
    const breeds = speciesData.find((s) => s.species === species)?.breeds || [];
    const breed = matchBreed(raw.breed, breeds);
    const gender = raw.gender === "Male" || raw.gender === "Female" ? raw.gender : "";
    const size = ["Small", "Medium", "Large", "Extra Large"].includes(raw.size) ? raw.size : "";

    return res.json({
      species,
      breed,
      gender,
      size,
      description: typeof raw.description === "string" ? raw.description.trim() : "",
    });
  } catch (error) {
    console.error("[Pet Image Analysis]", error);
    return res.status(500).json({
      message: error.message || "Failed to analyze pet image.",
    });
  }
};
