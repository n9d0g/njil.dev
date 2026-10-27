import { Html, Head, Body, Container, Section, Text, Hr } from 'react-email'
import { emailStyles } from './styles'

interface ContactEmailProps {
	name?: string
	email: string
	message: string
}

export const ContactEmail = ({ name, email, message }: ContactEmailProps) => (
	<Html>
		<Head />
		<Body style={emailStyles.body}>
			<Container style={emailStyles.container}>
				<Section>
					<Text style={emailStyles.heading}>New Contact message</Text>
					<Text style={emailStyles.preheader}>
						From {name ? `${name} <${email}>` : email}. Reply to this email to
						answer.
					</Text>
				</Section>
				<Hr style={emailStyles.hr} />
				<Text style={{ ...emailStyles.paragraph, whiteSpace: 'pre-wrap' }}>
					{message}
				</Text>
			</Container>
		</Body>
	</Html>
)

export default ContactEmail
