// One-off: marks every existing Blog post (published and draft) as already
// announced, so editing an old post doesn't email every Subscriber.
// Run before deploying the Announcement-once change:
//   cd cms && pnpm exec sanity exec scripts/backfill-announced-at.ts --with-user-token
// Append `-- --dry-run` to list the posts without patching them.
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01', perspective: 'raw' })
const dryRun = process.argv.includes('--dry-run')

const posts = await client.fetch<
	{ _id: string; title?: string; publishedAt?: string; _updatedAt: string }[]
>(
	`*[_type == "blog" && !defined(announcedAt)]{ _id, title, publishedAt, _updatedAt }`
)

console.log(`${posts.length} Blog post(s) without announcedAt`)
for (const post of posts) {
	console.log(`  ${post._id}  ${post.title ?? '(untitled)'}`)
}

if (!dryRun && posts.length) {
	const transaction = client.transaction()
	for (const post of posts) {
		transaction.patch(post._id, (patch) =>
			patch.set({ announcedAt: post.publishedAt ?? post._updatedAt })
		)
	}
	await transaction.commit()
	console.log('Done.')
}
