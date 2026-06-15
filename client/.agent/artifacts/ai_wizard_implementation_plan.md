# AI-Driven Car Listing Wizard - Implementation Plan

## Overview
Transform the current multi-step car listing form into a beautiful, AI-guided conversational experience where the system asks questions step-by-step and generates a comprehensive listing at the end.

## Design Philosophy
- **Conversational UI**: AI assistant guides the seller through each step
- **Progressive Disclosure**: Only show relevant questions based on previous answers
- **Visual Excellence**: Premium design with smooth animations and micro-interactions
- **Smart Defaults**: Pre-fill data from VIN lookup and photos
- **Source Transparency**: Show badges indicating data source (VIN/Photos/Seller/AI)

## Technical Stack
- **Framework**: Next.js 14 with TypeScript
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React + React Icons
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React useState with context for complex flows
- **AI Integration**: OpenAI API for listing generation

## Component Structure

```
app/dashboard/cars/add/
├── page.tsx (Main wizard orchestrator)
└── components/
    ├── WizardLayout.tsx (Shared layout with progress)
    ├── AIAssistant.tsx (AI avatar and messages)
    ├── steps/
    │   ├── Step01_PhotoUpload.tsx
    │   ├── Step02_VINDecode.tsx
    │   ├── Step03_RequiredBasics.tsx
    │   ├── Step04_Condition.tsx
    │   ├── Step05_Equipment.tsx
    │   ├── Step06_ModsExtras.tsx
    │   ├── Step07_FuelSpecific.tsx
    │   ├── Step08_Warranty.tsx
    │   ├── Step09_SellerNotes.tsx
    │   ├── Step10_History.tsx
    │   ├── Step11_AIPreview.tsx
    │   └── Step12_Publish.tsx
    └── shared/
        ├── SourceBadge.tsx
        ├── FieldWithSource.tsx
        ├── QuestionCard.tsx
        └── ProgressBar.tsx
```

## Step-by-Step Implementation

### Phase 1: Core Infrastructure (Steps 1-3)
1. Create WizardLayout with AI assistant
2. Build Step01_PhotoUpload with drag-drop
3. Build Step02_VINDecode with confirmation UI
4. Build Step03_RequiredBasics with smart validation

### Phase 2: Condition & Features (Steps 4-6)
5. Build Step04_Condition with visual checklist
6. Build Step05_Equipment with curated toggles
7. Build Step06_ModsExtras with dynamic list

### Phase 3: Specifics & Notes (Steps 7-9)
8. Build Step07_FuelSpecific with conditional rendering
9. Build Step08_Warranty with warranty builder
10. Build Step09_SellerNotes with character limits

### Phase 4: Final Steps (Steps 10-12)
11. Build Step10_History with report options
12. Build Step11_AIPreview with source badges
13. Build Step12_Publish with processing animation

## Data Structure

```typescript
interface CarListingData {
  // Step 1
  images: File[];
  imagePreviews: string[];
  
  // Step 2
  vin: string;
  vinData: {
    make: string;
    model: string;
    year: number;
    engine: string;
    transmission: string;
    drivetrain: string;
  };
  sellerOverrides: Partial<typeof vinData>;
  
  // Step 3
  mileage: number;
  mileageSource: 'seller' | 'document' | 'photo';
  price: number;
  currency: string;
  transmission: string; // if not from VIN
  drivetrain: string; // if not from VIN
  registrationStatus: string;
  saleDocuments: string[];
  
  // Step 4
  accidentHistory: 'no' | 'yes' | 'unknown';
  serviceHistory: 'full' | 'partial' | 'unknown';
  ownership: '1' | '2+' | 'unknown';
  storage: 'garage' | 'outside' | 'mixed';
  knownIssues: Array<{text: string; source: string}>;
  visibleFlaws: Array<{text: string; source: string}>;
  
  // Step 5
  equipment: string[];
  otherFeatures: string[];
  
  // Step 6
  modsAndExtras: Array<{
    type: 'modification' | 'extra';
    name: string;
    details?: string;
    source: string;
  }>;
  
  // Step 7 (conditional)
  fuelSpecific: {
    lpg?: {
      factory: boolean;
      installYear?: number;
      documented: boolean;
    };
    ev?: {
      batteryKwh?: number;
      chargingAC?: string;
      chargingDC?: string;
      range?: number;
      rangeStandard?: string;
      batteryWarranty?: string;
    };
  };
  
  // Step 8
  warranties: Array<{
    type: 'factory' | 'remaining' | 'extended';
    years?: number;
    km?: number;
    description?: string;
  }>;
  
  // Step 9
  transactionNotes: string;
  sellerProfile: string;
  
  // Step 10
  historyReport: {
    status: 'not_checked' | 'attached' | 'buyer_option' | 'seller_option';
    reportUrl?: string;
  };
  
  // Step 11
  generatedListing: string;
  sourceBadges: Record<string, 'confirmed' | 'seller' | 'photos' | 'reference'>;
}
```

## UI/UX Patterns

### AI Assistant
- Animated avatar (pulsing when "thinking")
- Speech bubbles with typing animation
- Contextual help and encouragement
- Error handling with friendly messages

### Question Cards
- Clean white cards with subtle shadows
- Single question per card (progressive disclosure)
- Visual feedback on selection
- Smooth transitions between questions

### Source Badges
- Color-coded badges:
  - 🟢 Confirmed (VIN verified)
  - 🔵 Seller (user input)
  - 🟡 Photos (AI detected)
  - ⚪ Reference (model data)

### Progress Indicator
- Visual progress bar at top
- Step numbers with checkmarks
- Current step highlighted
- Ability to jump back to previous steps

## Next Steps
1. Start with Phase 1: Core Infrastructure
2. Build reusable components first
3. Implement one step at a time
4. Test each step thoroughly before moving on
5. Add AI integration in final phases
