# Early Bird Turnstile release checklist

This feature is on a branch until keys are configured and testing is complete.

## Cloudflare
Create a separate Managed Turnstile widget for Early Bird. Add `daycare.rudie.org` as an authorized hostname, then add the permanent customer domain when ready.

## Vercel environment variables (Production, and Preview if testing there)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: public widget site key
- `TURNSTILE_SECRET_KEY`: **server-only**, private Siteverify secret
- `TURNSTILE_EXPECTED_HOSTNAME`: `daycare.rudie.org` (for preview deploys set the exact preview hostname and authorize it in Cloudflare)

Do not paste secrets into GitHub, client code, or chat. Redeploy after setting environment variables.

## Verification
The browser renders a managed challenge with action `contact`, then submits the token under `cf-turnstile-response`. The server POSTs token + secret to `https://challenges.cloudflare.com/turnstile/v0/siteverify`, checks `success`, `hostname`, and `action`, and sends email via Resend only on success. Failed, replayed, expired, missing, or unverified tokens are rejected. If the verification service or configuration is unavailable, submissions fail closed.

## Launch tests
1. Successful valid human form submission; verify the message arrives.
2. POST directly without token: HTTP 403, **no email**.
3. POST with an invalid or replayed token: HTTP 403, **no email**.
4. Change expected hostname or action: reject.
5. Test both languages and challenge expiration.
6. Confirm rate limiting is in place; Turnstile is not rate limiting.
7. Merge into main only after Cloudflare credentials, hostnames, and form delivery are validated.
