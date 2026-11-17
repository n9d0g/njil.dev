# Versions are released by the main deploy, not by release PRs

Every change reaching `main` needed a second, hand-merged release-please PR (which never ran CI, since GitHub doesn't run workflows for PRs the built-in token opens) and a second deploy just so the footer showed the new version. We release in the deploy instead, as nhf-worship does: a push to `main` bumps the last `v*` tag as its conventional commits ask (`scripts/next-version.ts`, the same rules release-please had), builds with that version in `package.json`, and once `wrangler deploy` succeeds creates the GitHub Release on the deployed commit and pushes a `chore: release x.y.z` commit bumping `package.json` on `main`. Tags are the counter and `package.json` mirrors them, so a failed deploy or a lost bump push never leaves a version that wasn't live. `CHANGELOG.md` is gone; the GitHub Releases page is the changelog.

PRs into `dev` and `main` run CI (`ci.yml`), and branch protection on `dev` requires its `check` job, so a PR into `dev` with auto-merge turned on merges as soon as it's green. `main` isn't protected: a required status check also rejects direct pushes, which would block the bump commit, and the `dev` → `main` PR is merged by hand anyway. Auto-merge is turned on per PR by whoever opens it (`gh pr merge --auto --squash`, or the Claude app's toggle), not by a workflow: a merge the built-in token makes doesn't trigger the deploy. `dev` is the holding area before production.

## Considered options

- **Keep release-please and auto-merge its PR** with a personal access token, so the merge still triggers the deploy and the tag: a token to rotate, and still two deploys and two Discord messages per change.
- **Bump the version in the feature PR** (a hook or a PR job): the squash title doesn't exist yet, and PRs open at the same time would claim the same version.
- **A workflow that turns on auto-merge for every PR** with a personal access token: fully hands-off, but another token to rotate for something one command does.

## Consequences

The deploy job has `contents: write`. Pushes and releases made with the built-in token don't trigger workflows, which is what stops the bump commit deploying again. `main` gets a bot commit after each release; PRs never touch the `version` line, so this doesn't conflict, and `dev`'s `package.json` simply lags. `dev` deploys never release and build with the last released version, so both footers stay right.
