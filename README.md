# Early Bird Child Care — v1.4.1 Visual Identity Update

This is a **local, no-push upgrade package** for the **existing** `rwatzig-maker/Early-Bird` Next.js project. It keeps the complete bilingual site, gallery, contact form, reviews, existing metadata, and the current backend intact.

## Install (Windows PowerShell)

1. Unzip the package anywhere, e.g. `Downloads/early-bird-v1.4.1`.
2. Open a terminal in your **existing Early-Bird repository root**, the folder containing `package.json` and `app/`.
3. Run the installer with the full path to the unpacked script, for example:

   ```powershell
   py "$HOME\Downloads\early-bird-v1.4.1\apply_v141.py"
   ```

4. Check the result:

   ```powershell
   git diff --check
   npm run build
   npm run dev
   ```

5. Verify desktop and mobile, switch English/Spanish, test CTAs and the contact form, then:

   ```powershell
   git add app/page.tsx app/globals.css
   git commit -m "Early Bird v1.4.1 editorial visual refresh"
   git push origin main
   ```

The installer modifies `app/page.tsx` and appends the v1.4.1 CSS to `app/globals.css`. It first validates known HTML patterns and refuses to run if the changes appear already applied. It creates `app/page.tsx.v140.bak` and `app/globals.css.v140.bak` locally; **don't commit backups**.

## What changed

- Cream editorial hero card over the existing real playground photo, with contrasting typography and trust chips.
- Small separate brand message card on desktop.
- Editorial Letty portrait framing (her biography and all existing editorial content are preserved).
- Bilingual invitation-to-visit CTA immediately before the existing contact form.
- Clearer section rhythm, restrained warm color accents and mobile breakpoints.

## Important

This package is based on the current **main branch** markup and assumes the unmodified v1.4 structure. If your local branch differs, the installer will stop rather than overwrite unrecognized markup. Nothing is uploaded or deployed automatically. The Cloudflare Turnstile feature branch remains separate and untouched.
