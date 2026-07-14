# Cloudinary Setup

## Create Account

1. Create a Cloudinary account.
2. Open Dashboard.
3. Copy cloud name, API key, and API secret.

## Vercel Environment Variables

```env
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Folder Structure

Khoya Paya uploads to:

- `khoya-paya/items`
- `khoya-paya/finder-photos`

## Upload Restrictions

- JPG, JPEG, PNG, WEBP only.
- Max file size: 5MB.
- MIME type and extension are validated.
- Cloudinary secret stays server-side.

## Test

1. Login.
2. Add item.
3. Upload item image.
4. Open public finder page.
5. Upload finder photo.
6. Confirm images render in dashboard.
