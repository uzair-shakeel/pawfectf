# 🐾 PAWFECT — Complete Backend Migration Plan
> From: Ojest Car Marketplace API → Pawfect Pet Adoption API

---

## 1. FULL FILE INVENTORY & STATUS 

``` 
ojest_APIs/
├── index.js                        🔁 Update route names & CORS origins
├── models/index.js                 🔁 Replace Car schema → Pet schema (biggest change)
├── controllers/
│   ├── car.js                      🔁 Rename → pet.js, rewrite all fields
│   ├── buyerRequest.js             🔁 Rename → adoptionRequest.js, update fields
│   ├── sellerOffer.js              ❌ DELETE (car dealer offers — not needed)
│   ├── user.js                     ✅ Keep, minor updates
│   ├── chat.js                     ✅ Keep, update carId → petId references
│   ├── imageDetection.js           🔁 Keep logic, update image categories
│   ├── listingGeneration.js        🔁 Keep, update AI prompts for pet listings
│   └── vinLookup.js                ❌ DELETE (VIN = Vehicle ID — not for pets)
├── routes/
│   ├── car.js                      🔁 Rename → pet.js, update endpoints
│   ├── buyerRequest.js             🔁 Rename → adoptionRequest.js
│   ├── sellerOffer.js              ❌ DELETE
│   ├── auth.js                     ✅ Keep as-is
│   ├── user.js                     ✅ Keep as-is
│   ├── chat.js                     ✅ Keep, update carId references
│   ├── imageDetection.js           ✅ Keep
│   ├── listingGeneration.js        ✅ Keep
│   ├── vinLookup.js                ❌ DELETE
│   └── webhook.js                  ✅ Keep as-is
├── middlewares/
│   ├── auth.js                     ✅ Keep as-is
│   ├── clerkAuth.js                ✅ Keep as-is
│   └── uploadMiddleware.js         ✅ Keep as-is (image upload still needed)
└── utils/                          ✅ Keep as-is
```

---

## 2. MONGODB SCHEMA CHANGES (`models/index.js`)

### A. Replace `carSchema` → `petSchema` (CORE CHANGE)

**Current Car Schema fields to REMOVE:**
- `make`, `model`, `trim` (car brand/model)
- `year` (vehicle year)
- `mileage`, `drivetrain`, `transmission`, `fuel`, `engine`, `horsepower` (vehicle mechanics)
- `accidentHistory`, `serviceHistory`, `vin` (car history)
- `country`, `countryOfManufacturer` (car import info)
- `carCondition` (interior/mechanical/paintBody/frameUnderbody/overall)
- `warranties` (car warranty packages)
- `financialInfo.sellOptions`, `financialInfo.invoiceOptions` (dealer finance options)

**New `petSchema` fields:**

```js
const petSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },           // e.g. "Max"
  title: { type: String, required: true, trim: true },          // e.g. "Friendly Golden Retriever looking for a home"
  description: { type: String, required: true, trim: true },

  // Pet Identity
  species: { type: String, required: true, trim: true },        // Dog, Cat, Bird, Rabbit...
  breed: { type: String, trim: true },                          // Labrador Retriever, Mixed, etc.
  ageMonths: { type: Number },                                  // Age in months (0-240)
  gender: { type: String, enum: ["Male", "Female", "Unknown"] },
  size: { type: String, enum: ["Small", "Medium", "Large", "Extra Large"] },
  color: { type: String, trim: true },                          // Black, White, Brown, Golden...
  coatLength: { type: String, enum: ["Hairless", "Short", "Medium", "Long"] },

  // Health & Status
  healthStatus: { type: [String], default: [] },                // ["Vaccinated", "Neutered", "Microchipped"]
  specialNeeds: { type: String, trim: true, default: "" },

  // Adoption Info
  adoptionFee: { type: Number, default: 0 },                    // 0 = free adoption
  currency: { type: String, default: "PLN" },
  adoptionStatus: {
    type: String,
    enum: ["Available", "Pending", "Adopted"],
    default: "Available"
  },

  // Personality & Behavior
  personality: { type: [String], default: [] },                 // ["Playful", "Calm", "Good with kids", "Good with dogs"]

  // Images
  images: { type: [String], default: [] },
  categorizedImages: {
    type: [{
      url: { type: String, required: true },
      category: {
        type: String,
        enum: ["main", "side", "face", "playing", "with_owner", "other", "unknown"],
        default: "unknown"
      },
      detected_label: String,
      confidence: Number,
      index: Number,
    }],
    default: []
  },

  // AI-Generated Listing Sections (keep this — reuse for pet descriptions)
  aiSections: {
    type: [{ heading: String, content: String, source_tags: [String] }],
    default: []
  },

  // Location (keep identical)
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true }
  },

  // Approval/Status (keep identical)
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  isFeatured: { type: Boolean, default: false },
  createdBy: { type: String, required: true },  // User ID of shelter/owner
}, { timestamps: true });

// Keep the same indexes
petSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
petSchema.index({ "location.coordinates": "2dsphere" });
```

