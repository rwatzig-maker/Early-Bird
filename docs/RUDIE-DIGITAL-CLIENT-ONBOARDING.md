# Rudie Digital — Standard Client Website Onboarding
Status: reusable operating checklist. Update for every customer and record who verified each check and when.

## Contract and client setup
- [ ] Signed agreement; setup payments; monthly service start at go-live; client-owned domain and content
- [ ] Confirm business facts, logo rights, photography/children's image consent, contact details, bilingual copy and rates
- [ ] Define included update scope, accessibility expectations, termination/export and support channels
- [ ] Create client entry in Rudie Digital admin; track recurring revenue and allocated infrastructure costs

## Domain, hosting and launch
- [ ] Register domain in client's name; record registrar, renewal and recovery ownership
- [ ] Configure authoritative DNS, apex to www redirect, HTTPS, canonical URL, favicon, metadata, robots/sitemap
- [ ] Protect existing MX/forwarding/TXT during DNS changes; test apex, www, mobile and redirects
- [ ] Add GA4 and Search Console; ensure privacy disclosure and event/UTM tracking as appropriate

## Forms / transactional email — mandatory baseline
- [ ] Minimal form data only; clear notice not to include sensitive child/patient/customer details
- [ ] Hidden honeypot field, **server-side checked before provider calls**; silently discard obvious bot submissions
- [ ] Cloudflare Turnstile Managed + interaction-only display, with **mandatory server-side Siteverify**
- [ ] Siteverify checks success, exact approved production hostname(s), expected action, token expiration/single use; fail closed
- [ ] Distributed per-IP API rate limiting using shared storage (not an in-memory Vercel counter); choose documented limit and test 429/Retry-After
- [ ] Fail closed if security configuration or rate-limit store unavailable; log faults without exposing secrets or inquiry contents
- [ ] Validate/sanitize lengths, email and select values; enforce allowed methods/content type and request-body size
- [ ] Resend account/domain verification with DKIM/SPF and DMARC review; dedicated sending-only API key stored in Vercel
- [ ] Separate incoming forwarding MX from outbound sending-subdomain records
- [ ] Send contact form to stable business alias and verify alias forwarding; use Reply-To for customer email
- [ ] Test legitimate English and Spanish submissions, inbox/spam arrival, malformed/missing/replayed tokens, honeypot, rate-limit, error states
- [ ] Confirm final recipient after testing; change forwarding target and retest

## Access/security baseline
- [ ] Least-privileged service accounts; unique API keys, no secrets in GitHub; recovery codes in password manager/offline
- [ ] Admin portals only if client needs them: RBAC, Google SSO/appropriate auth, mandatory MFA, short sessions, server-side authorization, RLS
- [ ] Configure appropriate security headers, dependency updates and server error handling; audit logs and abuse alerting
- [ ] Review exposure of children’s personal data and images, consent and retention

## Backup, recovery and monitoring
- [ ] Offsite Cloudflare R2 archive of site source and deployed media; separately include originals/assets not committed to repository
- [ ] Automatic daily schedule, encrypted transport, least-privilege R2 key, retention policy and failure notifications
- [ ] Verify first successful backup object and checksum; **perform test restore** before declaring backups operational
- [ ] Configure uptime, SSL, DNS/domain-expiration checks and form-delivery monitoring
- [ ] Document restoration steps, credentials ownership, alert owner and recovery targets

## Early Bird implementation state (2026-10-13)
- [x] Squarespace domain registered; www and apex configured at Vercel, SSL initially provisioning
- [x] Squarespace info@ forwarding tested to Rudie Gmail; recipient switch to Letty pending
- [x] Resend sending-subdomain verified; Vercel sending keys and email env vars set by owner
- [x] Turnstile Siteverify code on main; interaction-only widget; full production tests still required
- [x] Honeypot code on main
- [ ] **Distributed rate limiting staged** on feature/contact-rate-limit; requires Redis URL, token and salt; not yet deployed
- [ ] Confirm real live form delivery, invalid/replay token rejection, tests from final hostname
- [ ] Verify R2 backups, including original media, retention, alerts and restore; backup workflow staged separately, not live
- [ ] Redirect daycare.rudie.org only after complete production verification

## Automation roadmap
1. Add client-onboarding template to /rudieadmin with evidence, dates and owner; store service configuration metadata, never secrets.
2. Automate domain/SSL/Resend/Turnstile/backup/uptime checks and flag missing records.
3. Generate and review per-client onboarding GitHub issues and test reports.
4. Automate provisioning only after provider accounts/permissions, audit trails and rollback procedures are established.

Rate-limit defaults in staged Early Bird implementation: 8 requests per source IP per rolling-from-first-hit 600-second window. Shared Upstash Redis REST credentials (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN), plus RATE_LIMIT_IP_SALT, are required; unavailable backend causes 503. Verify trusted client-IP header behavior on Vercel before enabling.
