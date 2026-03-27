# Supabase Storage Setup Guide

## Overview

Product images are stored in Supabase Storage, organized by Stripe product ID. This provides a scalable, CDN-backed solution for managing product images.

## Folder Structure

```
products/                          (Storage Bucket)
├── prod_ABC123/                   (Stripe Product ID)
│   ├── image-0.png               (Primary image)
│   ├── image-1.png               (Additional image)
│   ├── image-2.png               (Additional image)
│   └── ...
├── prod_XYZ789/
│   ├── image-0.jpg
│   └── image-1.jpg
└── ...
```

## Setup Steps

### 1. Create Storage Bucket

1. **Go to Supabase Dashboard**:
   - Navigate to your project
   - Go to **Storage** in the left sidebar

2. **Create New Bucket**:
   - Click **"New bucket"**
   - Name: `products`
   - Public bucket: **✓ Yes** (images need to be publicly accessible)
   - Click **"Create bucket"**

### 2. Configure Bucket Policies

After creating the bucket, set up the access policies:

```sql
-- Allow public read access to all files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'products' );

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' );
```

Or use the Supabase Dashboard:
1. Click on the `products` bucket
2. Go to **Policies** tab
3. Add policies for SELECT (public), INSERT/UPDATE/DELETE (authenticated)

### 3. Configure CORS (if needed)

If you're uploading from a different domain, configure CORS:

1. In Supabase Dashboard → **Storage**
2. Click on **Settings** (gear icon)
3. Add your domain to allowed origins

### 4. Test Storage Access

Run this test in your browser console while logged into your app:

```javascript
// Test bucket access
const { data, error } = await supabase.storage
  .from('products')
  .list('', { limit: 1 });

console.log('Bucket accessible:', !error);
```

## Usage

### Admin: Upload Product Images

1. **Via Admin Dashboard**:
   - Go to `/dashboard/admin/products/new`
   - Fill out product form
   - Click "Upload files" in the Product Images section
   - Select up to 5 images
   - Preview images before submitting
   - Submit form - images are automatically uploaded to Storage

2. **Via Code**:
   ```javascript
   import { uploadProductImage } from '@/lib/supabase/storage';

   // Upload a single image
   const result = await uploadProductImage(
     'prod_ABC123',  // Stripe product ID
     imageFile,       // File object
     0               // Image index
   );

   console.log(result.url);  // Public URL
   ```

### Customer: View Product Images

Images are automatically fetched and displayed:

1. **Products Page** (`/products`):
   - API fetches products from Stripe
   - For each product, fetches images from Storage
   - Falls back to Stripe images if none in Storage
   - Displays in ProductCard component

2. **Image Loading Priority**:
   - Primary: Supabase Storage (organized by product ID)
   - Fallback: Stripe product images
   - Default: Placeholder image

## File Naming Convention

Images are automatically named when uploaded:
- `image-0.{ext}` - Primary/main product image
- `image-1.{ext}` - Second image
- `image-2.{ext}` - Third image
- etc.

File extensions are preserved from original files (.png, .jpg, .jpeg, .gif, .webp)

## API Integration

### Fetch Product Images

The `/api/products` endpoint automatically fetches images:

```javascript
// Automatic in products API
const { data: files } = await supabase.storage
  .from('products')
  .list(productId, {
    limit: 10,
    sortBy: { column: 'name', order: 'asc' },
  });

// Convert to public URLs
const images = files.map((file) => {
  const { data: urlData } = supabase.storage
    .from('products')
    .getPublicUrl(`${productId}/${file.name}`);
  return urlData.publicUrl;
});
```

### Upload Images (Admin Only)

```javascript
// In admin product form
const response = await fetch("/api/admin/products", {
  method: "POST",
  body: JSON.stringify({ /* product data */ }),
});

const { product } = await response.json();

// Upload images after product creation
await Promise.all(
  images.map((image, index) =>
    uploadProductImage(product.id, image, index)
  )
);
```

## Storage Limits

### Default Limits (Supabase Free Tier):
- **Storage**: 1 GB
- **Transfer**: 2 GB/month
- **File size**: 50 MB per file

### Recommended Image Sizes:
- Product images: 1000x1000px (1:1 ratio)
- File size: < 500 KB per image (optimized)
- Format: WebP recommended, JPG/PNG acceptable
- Total: ~5 images per product

### Pro Tier (if needed):
- **Storage**: 100 GB
- **Transfer**: 200 GB/month
- **File size**: 5 GB per file

## Image Optimization Tips

