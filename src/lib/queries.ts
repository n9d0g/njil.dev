import { defineQuery } from 'groq'

export const blogListQuery = defineQuery(`*[
	_type == "blog"
	&& defined(slug.current)
]|order(publishedAt desc)[0...12]{
	_id,
	title,
	slug,
	publishedAt,
	description,
	tags[]->{ name, slug },
	coverImage{ asset->{ url } },
	images[]{ asset->{ url } }[0...1]
}`)

export const blogSlugsQuery = defineQuery(`*[_type == "blog" && defined(slug.current)]{
	"params": {"blog": slug.current}
}`)

export const blogBySlugQuery = defineQuery(`*[_type == "blog" && slug.current == $slug][0]{
	title,
	author,
	publishedAt,
	description,
	tags[]->{ name, slug },
	images[]{ asset->{ url }, alt },
	body[]{
		...,
		_type == "image" => { asset->{ url }, alt, caption },
		_type == "code" => { language, code, filename }
	}
}`)

export const subscriberByEmailQuery = defineQuery(
	`*[_type == "subscriber" && email == $email][0]`
)

export const activeSubscribersQuery = defineQuery(
	`*[_type == "subscriber" && active == true]{ email, active }`
)
