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
import { emailStyles } from './styles'
import { SITE_URL } from '@lib/resend'

export const WelcomeEmail = () => (
	<Html>
		<Head />
		<Body style={emailStyles.body}>
			<Container style={emailStyles.container}>
				<Section>
					<Text style={emailStyles.heading}>Hey there! 👋</Text>
					<Text style={emailStyles.paragraph}>
						Thanks for subscribing to my blog! I'm Nate, a senior frontend
						developer based in Toronto.
					</Text>
					<Text style={emailStyles.paragraph}>
						I write about web development, coding tips, and sometimes random
						thoughts. You'll get an email whenever I publish something new.
					</Text>
					<Text style={emailStyles.paragraph}>
						In the meantime, feel free to check out my latest posts:
					</Text>
					<Button
						style={{ ...emailStyles.button, marginTop: '8px' }}
						href={`${SITE_URL}/blog`}
					>
						Read the blog →
					</Button>
				</Section>
				<Hr style={emailStyles.hr} />
				<Text style={emailStyles.footer}>
					Cheers,
					<br />
					Nate
				</Text>
			</Container>
		</Body>
	</Html>
)

export default WelcomeEmail
