# Pawfect Frontend Migration Plan

This document outlines how we will transition the frontend (`ojestSell`) from a car marketplace to **Pawfect**, a pet adoption website.

## 1. Pages to Keep and Repurpose

The following pages will be retained and updated for the pet adoption platform:

### Website Pages (`app/website/`)
- **`page.js` (Home)**: The main landing page. We will change the hero section, featured sections, and background images from cars to pets (e.g., featured pets, adoption stories).
- **`cars` -> `pets`**: The main search/listing page. This will become the pet adoption search page. The dynamic route `[carId]` will become `[petId]` for individual pet profiles.
- **`contact`**: Standard contact form.
- **`faq`**: Frequently Asked Questions about the adoption process, fees, and pet care.
- **`profile`**: Public or user profile page (e.g., a shelter's profile or an individual rescuer's profile).
- **`blog`**: Useful for posting articles about pet care, training tips, and rescue stories.
- **`privacy` & `terms`**: Standard legal pages.

### Dashboard Pages (`app/dashboard/`)
- **`home`**: User's dashboard overview (showing favorite pets, messages, etc.).
- **`cars` -> `pets`**: Where users/shelters can upload and manage the pets they have listed for adoption.
- **`buyer-requests` -> `adoption-requests`**: Manage applications from people wanting to adopt a pet.
- **`messages` & `notifications`**: Crucial for communication between adopters and shelters.
- **`profile` & `change-password`**: Standard user account management.
- **`admin`**: Admin panel to moderate listings and users.

### Other Core Pages
- **`sign-in`, `sign-up`, `forgot-password`, `reset-password`, `onboarding`**: Standard authentication flow.
- **`wishlist`**: Will be used for users to save/favorite pets they are interested in adopting.

---

## 2. Useless Pages to Remove

Some features are highly specific to vehicles and have no place in a pet adoption platform.
- **`app/dashboard/photo-enhancer`**: Remove this completely. While enhancing photos is nice, a dedicated background-removal/enhancement tool for cars is likely not needed for pets, or at least isn't a priority right now.
- **`app/dashboard/seller-opportunities`**: Depending on what this currently does (e.g., dealer bidding), it can be removed or heavily modified. If it's a "foster opportunities" page, we can rename it. Otherwise, delete it.

---

## 3. Sections to Edit & How

- **Navbar & Footer**: Update all navigation links (e.g., "Find a Car" -> "Adopt a Pet", "Sell your Car" -> "List a Pet"). Change logos and branding to Pawfect.
- **`HeroFeaturedCarousel`**: Change the images to high-quality pet photos. Change the text to "Find Your Perfect Companion".
- **`CarCard` -> `PetCard`**: Update the card UI to display pet-specific info:
  - Instead of Mileage/Year/Fuel, show: **Age**, **Breed**, **Gender**.
- **`FilterSidebar` & `FilterNavbar`**: These need a complete overhaul for pet attributes (detailed below).

---

## 4. Adapting the Search Filters (Cars -> Pets)

Currently, the `app/website/cars/page.jsx` uses filters like `make`, `model`, `fuel`, `mileage`, `engineCapacity`. We need to map these concepts to pet attributes. 

Here is how we should change the state and URL parameters in the code:

### The Mapping Strategy:
- **`make` -> `species`**: (e.g., Dog, Cat, Bird, Rabbit).
- **`model` -> `breed`**: (e.g., Golden Retriever, Siamese, Mixed).
- **`bodyType` -> `size`**: (e.g., Small, Medium, Large, Extra Large).
- **`fuel` -> `ageGroup`**: (e.g., Baby, Young, Adult, Senior).
- **`transmission` -> `gender`**: (Male, Female).
- **`drivetrain` -> `coatLength`**: (Hairless, Short, Medium, Long).
- **`condition` -> `healthStatus`**: (Vaccinated, Spayed/Neutered, Special Needs).
- **`color`**: Keep as `color` (e.g., Black, White, Brown, Calico).
- **`location`**: Keep as `location` / `distance`.
- **`priceFrom` / `priceTo` -> `feeFrom` / `feeTo`**: Adoption fees.

### What to change in the code (`page.jsx` & `FilterSidebar`):
1. **API Mapping**: In `getFiltersFromUrl()`, replace lines like `if (get("fuel")) apiFilters.fuel = get("fuel");` with `if (get("ageGroup")) apiFilters.ageGroup = get("ageGroup");`.
2. **Sort Options**: Change the sorting logic. 
   - `lowest-mileage` -> `youngest`
   - `highest-mileage` -> `oldest`
   - `lowest-price` -> `lowest-fee`
3. **UI Components**: In `FilterSidebar` and `FilterNavbar`, replace the dropdowns for "Make" and "Model" with "Species" and "Breed". You will likely need to update your constant arrays (e.g., replacing Honda/Toyota with Dog/Cat).
4. **Translations**: Ensure the `i18n` strings (like `t("cars.loading")`) are updated to `t("pets.loading")` across the application.
