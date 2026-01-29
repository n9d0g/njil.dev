import {
	Html,
	Head,
	Body,
	Container,
	Section,
	Text,
	Button,
	Hr,
} from '@react-email/components'
import React from 'react'

interface WelcomeEmailProps {
	email?: string
}

export const WelcomeEmail = ({ email }: WelcomeEmailProps) => (
	<Html>
		<Head />
		<Body style={styles.body}>
			<Container style={styles.container}>
				<Section>
					<Text style={styles.heading}>Hey there! 👋</Text>
					<Text style={styles.paragraph}>
						Thanks for subscribing to my blog! I'm Nate, a senior frontend
						developer based in Toronto.
					</Text>
					<Text style={styles.paragraph}>
						I write about web development, coding tips, and sometimes random
						thoughts. You'll get an email whenever I publish something new.
					</Text>
					<Text style={styles.paragraph}>
						In the meantime, feel free to check out my latest posts:
					</Text>
					<Button style={styles.button} href="https://njil.dev/blog">
						Read the blog →
					</Button>
				</Section>
				<Hr style={styles.hr} />
				<Text style={styles.footer}>
					Cheers,
					<br />
					Nate
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
	heading: {
		color: '#f8fafc',
		fontSize: '24px',
		marginBottom: '20px',
	},
	paragraph: {
		color: '#cbd5e1',
		fontSize: '16px',
		lineHeight: '1.6',
		marginBottom: '16px',
	},
	button: {
		backgroundColor: '#334155',
		color: '#f8fafc',
		padding: '12px 24px',
		textDecoration: 'none',
		borderRadius: '8px',
		display: 'inline-block',
		marginTop: '8px',
	},
	hr: {
		borderColor: '#334155',
		marginTop: '40px',
		marginBottom: '20px',
	},
	footer: {
		color: '#64748b',
		fontSize: '14px',
	},
}

export default WelcomeEmail
