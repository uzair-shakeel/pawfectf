# 🐾 PAWFECT — Complete Frontend Migration Plan
> From: Ojest Car Marketplace → To: Pawfect Pet Adoption Platform

---

## 1. PAGE INVENTORY — Keep, Rename, or Delete

### ✅ WEBSITE PAGES (`app/website/`)

| Current Path | Status | New Name / Purpose |
|---|---|---|
| `website/page.jsx` | ✅ Keep (just redirects to `/`) | No change needed |
| `website/cars/page.jsx` | 🔁 Rename + Rewrite Filters | `/website/pets` — Pet search/listing page |
| `website/cars/[carId]/page.jsx` | 🔁 Rename + Edit | `/website/pets/[petId]` — Individual pet profile page |
| `website/contact/` | ✅ Keep as-is | Contact page — works fine |
| `website/faq/` | ✅ Keep, update content | FAQ about adoption, fees, vetting |
| `website/profile/` | ✅ Keep | Shelter/user public profile |
| `website/blog/` | ✅ Keep | Articles: pet care, rescue stories, training tips |
| `website/privacy/` | ✅ Keep | Standard legal page |
| `website/terms/` | ✅ Keep | Standard legal page |

### ✅ DASHBOARD PAGES (`app/dashboard/`)

| Current Path | Status | New Name / Purpose |
|---|---|---|
| `dashboard/home/` | ✅ Keep | Dashboard overview |
| `dashboard/cars/page.jsx` | 🔁 Rename + Edit | `/dashboard/pets` — Manage your pet listings |
| `dashboard/cars/add/page.tsx` | 🔁 Rename + Edit | `/dashboard/pets/add` — List a pet for adoption |
| `dashboard/cars/[carId]/` | 🔁 Rename | `/dashboard/pets/[petId]` — Edit individual pet listing |
| `dashboard/buyer-requests/` | 🔁 Rename | `/dashboard/adoption-requests` — Adoption applications received |
| `dashboard/seller-opportunities/` | ❌ REMOVE | Not applicable to pet adoption |
| `dashboard/photo-enhancer/` | ❌ REMOVE | Car-specific tool, no use for pets |
| `dashboard/messages/` | ✅ Keep | Adopter ↔ Shelter messaging |
| `dashboard/notifications/` | ✅ Keep | Alerts and notifications |
| `dashboard/profile/` | ✅ Keep | User account settings |
| `dashboard/change-password/` | ✅ Keep | Standard account management |
| `dashboard/admin/` | ✅ Keep | Admin moderation panel |

### ✅ OTHER PAGES

| Path | Status | Notes |
|---|---|---|
| `app/page.js` | ✅ Keep | Homepage — update hero content for pets |
| `sign-in/`, `sign-up/` | ✅ Keep | Auth flows — no change needed |
| `forgot-password/`, `reset-password/` | ✅ Keep | Standard auth |
| `onboarding/` | ✅ Keep, update copy | Onboard as "shelter" or "pet owner" |
| `wishlist/` | ✅ Keep | "Saved Pets" — favorite pets to adopt |
| `discovery/` | ✅ Keep | Explore/discover pets |

---

## 2. COMPONENTS TO CHANGE

### A. `components/website/CarCard.jsx` → `PetCard.jsx`

**What to change:**
- Rename the file to `PetCard.jsx`
- The card title currently shows: `{car.year} {car.make} {car.model}` 
  → Change to: `{pet.name}` (e.g. "Max" or "Bella")
- The subtitle currently shows: `mileage, transmission, engine, fuel`
  → Change to: `{pet.age}, {pet.breed}, {pet.gender}`
- The price overlay shows: `priceNetto zł`
  → Change to: `Adoption Fee: {pet.adoptionFee} zł` or `Free Adoption`
- The location text is fine — keep it
- `isFeatured` flag — keep that logic (featured shelter pets)
- Update the router link: `/website/cars/${car._id}` → `/website/pets/${pet._id}`
- Remove `translateFuelType` and `translateTransmission` helpers
- Add helpers for pet-specific data: `formatAge(ageMonths)` etc.

**Icon imports to swap (line 10-18):**
```js
// REMOVE:
import { Calendar, Gauge, Fuel, Settings2, MapPin, User, ShieldCheck, Zap } from "lucide-react";

// ADD:
import { MapPin, Heart, User, ShieldCheck, Tag } from "lucide-react";
```

