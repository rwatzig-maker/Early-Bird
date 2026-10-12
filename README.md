# Early Bird Child Care — Website v1.1

Next.js 16 bilingual public website based on the original Early Bird demo.

## What's in v1.1
- Real Early Bird photos optimized to WebP (13 images; max 1920 pixels)
- Mobile-responsive homepage with playground hero, features, activities, gallery and four authentic review excerpts
- English / Spanish language switch (manual translations, no external translation API)
- 13-photo gallery with categories and lightbox
- Single announcement banner (currently static and always visible; editable toggle requires the Supabase admin phase)
- Inquiry form with Resend delivery route, disabled with clear user-facing error until `.env` values are set

## Run locally
```bash
npm install
npm run dev
```

## Contact form configuration
Copy `.env.example` to `.env.local`. Verify a sending domain in Resend and set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL`. Without them the form cannot send. Add rate limiting and Turnstile before public deployment to prevent spam. Do not collect children's personal information.

## Critical before public release
1. **Written photo permissions:** These are identifiable children. DO NOT publish any uploaded photos showing children until Letty has verified each child's guardian permission specifically for public website use. Remove/restrict any unapproved images.
2. Confirm displayed business hours, Saturday availability, license category and licensed maximum (16) with Letty. Hours displayed are based on consultation notes; older demo said 6:30 AM rather than 5:30 AM.
3. Confirm and obtain permission to reproduce Google review excerpts; consider using links to source reviews instead. Translations are illustrative editorial translations, not Google originals.
4. Verify phone number (consultation notes conflict with the old website).
5. Configure email sending and bot protection. Run E2E smoke checks on staging.

## Future paid-production stage (NOT included in v1.1)
- Dedicated per-client Supabase project, Storage bucket and admin auth with enforced MFA/RBAC/RLS
- Simple admin: hours editor, gallery editor enforcing maximum 40 photos with WebP optimization at upload, and editable/on-off bilingual announcement banner
- Database & Storage backups to Cloudflare R2, scheduled GitHub Actions, verified restore
- Migration scripts from temporary shared development project

Source photos are NOT committed to Git in the intended production workflow after admin uploads launch; content images should move to Supabase Storage. This v1.1 preview includes static optimized assets in `public/gallery/` only to simplify review.
