import { sanityClient } from 'sanity:client'
import { createBlog } from './index'

// Blog posts are public: read through the token-free sanity:client (Sanity's
// CDN). The Newsletter writes Subscribers through the token client in @lib/sanity.
export const blog = createBlog(sanityClient)