---

### B. `components/website/FilterNavbar.jsx`

This is the biggest change. The entire filter state and all `<select>` dropdowns need to be replaced.

**Current state object (line 87-108):**
```js
// CURRENT (Cars):
{
  location, distance, make, model, bodyType,
  yearFrom, yearTo, stan, mileage, drivetrain,
  transmission, fuel, engineCapacity, color,
  krajProducenta, krajPochodzenia, serviceHistory,
  accidentHistory, priceFrom, priceTo
}
```

**New state object (Pets):**
```js
// NEW (Pets):
{
  location: "",
  distance: "",
  species: "",        // was: make
  breed: "",          // was: model
  size: "",           // was: bodyType
  ageGroup: "",       // was: fuel (Baby/Young/Adult/Senior)
  gender: "",         // was: transmission
  color: "",          // keep
  healthStatus: "",   // was: condition/stan (Vaccinated, Neutered, Special Needs)
  coatLength: "",     // was: drivetrain (Short, Medium, Long, Hairless)
  feeFrom: "",        // was: priceFrom
  feeTo: "",          // was: priceTo
}
```

**Dropdowns to replace:**

| Current Filter | Replace With | New Options |
|---|---|---|
| `make` (Marka) | `species` (Gatunek) | Dog, Cat, Bird, Rabbit, Hamster, Guinea Pig, Fish, Reptile, Other |
| `model` (Model) | `breed` (Rasa) | Dynamic based on species (load from `/data/breeds.json`) |
| `bodyType` (Typ nadwozia) | `size` (Rozmiar) | Small, Medium, Large, Extra Large |
| `fuel` (Typ Paliwa) | `ageGroup` (Wiek) | Baby (0-6m), Young (6m-2y), Adult (2-7y), Senior (7y+) |
| `transmission` (Skrzynia) | `gender` (Płeć) | Male, Female |
| `drivetrain` (Napęd) | `coatLength` (Sierść) | Hairless, Short, Medium, Long |
| `stan` (Stan) | `healthStatus` (Zdrowie) | Vaccinated, Spayed/Neutered, Special Needs, All Clear |
| `color` (Kolor) | `color` (Kolor sierści) | Black, White, Brown, Golden, Gray, Mixed, Calico, Tabby |
| `mileage` (Przebieg) | ❌ REMOVE | Not applicable |
| `engineCapacity` (Pojemność) | ❌ REMOVE | Not applicable |
| `krajPochodzenia` | ❌ REMOVE | Not needed |
| `krajProducenta` | ❌ REMOVE | Not needed |
| `yearFrom/yearTo` | ❌ REMOVE | Not needed |
| `priceFrom/priceTo` | `feeFrom/feeTo` (Opłata adopcyjna) | Keep as number inputs, rename placeholder |

**Sort options** (lines 538-580 in `cars/page.jsx`):

| Current Sort Label | Replace With |
|---|---|
| "Najlepsze dopasowanie" | "Best Match" ✅ keep |
| "Najniższa cena" | "Lowest Fee" |
| "Najwyższa cena" | "Highest Fee" |
| "Najniższy przebieg" | "Youngest" |
| "Najwyższy przebieg" | "Oldest" |
| "Najnowszy rok" | "Newest Listed" |
| "Najstarszy rok" | "Oldest Listed" |

---

### C. `components/website/FilterSidebar.jsx`

Same mapping as FilterNavbar above. The sidebar has similar filter inputs — apply the exact same field replacements. The sidebar is currently hidden on desktop (set to `hidden`) but visible on mobile overlay. Keep the structure, replace the filters.

---

### D. `components/website/HeroFeaturedCarousel.jsx`

- Replace car images with high-quality pet photos (add to `/public/pets/`)
- Change headline text to e.g. "Find Your Forever Friend"
- Change subtext from car-related to adoption messaging

---

### E. `components/website/browse-by-make.jsx` → `browse-by-species.jsx`

- Currently shows car brand logos (BMW, Mercedes, Toyota...)
- Replace with species icons/illustrations: Dog, Cat, Bird, Rabbit etc.
- Clicking a species → goes to `/website/pets?species=Dog`

---

