# OpenSAM assisted research pilot

## Product and delivery

Sell a scoped research pilot: agree the client's NAICS, title keywords and review criteria; configure a private instance; deliver a shortlist for human review and record limitations. Price, cadence and number of reviews are agreed in writing. No automated bids, award guarantees, eligibility determination, subscriptions or payment processing are implemented. The UI opens an email draft to request a pilot; verify that mailbox before launch.

The first page of up to 25 notices posted in the last 30 days is fetched, then records explicitly active are shown. A lack of results is not a complete absence of opportunities. Score is transparent: matching NAICS adds 50; each distinct capability substring in the notice title adds 10 (up to 50). It does not read attachments, fetch description URLs or verify certifications. The existing SDK's separate scoring API is unchanged.

Provider contract reference: https://open.gsa.gov/api/get-opportunities-public-api/ — title, ncode, postedFrom/postedTo, limit and offset. The pilot uses only this fixed upstream host and never follows redirects.

## Run privately

1. Install with `npm ci`; build with `npm run build`; test with `npm run test:pilot` and the package tests.
2. Set SAM_GOV_API_KEY in the server process environment (from your secret manager). Generate a random OPENSAM_ACCESS_TOKEN with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and configure it separately. Do not commit secrets. The example file is documentation; the server does not load it automatically.
3. Run `npm run start:pilot`. Default bind is 127.0.0.1:3001. For development also run `npm run dev`; Vite proxies /api to the server. For deployment serve the built app and API through this Node process behind an HTTPS reverse proxy; configure HOST only if required by the platform.
4. Give the pilot access code to authorized participants securely. It is distinct from the provider API key, transmitted as a bearer header and held only in React memory. Refreshing clears it. No user accounts or per-user audit trail exist.
5. Test a real authorized query in staging, then verify the generated bundle contains neither secret. There were no real credentials available during this change; mocked provider tests do not establish live API access.

## Limits and operations

Fail closed without both server secrets and a 32-character-minimum access code. One upstream call at a time, 15-second timeout, no retries; at most 30 attempts per rolling daily process window. Failed upstream attempts also consume quota. State is in memory and resets on restart: use one process for a private pilot; do not use multiple replicas or advertise durable tenant quotas. For public/multi-user service add identity, persistent per-user/provider quotas, audit controls and revocation before launch. Provider quotas depend on the account.

Only normalized display fields and a canonical sam.gov link are returned. Upstream URLs, errors, credentials, description links and contact arrays are not forwarded. No access/request body logging is implemented. Configure the reverse proxy to avoid Authorization/header logging, require HTTPS and apply request limits/timeouts. There is no CORS opt-in.

## Previous frontend exposure

The old UI read a Vite-prefixed provider key, which would embed an actual configured value in public bundles. This change removes that path. If any earlier deployment used a real key, revoke/rotate it in the provider account and remove old bundles/source maps from hosting and CDN caches. This cannot revoke an already exposed key or prove whether a prior deployment had one. No production secrets or deployments were accessed or changed.
