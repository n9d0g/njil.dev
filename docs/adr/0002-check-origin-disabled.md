# Astro's checkOrigin is disabled; endpoints authenticate themselves

Newsletter emails carry RFC 8058 one-click unsubscribe (`List-Unsubscribe-Post`), which mail providers send as a cross-site form POST to `/api/unsubscribe`. Astro's `security.checkOrigin` rejects those with a 403 and can't be relaxed per route, so it is turned off site-wide. Every state-changing endpoint checks its own credential instead: reCAPTCHA on `/api/subscribe`, Sanity's HMAC signature on `/api/webhook/new-blog`, and an HMAC token on `/api/unsubscribe`. Any new endpoint that accepts POSTs must do the same.
