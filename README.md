# njil.dev

Personal site for me, my work, and random stuff :)

## Environment variables

Local secrets live in the 1Password Environment **njil.dev**, not in a committed or plaintext file.

1. In the 1Password desktop app, open **Developer → Environments → njil.dev**.
2. Under **Destinations**, add a **Local .env file** pointing at this repo's `.env`.
3. Run `pnpm dev` with 1Password unlocked. The `.env` is a named pipe that 1Password serves on read, so values are only available while the app is unlocked.

Don't create a `.dev.vars` file: if one exists, Wrangler and the Cloudflare adapter read it instead of `.env`.

[`.env.example`](.env.example) lists every variable name and notes where the CI and production copies live (GitHub Actions variables and secrets, and `wrangler secret put`).