**Model registration (bottom of models/index.js):**
```js
// OLD:
const Car = mongoose.models.Car || mongoose.model("Car", carSchema);

// NEW:
const Pet = mongoose.models.Pet || mongoose.model("Pet", petSchema);
```

---

### B. Update `chatSchema` — replace `carId` with `petId`

```js
// OLD:
carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true }

// NEW:
petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true }
```

---

### C. Update `userSchema` — replace liked/passed Cars with Pets

```js
// OLD:
likedCars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
passedCars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],

// NEW:
savedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
passedPets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
```

---

### D. Replace `buyerRequestSchema` → `adoptionRequestSchema`

The `buyerRequest` was "I want to buy a specific car." For Pawfect, this becomes "I want to adopt a pet with these preferences."

```js
// REMOVE these fields:
make, model, type, budgetMin, budgetMax, preferredCondition

// NEW adoptionRequestSchema:
const adoptionRequestSchema = new mongoose.Schema({
  adopterId: { type: String, required: true, ref: "User" },
  title: { type: String, required: true, trim: true },         // "Looking to adopt a friendly dog"
  description: { type: String, required: true, trim: true },
  preferredSpecies: { type: String, trim: true },              // Dog, Cat...
  preferredBreed: { type: String, trim: true },
  preferredSize: { type: String, trim: true },
  preferredAgeGroup: { type: String, trim: true },             // Baby, Young, Adult, Senior
  preferredGender: { type: String, enum: ["Male", "Female", "Any"], default: "Any" },
  maxAdoptionFee: { type: Number },                            // was: budgetMax
  preferredFeatures: { type: [String], default: [] },          // ["Good with kids", "Calm"]
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [21.01178, 52.22977] }
  },
  status: {
    type: String,
    enum: ["Active", "Fulfilled", "Expired", "Cancelled"],
    default: "Active"
  },
  expiryDate: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });
```

---

### E. DELETE `sellerOfferSchema`

The `SellerOffer` model represents a dealer submitting a car offer in response to a buyer request. This concept doesn't apply to pet adoption. **Delete this schema entirely.**

If you later want shelter-to-adopter matching, that can be built fresh.

---

## 3. CONTROLLER CHANGES

### A. `controllers/car.js` → `controllers/pet.js` (RENAME + REWRITE)

**Remove entire `COUNTRY_MAPPING` block and `getCountryOfManufacturer()` function** (lines 12–97). This was car-brand to country mapping — not needed for pets.

**`addCar` → `addPet`** — Field mapping:

| Old Field (Car) | New Field (Pet) | Notes |
|---|---|---|
| `make` | `species` | required |
| `model` | `breed` | optional |
| `trim` | ❌ Remove | N/A |
| `type` | `size` | Small/Medium/Large/XL |
| `year` | ❌ Remove | N/A |
| `condition` | `adoptionStatus` | Available/Pending/Adopted |
| `mileage` | ❌ Remove | N/A |
| `drivetrain` | ❌ Remove | N/A |
| `transmission` | `gender` | Male/Female/Unknown |
| `fuel` | `ageGroup` or `ageMonths` | store actual age in months |
| `engine` | ❌ Remove | N/A |
| `horsepower` | ❌ Remove | N/A |
| `accidentHistory` | ❌ Remove | N/A |
| `serviceHistory` | ❌ Remove | N/A |
| `vin` | ❌ Remove | N/A |
| `country` | ❌ Remove | N/A |
| `countryOfManufacturer` | ❌ Remove | N/A |
| `carCondition` | `specialNeeds` | free text string |
| `warranties` | ❌ Remove | N/A |
| `financialInfo.priceNetto` | `adoptionFee` | top-level field |
| `financialInfo.sellOptions` | ❌ Remove | N/A |
| `financialInfo.invoiceOptions` | ❌ Remove | N/A |
| `financialInfo.currency` | `currency` | top-level field |
| N/A | `name` | pet's actual name — NEW required |
| N/A | `personality` | array of traits — NEW |
| N/A | `healthStatus` | array — NEW |
| N/A | `coatLength` | NEW |

**`searchCars` → `searchPets`** — Query params to update (lines 797–913):