### Before Upload:
1. **Resize** images to 1000x1000px or smaller
2. **Compress** using tools like:
   - TinyPNG (https://tinypng.com)
   - ImageOptim (Mac)
   - Squoosh (https://squoosh.app)
3. **Convert to WebP** for better compression
4. Target: < 200 KB per image

### Future Enhancement:
Consider adding automatic image optimization:
```javascript
// Could add to uploadProductImage function
import sharp from 'sharp';

async function optimizeImage(file) {
  const buffer = await file.arrayBuffer();
  return sharp(buffer)
    .resize(1000, 1000, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();
}
```

## Managing Images

### View All Images for a Product

```javascript
import { getProductImages } from '@/lib/supabase/storage';

const images = await getProductImages('prod_ABC123');
console.log(images); // Array of public URLs
```

### Delete Product Images

```javascript
import { deleteAllProductImages } from '@/lib/supabase/storage';

// Delete all images when product is deleted
await deleteAllProductImages('prod_ABC123');
```

### Replace/Update Images

Images are uploaded with `upsert: true`, so uploading to the same path replaces the existing image:

```javascript
// This will replace image-0.png if it exists
await uploadProductImage('prod_ABC123', newImageFile, 0);
```

## Troubleshooting

### Images Not Displaying

1. **Check bucket exists**:
   ```javascript
   const { data, error } = await supabase.storage.listBuckets();
   console.log('Buckets:', data);
   ```

2. **Check bucket is public**:
   - Supabase Dashboard → Storage → products → Settings
   - Verify "Public bucket" is enabled

3. **Check file paths**:
   ```javascript
   const { data: files } = await supabase.storage
     .from('products')
     .list('prod_ABC123');
   console.log('Files:', files);
   ```

4. **Check public URLs**:
   ```javascript
   const { data } = supabase.storage
     .from('products')
     .getPublicUrl('prod_ABC123/image-0.png');
   console.log('URL:', data.publicUrl);
   ```

### Upload Failing

1. **Check authentication**:
   - User must be logged in as admin
   - Verify auth token is valid

2. **Check file size**:
   - Must be < 50 MB (free tier)
   - Optimize large images before upload

3. **Check bucket policies**:
   - Verify INSERT policy allows authenticated users

4. **Check CORS**:
   - If uploading from different domain, configure CORS

### Slow Image Loading

1. **Enable CDN caching**:
   - Supabase Storage uses CDN by default
   - Set appropriate cache headers

2. **Optimize images**:
   - Reduce file sizes
   - Use WebP format
   - Resize to appropriate dimensions

3. **Lazy loading**:
   - Already implemented in Next.js Image component
   - Images load as user scrolls

## Security Notes

1. **Public Access**: Images are publicly accessible by design (products need to be visible)
2. **Upload Restrictions**: Only authenticated admin users can upload
3. **Path Restrictions**: Files are organized by product ID - cannot access other folders
4. **No Sensitive Data**: Never store sensitive information in product images

## Backup Strategy

### Manual Backup:
```bash
# Download all products images
supabase storage download --all --bucket products
```

### Automated Backup:
Consider setting up periodic backups:
1. Use Supabase CLI
2. Store backups in separate location (S3, etc.)
3. Run daily/weekly cron job

## Migration from Existing Images

If you have existing product images to migrate:

1. **Organize by Product ID**:
   ```bash
   products/
   ├── prod_ABC123/
   │   └── image-0.jpg
   ├── prod_DEF456/
   │   └── image-0.jpg
   ```

2. **Bulk Upload**:
   ```bash
   # Using Supabase CLI
   supabase storage upload products/prod_ABC123 ./local/path/to/images/
   ```

3. **Or via Script**:
   ```javascript
   // scripts/migrate-images.js
   const products = ['prod_ABC123', 'prod_DEF456'];

   for (const productId of products) {
     const imagePath = `./images/${productId}/image-0.jpg`;
     const file = await fs.readFile(imagePath);
     await uploadProductImage(productId, file, 0);
   }
   ```

## Environment Variables

No additional environment variables needed! The Supabase client automatically uses:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are already in your `.env.local` and Vercel environment.

## Vercel Deployment

When deploying to Vercel, ensure environment variables are set:

1. **Vercel Dashboard** → Your Project → Settings → Environment Variables
2. Add all env vars from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. Redeploy after adding variables

## Testing Checklist

- [ ] Storage bucket created and public
- [ ] Policies configured correctly
- [ ] Can upload images via admin form
- [ ] Images display on products page
- [ ] Multiple images per product work
- [ ] Image deletion works
- [ ] Public URLs are accessible
- [ ] Works on Vercel deployment

## Support

For Supabase Storage issues:
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Discord](https://discord.supabase.com)
- Check browser console for errors
- Check Supabase Dashboard → Storage → Logs