### F. `components/website/browse-categories.jsx`

- Currently shows car body type categories (SUV, Sedan, Hatchback...)
- Replace with pet categories: Dogs, Cats, Small Animals, Birds, Reptiles, Fish
- Or repurpose as: "Browse by Purpose" — Adoption, Foster, Lost & Found

---

### G. `components/website/FeaturedCars.jsx` → `FeaturedPets.jsx`

- Rename, update props/labels from car to pet

---

### H. `components/website/Navbar.jsx`

- Change logo to Pawfect branding
- "Find a Car" link → "Adopt a Pet"
- Any "Sell" CTA → "List a Pet"
- Update all `href` values from `/website/cars` to `/website/pets`

---

### I. `components/website/Footer.jsx`

- Change "Ojest.pl" copyright text to "Pawfect"
- Update navigation links to match new site structure

---

### J. `components/dashboard/Sidebar.jsx`

**Lines to change:**

| Current Label | New Label | Current href | New href |
|---|---|---|---|
| "Wystaw Auto" | "List a Pet" | `/dashboard/cars/add` | `/dashboard/pets/add` |
| "Moje Auta" | "My Listings" | `/dashboard/cars` | `/dashboard/pets` |
| "Ulepszacz Zdjęć" | ❌ REMOVE | `/dashboard/photo-enhancer` | — |
| "Możliwości Dla Sprzedawców" | ❌ REMOVE | `/dashboard/seller-opportunities` | — |
| "Zapytania Kupujących" | "Adoption Requests" | `/dashboard/buyer-requests` | `/dashboard/adoption-requests` |
| `FaCar` icon | `FaPaw` icon | — | import from `react-icons/fa` |

Also update:
- Logo references: `logo.png`, `whitelogo.png` → Pawfect logo files
- Footer text: `Ojest.pl © 2025` → `Pawfect © 2025`
- Seller type labels: "Konto Firmowe" → "Shelter Account", "Konto Prywatne" → "Private Owner"

---

### K. `components/dashboard/RecentCars.jsx` → `RecentPets.jsx`

- Rename, update any "car" references in labels/data keys

---

### L. `components/website/CarsGridSection.jsx` → `PetsGridSection.jsx`

- Rename, update to use `PetCard` instead of `CarCard`

---

### M. `components/website/ImageCategorizationModal.jsx`

- This modal categorizes uploaded images (likely by angle: front, side, interior)
- For pets: change categories to: Main Photo, Side View, Face Close-up, Playing, With Owner
- Update the category labels in the modal UI

---

## 3. DATA FILES TO REPLACE

### `public/data/makes.json` → `public/data/species.json`

Currently loaded by `hooks/useMakesModels.js` — it provides car makes and their model variants.

**Replace with a species/breeds file:**
```json
[
  {
    "species": "Dog",
    "breeds": ["Labrador Retriever", "German Shepherd", "Golden Retriever", "Bulldog", "Poodle", "Beagle", "Rottweiler", "Yorkshire Terrier", "Dachshund", "Siberian Husky", "Mixed Breed", "Other"]
  },
  {
    "species": "Cat",
    "breeds": ["Persian", "Maine Coon", "Siamese", "British Shorthair", "Ragdoll", "Bengal", "Sphynx", "Scottish Fold", "Abyssinian", "Mixed Breed", "Other"]
  },
  {
    "species": "Bird",
    "breeds": ["Parrot", "Canary", "Budgerigar", "Cockatiel", "Lovebird", "Macaw", "Finch", "Dove", "Other"]
  },
  {
    "species": "Rabbit",
    "breeds": ["Holland Lop", "Mini Rex", "Lionhead", "Dutch", "Flemish Giant", "Angora", "Mixed Breed", "Other"]
  },
  {
    "species": "Hamster",
    "breeds": ["Syrian", "Dwarf Campbell", "Roborovski", "Chinese", "Other"]
  },
  {
    "species": "Other",
    "breeds": ["Guinea Pig", "Ferret", "Chinchilla", "Turtle", "Snake", "Lizard", "Fish", "Other"]
  }
]
```

### `hooks/useMakesModels.js` → `hooks/useSpeciesBreeds.js`

Update to load from `/data/species.json` and export `getSpecies()` and `getBreedsForSpecies(species)`.

---

