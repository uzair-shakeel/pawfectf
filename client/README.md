This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev 
# or
yarn dev 
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

### Photo Enhancer

The Photo Enhancer tool provides advanced image editing capabilities, including:

- Basic adjustments (brightness, contrast, saturation, etc.)
- Professional filter presets optimized for car photography
- Image cropping with aspect ratio control
- Background removal functionality using the powerful @imgly/background-removal library
  - Works entirely client-side with no API keys required
  - Optimized for car images and other objects
  - High-quality results with transparent backgrounds
- Specialized car background removal
  - Edge detection algorithm specifically optimized for vehicles
  - Automatically detects and removes common car photo backgrounds
  - Better results for automotive photography
- Background color customization
  - Add solid color backgrounds to images after background removal
  - Choose from preset colors or use a custom color picker
  - Keep transparency when desired

## Photo Enhancer Integration

The application includes a photo enhancer feature that allows users to edit car images during the listing creation process. The integration works as follows:

### Features

- Edit images directly from the car listing form
- Advanced image editing capabilities including:
  - Brightness, contrast, and saturation adjustments
  - Auto-enhance feature
  - Background removal
  - License plate blurring
  - Crop and transform tools

### Technical Implementation

1. **Image Editing Flow**:

   - Users can click the edit button on an image in the car form
   - The photo enhancer opens with the selected image
   - After editing, users click "Save & Return" to save changes
   - The edited image appears back in the car form

2. **Data Flow**:

   - Edited images are saved to the server's filesystem in the `/public/temp` directory
   - The file path is stored in localStorage along with a timestamp and image index
   - When returning to the car form, the component checks localStorage for edited images
   - If found, the edited image replaces the original in the form

3. **Key Components**:
   - `/api/save-edited-image/route.js`: API endpoint for saving edited images
   - `/app/dashboard/photo-enhancer/page.jsx`: Photo enhancer UI with editing tools
   - `components/dashboard/createsteps/StepOne.tsx`: Car form component with image handling
   - `components/dashboard/createsteps/ImageEditStep.tsx`: Image editing step with advanced editor access

### Usage

1. Upload images in the car listing form
2. Click the edit (pencil) icon on any image
3. Use the photo enhancer tools to edit the image
4. Click "Save & Return" to apply changes
5. Continue with the car listing process

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
