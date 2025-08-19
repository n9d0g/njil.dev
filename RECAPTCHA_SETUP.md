# reCAPTCHA Setup for Contact Form

This project uses Google reCAPTCHA v3 to protect the contact form from spam and abuse.

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Google reCAPTCHA
GOOGLE_RECAPTCHA_SITE_KEY=your_site_key_here
GOOGLE_RECAPTCHA_SECRET_KEY=your_secret_key_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

## Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose "reCAPTCHA v3"
4. Add your domain(s)
5. Accept the terms and submit
6. Copy the Site Key and Secret Key to your `.env` file

## How It Works

1. **Frontend**: The contact form loads reCAPTCHA v3 script and executes it when the form is submitted
2. **Token Generation**: reCAPTCHA generates a token based on user behavior
3. **Form Submission**: The token is sent along with the form data to the API
4. **Backend Verification**: The API verifies the token with Google's servers
5. **Email Sending**: If verification passes, the email is sent

## Features

- **Invisible**: Users don't need to solve puzzles
- **Score-based**: Google provides a score (0.0 to 1.0) based on user behavior
- **Automatic**: No user interaction required
- **Secure**: Server-side verification prevents token manipulation

## Testing

- Use the test keys provided by Google for development
- The form will automatically handle reCAPTCHA execution
- Check browser console for any errors during development

## Troubleshooting

- Ensure both environment variables are set
- Check that the domain is added to reCAPTCHA admin console
- Verify the API route is accessible at `/api/contact`
- Check browser console for JavaScript errors