```js
// OLD destructured params:
{ make, model, type, yearFrom, yearTo, condition, mileage, minMileage,
  drivetrain, transmission, fuel, engine, serviceHistory, accidentHistory,
  countryOfManufacturer ... }

// NEW destructured params:
{ species, breed, size, gender, ageGroup, minAge, maxAge,
  color, coatLength, healthStatus, adoptionStatus,
  minFee, maxFee, location, maxDistance ... }
```

**Query building in `searchPets`:**
```js
// OLD:
if (make) query.make = make;
if (model) query.model = model;
if (fuel) query.fuel = fuel;
// ...etc

// NEW:
if (species) query.species = species;
if (breed) query.breed = breed;
if (size) query.size = size;
if (gender) query.gender = gender;
if (color) query.color = color;
if (coatLength) query.coatLength = coatLength;
if (healthStatus) query.healthStatus = { $in: healthStatus.split(",") };
if (adoptionStatus) query.adoptionStatus = adoptionStatus;

// Age range (stored as ageMonths):
if (ageGroup) {
  const ageMap = {
    "Baby":   { $gte: 0,  $lte: 6 },
    "Young":  { $gte: 6,  $lte: 24 },
    "Adult":  { $gte: 24, $lte: 84 },
    "Senior": { $gte: 84 }
  };
  if (ageMap[ageGroup]) query.ageMonths = ageMap[ageGroup];
}

// Fee range:
if (minFee || maxFee) {
  query.adoptionFee = {};
  if (minFee) query.adoptionFee.$gte = parseFloat(minFee);
  if (maxFee) query.adoptionFee.$lte = parseFloat(maxFee);
}
```

**`getRecommendedCars` → `getRecommendedPets`** — base recommendations on species/breed/size instead of make/model/price.

**`getCarStats` → `getPetStats`** — update aggregation field names:
```js
// OLD: group by $make
// NEW: group by $species

// OLD: avgPriceByMake → group "$financialInfo.priceNetto" by "$make"
// NEW: avgFeeBySpecies → group "$adoptionFee" by "$species"
```

**`getAllCarsForAdmin` → `getAllPetsForAdmin`** — update search filter:
```js
// OLD:
if (req.query.make) matchFilter.make = req.query.make;
if (req.query.model) matchFilter.model = req.query.model;
if (req.query.search) {
  matchFilter.$or = [
    { title: ... }, { make: ... }, { model: ... }, { vin: ... }
  ];
}

// NEW:
if (req.query.species) matchFilter.species = req.query.species;
if (req.query.breed) matchFilter.breed = req.query.breed;
if (req.query.search) {
  matchFilter.$or = [
    { title: { $regex: req.query.search, $options: "i" } },
    { name: { $regex: req.query.search, $options: "i" } },
    { species: { $regex: req.query.search, $options: "i" } },
    { breed: { $regex: req.query.search, $options: "i" } },
  ];
}
```

---

### B. `controllers/buyerRequest.js` → `controllers/adoptionRequest.js` (RENAME + UPDATE)

Update all field references from car-specific to pet-specific:

| Old Field | New Field |
|---|---|
| `buyerId` | `adopterId` |
| `make` | `preferredSpecies` |
| `model` | `preferredBreed` |
| `type` | `preferredSize` |
| `budgetMin` | ❌ Remove |
| `budgetMax` | `maxAdoptionFee` |
| `preferredCondition` | `preferredAgeGroup` |

---

### C. `controllers/sellerOffer.js` → ❌ DELETE

---

### D. `controllers/vinLookup.js` → ❌ DELETE

VIN (Vehicle Identification Number) is car-specific. Delete this controller and its route.

---

### E. `controllers/imageDetection.js` — Update Categories

The current image categories are car-specific:
```js
// OLD enum in carSchema:
["exterior", "interior", "engine", "dashboard", "wheel", "keys", "documents", "unknown"]
```

**Update to pet-friendly categories:**
```js
// NEW enum in petSchema:
["main", "side", "face", "playing", "with_owner", "other", "unknown"]
```

Update the detection logic accordingly. The AI detection API call can be kept, just update what categories it maps to.

---

### F. `controllers/listingGeneration.js` — Update AI Prompts

This controller uses an AI (Grok API) to generate listing descriptions. Update the prompt template from car-focused to pet-focused:

```js
// OLD prompt (roughly):
// "Generate a compelling car listing for a [year] [make] [model]..."

// NEW prompt:
// "Generate a compelling pet adoption listing for a [ageMonths]-month-old [breed] [species] named [name]..."
// Include personality traits, health status, ideal home description, etc.
```

---

