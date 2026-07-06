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
import { emailStyles } from './styles'
import { SITE_URL } from '@lib/resend'

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
		<Body style={emailStyles.body}>
			<Container style={emailStyles.container}>
				<Section>
					<Text style={emailStyles.preheader}>New post on njil.dev</Text>
					<Text style={{ ...emailStyles.heading, fontSize: '28px' }}>
						{title}
					</Text>
					<Text style={{ ...emailStyles.paragraph, marginBottom: '24px' }}>
						{description}
					</Text>
					<Button style={emailStyles.button} href={blogUrl}>
						Read the post →
					</Button>
				</Section>
				<Hr style={emailStyles.hr} />
				<Text style={{ ...emailStyles.footer, fontSize: '12px' }}>
					You're receiving this because you subscribed to my blog newsletter.
					<br />
					<Link href={SITE_URL} style={emailStyles.link}>
						njil.dev
					</Link>
				</Text>
			</Container>
		</Body>
	</Html>
)

export default NewBlogEmail
