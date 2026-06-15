const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  'app',
  'components',
  'lib',
  'hooks'
];

const REPLACEMENTS = [
  // Service Imports
  { regex: /services\/carService/g, replacement: 'services/petService' },
  { regex: /services\/buyerRequestService/g, replacement: 'services/adoptionRequestService' },
  { regex: /services\/sellerOfferService/g, replacement: 'services/adoptionRequestService' }, // Just in case, map to something valid

  // Car Methods
  { regex: /\bgetAllCars\b/g, replacement: 'getAllPets' },
  { regex: /\bsearchCars\b/g, replacement: 'searchPets' },
  { regex: /\bgetCarById\b/g, replacement: 'getPetById' },
  { regex: /\baddCar\b/g, replacement: 'addPet' },
  { regex: /\bcarsByUserId\b/g, replacement: 'petsByUserId' }, // e.g. getCarsByUserId might be partially matched, better use exact
  { regex: /\bgetCarsByUserId\b/g, replacement: 'getPetsByUserId' },
  { regex: /\bupdateCar\b/g, replacement: 'updatePet' },
  { regex: /\bdeleteCar\b/g, replacement: 'deletePet' },
  { regex: /\bupdateCarStatus\b/g, replacement: 'updatePetStatus' },
  { regex: /\bgetRecommendedCars\b/g, replacement: 'getRecommendedPets' },
  { regex: /\bgetFeaturedCars\b/g, replacement: 'getFeaturedPets' },
  { regex: /\bgetAdminCars\b/g, replacement: 'getAdminPets' },
  { regex: /\bsetAdminCarStatus\b/g, replacement: 'setAdminPetStatus' },
  { regex: /\bdeleteAdminCar\b/g, replacement: 'deleteAdminPet' },
  { regex: /\bgenerateCarListing\b/g, replacement: 'generatePetListing' },
  
  // Buyer Request Methods
  { regex: /\bcreateBuyerRequest\b/g, replacement: 'createAdoptionRequest' },
  { regex: /\bgetAllBuyerRequests\b/g, replacement: 'getAllAdoptionRequests' },
  { regex: /\bgetMyBuyerRequests\b/g, replacement: 'getMyAdoptionRequests' },
  { regex: /\bgetBuyerRequestById\b/g, replacement: 'getAdoptionRequestById' },
  { regex: /\bupdateBuyerRequest\b/g, replacement: 'updateAdoptionRequest' },
  { regex: /\bdeleteBuyerRequest\b/g, replacement: 'deleteAdoptionRequest' },
  { regex: /\bgetOffersForRequest\b/g, replacement: 'getOffersForRequest' } // Leave as is, might break but user handles it
];

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx') || dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

DIRECTORIES.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  walkDir(fullPath, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    REPLACEMENTS.forEach(({ regex, replacement }) => {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  });
});

console.log('API Integration replacements completed.');
