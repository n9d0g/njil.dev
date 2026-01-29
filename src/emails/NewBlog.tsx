import {
	Html,
	Head,
	Body,
	Container,
	Section,
	Text,
	Button,
	Hr,
	Link,
} from '@react-email/components'
import React from 'react'

interface NewBlogEmailProps {
	title: string
	description: string
	blogUrl: string
}

export const NewBlogEmail = ({
	title,
	description,
	blogUrl,
}: NewBlogEmailProps) => (
	<Html>
		<Head />
		<Body style={styles.body}>
			<Container style={styles.container}>
				<Section>
					<Text style={styles.preheader}>New post on njil.dev</Text>
					<Text style={styles.heading}>{title}</Text>
					<Text style={styles.paragraph}>{description}</Text>
					<Button style={styles.button} href={blogUrl}>
						Read the post →
					</Button>
				</Section>
				<Hr style={styles.hr} />
				<Text style={styles.footer}>
					You're receiving this because you subscribed to my blog newsletter.
					<br />
					<Link href="https://njil.dev" style={styles.link}>
						njil.dev
					</Link>
				</Text>
			</Container>
		</Body>
	</Html>
)

const styles = {
	body: {
		backgroundColor: '#0f172a',
		fontFamily:
			"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		padding: '40px 20px',
		margin: 0,
	},
	container: {
		maxWidth: '600px',
		margin: '0 auto',
	},
	preheader: {
		color: '#64748b',
		fontSize: '14px',
		marginBottom: '20px',
	},
	heading: {
		color: '#f8fafc',
		fontSize: '28px',
		marginBottom: '16px',
	},
	paragraph: {
		color: '#cbd5e1',
		fontSize: '16px',
		lineHeight: '1.6',
		marginBottom: '24px',
	},
	button: {
		backgroundColor: '#334155',
		color: '#f8fafc',
		padding: '12px 24px',
		textDecoration: 'none',
		borderRadius: '8px',
		display: 'inline-block',
	},
	hr: {
		borderColor: '#334155',
		marginTop: '40px',
		marginBottom: '20px',
	},
	footer: {
		color: '#475569',
		fontSize: '12px',
	},
	link: {
		color: '#64748b',
	},
}

export default NewBlogEmail
