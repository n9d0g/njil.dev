# reCAPTCHA is rendered fresh on every page

Page transitions (`<ClientRouter />`) swap out `<body>` on each navigation. reCAPTCHA v3 loaded the usual way (`api.js?render=<site key>`) puts its iframe in `<body>`, so after the first navigation it's gone and `grecaptcha.execute` hangs. Instead, reCAPTCHA is loaded once with `render=explicit`, and an invisible widget is rendered on every `astro:page-load`; the forms ask the latest one for a token.

We considered rendering one widget into a `transition:persist` container. Astro only keeps a persisted iframe alive where the browser supports `moveBefore`; elsewhere it falls back to `replaceWith`, which reloads the iframe, and we couldn't confirm reCAPTCHA survives that. A widget per page costs one small iframe per view and leaves stale entries in reCAPTCHA's own config, but behaves the same in every browser.
