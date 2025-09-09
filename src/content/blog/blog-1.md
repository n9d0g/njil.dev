---
title: 'My First Markdown Blog'
author: 'Nathan Lardizabal'
slug: 'first-markdown-blog'
published: 2023-09-14
description: 'Creating my first markdown blog - Nathan Lardizabal'
tags: ['markdown', 'blogging', 'astro']
draft: true
---

i've always wondered what markdown files were so good for 🤔 other than updating some `README.md` files,
i've never had to use them in my day job -- but it seems like so many people use markdown **all the time** so i had to see what all the hype was about.

creating this portfolio site was the first time i experienced the full capacity of markdown files.

this is super useful for me when trying to write documentation for UI libraries, how to implement them, props, etc etc. I also recently found out that you’re able to show specific languages through a code snippet by adding the language to the first line:

````
```js
javascript content here
```
````

believe it or not, i tried to write code snippets using `<pre>` or `<code>` tags and hoping that it would format nicely once rendered 😮‍💨 good thing i found out about the niceties of markdown before going down that path!

in this portfolio site, i’m using markdown files to also gather “frontmatter” which contains info like tags, author, date, slug, start date, end date — all in the top part of the markdown enclosed with the — separator:

```md
---
title: 'My First Markdown Blog'
author: 'Nathan Lardizabal'
slug: 'first-markdown-blog'
published: 2023-09-14
description: 'Creating my first markdown blog - Nathan Lardizabal'
tags: ['markdown', 'blogging', 'astro']
draft: true
---
```

This allows me to store all the markdown files in an astro glob collection, creating links on my `/blog` page and dynamically creating the subpages with the slug property!

in my experience at work and in other side projects, using JSON was enough. But the issue with JSON is that it doesn’t check for types -- whereas markdown allows me to catch those type errors before i even see the output! super useful stuff.

one problem i came across was trying to style every single h1, h2, link, etc. because i’ve mostly been styling my markup with tailwindcss — and i’m unable to use tailwind in a `.md` file. through some quick searches, i found that i’m able to use a tailwind markdown template plugin which can be imported into your config like this:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  ...,
  plugins: [require('@tailwindcss/typography')],
}
```

which automatically formats your markdown to look nice when you wrap your `<Content>` like this:

```js
<article class="prose dark:prose-invert">
	<div class="my-8 font-light">
		<Content />
	</div>
</article>
```

while i do wish i had more control over the specific styling of the markdown markup (lol down up), i’m more than content with how this template formats my markdown.

i have still yet to cross markdown files other than READMEs in a professional setting, but i believe the sky is the limit with markdown files.

hopefully i shed some light on how beneficial markdown files are to you as well! if not, then thanks for reading anyway :)