## 4. ROUTE CHANGES

### A. `routes/car.js` → `routes/pet.js`

**Rename all endpoint paths and controller references:**

```js
// OLD (routes/car.js):
const carController = require("../controllers/car");
router.get("/search", carController.searchCars);
router.get("/recommended/:carId", carController.getRecommendedCars);
router.get("/", carController.getAllCars);
router.get("/:carId", carController.getCarById);
router.get("/admin/stats", carController.getCarStats);
router.get("/admin/all", carController.getAllCarsForAdmin);
router.patch("/admin/:carId/status", carController.updateCarStatusAdmin);
router.delete("/admin/:carId", carController.deleteCarAdmin);
router.post("/", auth, ..., carController.addCar);
router.get("/my-cars/all", auth, carController.getCarsByUserId);
router.put("/:carId", auth, ..., carController.updateCar);
router.delete("/:carId", auth, carController.deleteCar);
router.put("/status/:carId", auth, carController.updateCarStatus);

// NEW (routes/pet.js):
const petController = require("../controllers/pet");
router.get("/search", petController.searchPets);
router.get("/recommended/:petId", petController.getRecommendedPets);
router.get("/", petController.getAllPets);
router.get("/:petId", petController.getPetById);
router.get("/admin/stats", petController.getPetStats);
router.get("/admin/all", petController.getAllPetsForAdmin);
router.patch("/admin/:petId/status", petController.updatePetStatusAdmin);
router.delete("/admin/:petId", petController.deletePetAdmin);
router.post("/", auth, ..., petController.addPet);
router.get("/my-pets/all", auth, petController.getPetsByUserId);
router.put("/:petId", auth, ..., petController.updatePet);
router.delete("/:petId", auth, petController.deletePet);
router.put("/status/:petId", auth, petController.updatePetStatus);
```

---

### B. `routes/buyerRequest.js` → `routes/adoptionRequest.js`

```js
// Old import:
const buyerRequestController = require("../controllers/buyerRequest");

// New import:
const adoptionRequestController = require("../controllers/adoptionRequest");

// Old routes:
router.post("/", auth, buyerRequestController.createBuyerRequest);
router.get("/my-requests", auth, buyerRequestController.getBuyerRequestsByUserId);
router.get("/:requestId/offers", auth, buyerRequestController.getOffersForRequest);

// New routes:
router.post("/", auth, adoptionRequestController.createAdoptionRequest);
router.get("/my-requests", auth, adoptionRequestController.getAdoptionRequestsByUserId);
// Remove the /offers sub-route — seller offers don't exist anymore
```

---

### C. `routes/sellerOffer.js` → ❌ DELETE

### D. `routes/vinLookup.js` → ❌ DELETE

---

## 5. MAIN `index.js` CHANGES

```js
// OLD imports & mounts:
const carController = require("./controllers/car");
const carRoutes = require("./routes/car");
const sellerOfferRoutes = require("./routes/sellerOffer");
const vinLookupRoutes = require("./routes/vinLookup");

app.use("/api/cars", carRoutes);
app.use("/api/seller-offers", sellerOfferRoutes);
app.use("/api/vin-lookup", vinLookupRoutes);

carController.setIo(io);

// NEW imports & mounts:
const petController = require("./controllers/pet");
const petRoutes = require("./routes/pet");
const adoptionRequestRoutes = require("./routes/adoptionRequest");

app.use("/api/pets", petRoutes);                          // was: /api/cars
app.use("/api/adoption-requests", adoptionRequestRoutes); // was: /api/buyer-requests
// REMOVE: /api/seller-offers
// REMOVE: /api/vin-lookup

petController.setIo(io);  // update io injection reference
```

**Update CORS origins** (lines 29–46):
```js
// Remove ojest.pl references, add pawfect.pl:
"https://pawfect.pl",
"https://www.pawfect.pl",
"https://pawfect-sell.vercel.app",
// Remove:
// "https://ojest.pl",
// "https://www.ojest.pl",
// "https://ojest-sell-two.vercel.app",
```

---

## 6. FRONTEND SERVICE FILE UPDATES (in ojestSell)

The frontend uses these service files which call the API. They need URL updates too:

### `services/carService.js` → `services/petService.js`

```js
// OLD:
export const getAllCars = () => fetch('/api/cars');
export const searchCars = (filters) => fetch('/api/cars/search?' + new URLSearchParams(filters));
export const getCarById = (id) => fetch(`/api/cars/${id}`);
export const addCar = (data) => fetch('/api/cars', { method: 'POST', body: data });

// NEW:
export const getAllPets = () => fetch('/api/pets');
export const searchPets = (filters) => fetch('/api/pets/search?' + new URLSearchParams(filters));
export const getPetById = (id) => fetch(`/api/pets/${id}`);
export const addPet = (data) => fetch('/api/pets', { method: 'POST', body: data });
```