## 4. URL PARAMETER MAPPING (Full Reference)

Use this table when updating `getFiltersFromUrl()` in `cars/page.jsx`:

| Old URL Param | New URL Param | Notes |
|---|---|---|
| `make` | `species` | e.g. `?species=Dog` |
| `model` | `breed` | e.g. `?breed=Labrador+Retriever` |
| `bodyType` | `size` | e.g. `?size=Medium` |
| `fuel` | `ageGroup` | e.g. `?ageGroup=Young` |
| `transmission` | `gender` | e.g. `?gender=Male` |
| `drivetrain` | `coatLength` | e.g. `?coatLength=Short` |
| `stan` / `condition` | `healthStatus` | e.g. `?healthStatus=Vaccinated` |
| `color` | `color` | Same |
| `location` | `location` | Same |
| `maxDistance` | `maxDistance` | Same |
| `priceFrom` | `feeFrom` | Adoption fee minimum |
| `priceTo` | `feeTo` | Adoption fee maximum |
| `mileageRange` | ❌ Remove | N/A |
| `engineCapacityRange` | ❌ Remove | N/A |
| `yearFrom` / `yearTo` | ❌ Remove | N/A |
| `krajPochodzenia` | ❌ Remove | N/A |
| `krajProducenta` | ❌ Remove | N/A |
| `serviceHistory` | ❌ Remove | N/A |
| `accidentHistory` | ❌ Remove | N/A |

---

## 5. BACKEND DATA MODEL CONTEXT

The frontend currently reads these fields from each car object:
- `car.make`, `car.model`, `car.year`, `car.fuel`, `car.transmission`, `car.engine`, `car.mileage`, `car.color`
- `car.financialInfo.priceNetto`, `car.financialInfo.sellerType`
- `car.images[]`, `car.isFeatured`, `car.createdBy`, `car.location.coordinates`

After migration, the pet object should provide:
- `pet.name`, `pet.species`, `pet.breed`, `pet.age` (in months), `pet.gender`, `pet.color`, `pet.size`, `pet.coatLength`
- `pet.adoptionFee`, `pet.healthStatus` (array: `["Vaccinated", "Neutered"]`)
- `pet.images[]`, `pet.isFeatured`, `pet.createdBy`, `pet.location.coordinates`
- `pet.description`, `pet.personality` (tags like: Playful, Calm, Good with kids)

---

## 6. SUMMARY OF WHAT TO REMOVE COMPLETELY

| File / Page | Reason |
|---|---|
| `app/dashboard/photo-enhancer/` | Car-specific AI photo tool |
| `app/dashboard/seller-opportunities/` | Dealer/company car-sales feature |
| `components/website/SimilarVehicles.jsx` | Replace with "Similar Pets" or just remove |
| `components/website/VideoSection.jsx` | Car showcase video — remove or replace with pet adoption video |
| `components/website/cars-near-me.jsx` | Repurpose as "Pets Near Me" or remove |
| `public/BMW.png`, `ford.png`, `toyota.png` etc. | Car brand logos — not needed |
| `public/video.mp4` | Car showcase video |
| `public/Hero2-*.webp` | Car hero images |

---

## 7. QUICK START — ORDER OF OPERATIONS

1. **Create `/public/data/species.json`** with the breeds data above
2. **Create `hooks/useSpeciesBreeds.js`** (copy `useMakesModels.js`, adapt for species/breeds)
3. **Rename `/app/website/cars/` → `/app/website/pets/`** and update all internal imports
4. **Rename `[carId]` → `[petId]`** in both `website` and `dashboard`
5. **Rewrite `FilterNavbar.jsx`** — replace all filter dropdowns with pet attributes
6. **Rewrite `FilterSidebar.jsx`** — same as above
7. **Rewrite `CarCard.jsx` → `PetCard.jsx`** — swap car fields for pet fields
8. **Update `Sidebar.jsx`** — fix nav labels, remove photo-enhancer, rename cars → pets
9. **Update `Navbar.jsx` and `Footer.jsx`** — Pawfect branding
10. **Delete removed pages**: `photo-enhancer`, `seller-opportunities`
11. **Update `browse-by-make.jsx` → `browse-by-species.jsx`**
12. **Update `HeroFeaturedCarousel.jsx`** — pet images + new headlines
