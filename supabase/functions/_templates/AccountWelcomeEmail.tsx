import React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from 'npm:@react-email/components@0.0.22'

interface AccountWelcomeEmailProps {
  firstName: string
  lastName: string
  email: string
  verificationUrl?: string
  loginUrl: string
  supportEmail: string
}

export const AccountWelcomeEmail = ({
  firstName,
  lastName,
  email,
  verificationUrl,
  loginUrl,
  supportEmail,
}: AccountWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Performance Management - Verify your account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Welcome to Performance Management!</Heading>
        </Section>

        <Section style={content}>
          <Text style={text}>
            Hi {firstName},
          </Text>
          
          <Text style={text}>
            Welcome to our Performance Management platform! We're excited to have you join us.
            Your account has been created with the email address <strong>{email}</strong>.
          </Text>

          {verificationUrl && (
            <>
              <Text style={text}>
                To get started, please verify your email address by clicking the button below:
              </Text>
              
              <Section style={buttonContainer}>
                <Button style={button} href={verificationUrl}>
                  Verify Email Address
                </Button>
              </Section>
              
              <Text style={smallText}>
                If the button doesn't work, you can copy and paste this link into your browser:
                <br />
                <Link href={verificationUrl} style={link}>
                  {verificationUrl}
                </Link>
              </Text>
            </>
          )}

          <Text style={text}>
            Once your email is verified, you can sign in to your account and start:
          </Text>

          <ul style={list}>
            <li style={listItem}>Setting up your organization</li>
            <li style={listItem}>Adding team members</li>
            <li style={listItem}>Creating performance goals</li>
            <li style={listItem}>Managing appraisals</li>
          </ul>

          <Section style={buttonContainer}>
            <Button style={secondaryButton} href={loginUrl}>
              Sign In to Your Account
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={smallText}>
            Need help getting started? Our support team is here to help.
            <br />
            Contact us at{' '}
            <Link href={`mailto:${supportEmail}`} style={link}>
              {supportEmail}
            </Link>
          </Text>

          <Text style={smallText}>
            This email was sent to {email}. If you didn't create an account with us, 
            you can safely ignore this email.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Performance Management Platform
            <br />
            Making performance reviews simple and effective
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default AccountWelcomeEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const content = {
  padding: '0 24px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
}

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  paddingLeft: '20px',
}

const listItem = {
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  color: '#3b82f6',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 22px',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
}