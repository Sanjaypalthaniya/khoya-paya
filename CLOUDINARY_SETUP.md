# Cloudinary setup

Create separate staging/production credentials and restrict them to the application. Configure the three Cloudinary variables. Uploads are performed server-side into `khoya-paya/items`, `finder-photos`, and `community` folders. MIME, extension, signature, size, ownership, and moderation gates remain mandatory. Test upload, transformation, replacement, authorized delete, failure, timeout, and orphan cleanup with staging credentials.