---

## 7. COMPLETE FIELD RENAME REFERENCE

Use this as a cheat-sheet when doing find-and-replace across the codebase:

| Category | Old (Car) | New (Pet) |
|---|---|---|
| **Model name** | `Car` | `Pet` |
| **Route prefix** | `/api/cars` | `/api/pets` |
| **ID param** | `carId` | `petId` |
| **User's listings** | `/my-cars/all` | `/my-pets/all` |
| **Controller file** | `car.js` | `pet.js` |
| **Route file** | `routes/car.js` | `routes/pet.js` |
| **Field: identity** | `make` | `species` |
| **Field: sub-identity** | `model` | `breed` |
| **Field: variant** | `trim` | ❌ removed |
| **Field: body shape** | `type` | `size` |
| **Field: age** | `year` | `ageMonths` |
| **Field: fuel** | `fuel` | `ageGroup` / `ageMonths` |
| **Field: gearbox** | `transmission` | `gender` |
| **Field: 4WD** | `drivetrain` | `coatLength` |
| **Field: km** | `mileage` | ❌ removed |
| **Field: cc** | `engine` | ❌ removed |
| **Field: bhp** | `horsepower` | ❌ removed |
| **Field: crash** | `accidentHistory` | ❌ removed |
| **Field: service** | `serviceHistory` | ❌ removed |
| **Field: reg** | `vin` | ❌ removed |
| **Field: origin** | `country` + `countryOfManufacturer` | ❌ removed |
| **Field: car state** | `carCondition` | `specialNeeds` |
| **Field: price** | `financialInfo.priceNetto` | `adoptionFee` |
| **Field: currency** | `financialInfo.currency` | `currency` |
| **Field: condition** | `condition` (New/Used) | `adoptionStatus` (Available/Pending/Adopted) |
| **New field** | — | `name` (pet's name) |
| **New field** | — | `personality` (trait array) |
| **New field** | — | `healthStatus` (array) |
| **New field** | — | `coatLength` |
| **Socket event** | `carStatusUpdate` | `petStatusUpdate` |
| **Buyer request** | `BuyerRequest` / `buyerId` | `AdoptionRequest` / `adopterId` |
| **Seller offer** | `SellerOffer` | ❌ DELETED |
| **Chat ref** | `chatSchema.carId` | `chatSchema.petId` |
| **User wishlist** | `likedCars` | `savedPets` |
| **User passed** | `passedCars` | `passedPets` |
| **Image categories** | exterior/interior/engine... | main/side/face/playing... |

---

## 8. DELETE LIST — Files to Remove Entirely

| File | Reason |
|---|---|
| `controllers/vinLookup.js` | VIN is Vehicle ID — irrelevant for pets |
| `controllers/sellerOffer.js` | Car dealer offer system — not needed |
| `routes/vinLookup.js` | Same |
| `routes/sellerOffer.js` | Same |
| `check-users.js` (root) | One-off debug script — clean up |
| `fix-clerk-index.js` (root) | One-off fix script — clean up |
| `fix-null-passwords.js` (root) | One-off fix script — clean up |
| `migrateUserFields.js` (root) | One-off migration — clean up |

---

## 9. RECOMMENDED ORDER OF OPERATIONS

1. **Update `models/index.js`** — Replace `carSchema` with `petSchema`, rename `BuyerRequest` → `AdoptionRequest`, update `chatSchema.carId` → `petId`, update `userSchema.likedCars` → `savedPets`
2. **Create `controllers/pet.js`** — Copy from `car.js`, apply all field renames from the table above
3. **Create `controllers/adoptionRequest.js`** — Copy from `buyerRequest.js`, apply field renames
4. **Create `routes/pet.js`** — Copy from `routes/car.js`, update controller ref and param names
5. **Create `routes/adoptionRequest.js`** — Copy from `routes/buyerRequest.js`, update refs
6. **Update `index.js`** — Swap route registrations, update CORS, update socket controller ref
7. **Update `controllers/chat.js`** — Replace `carId` with `petId` wherever it appears
8. **Update `controllers/imageDetection.js`** — Update image category enum/mapping
9. **Update `controllers/listingGeneration.js`** — Update AI prompt template for pet listings
10. **Delete** `sellerOffer.js` (controller + route), `vinLookup.js` (controller + route)
11. **Update frontend** `services/carService.js` → `petService.js` with new endpoint URLs
