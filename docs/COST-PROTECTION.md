# Infrastructure cost protection
Prepared from audit d077806feecbf3d72b88b85c64df8ef88e780f90. No production billing or R2 lifecycle mutation.

## Ceilings
8 requests/IP/600 seconds; 500 admitted/day; 10,000 admitted/month; 100 email-attempt units/day; 1,000/month; 3 inquiries/recipient/day. Each inquiry reserves two email units, so 50 fully delivered inquiries/day and 500/month maximum. Failed sends retain reservations. UTC reservation periods; in-flight sends can finish after midnight.

Use only Vercel's x-vercel-forwarded-for: validate a single IP, normalize IPv6, reject malformed chains, no alternate header fallback. https://vercel.com/docs/headers/request-headers . Unit tests test spoofed alternatives; live edge spoof verification remains separate. Bare Node origins unsupported.

Invalid input is rejected before external calls. Redis state and atomic Lua gate downstream operations; unavailable/invalid quota backend fails closed. Rejected calls can still consume Redis and hosting usage: keep provider protection.

## Kill switches
CONTACT_DISABLED=true stops before external work. Previews send no email unless CONTACT_ALLOW_NON_PRODUCTION=true; prefer isolated test credentials.
SET earlybird:contact:disabled 1 via an authorized Redis console stops new admissions/reservations; in-flight sends can finish. Revoke compromised provider credentials and pause hosting for stronger incident stopping.

## Backups
Main only, deterministic daily UTC object pair, existing early-bird/ prefix, 32 MiB archive maximum, 10-minute timeout, concurrency, two SDK attempts. BACKUPS_DISABLED=true prevents future jobs. Cancel running jobs separately. Preserve existing 30-day R2 lifecycle rules; no lifecycle proposal applied/added.

## Billing and releases
Keep existing Vercel $20 on-demand budget and automatic pause. No paid service/payment method added. Owner reports no Upstash billing details; verify standalone Free versus Marketplace billing.
Next.js is pinned at stable 16.4.0 (same major), with its matching npm lockfile; upstream announced security fixes for October 14, 2026. Recheck the release and test an appropriate same-major patched upgrade before approving production. Announced is not released.

## Checks
npm ci --ignore-scripts --no-audit --no-fund
npm run test:security
npx tsc --noEmit
npm run build
Isolated Redis only: RUDIE_TEST_REDIS=1 python3 tests/cost-quotas.py (Python redis package required).
