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
    <Preview>Welcome to PJIAE 360 – Your Gateway to Seamless Performance Management</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Welcome to PJIAE 360 – Your Gateway to Seamless Performance Management</Heading>
        </Section>

        <Section style={content}>
          <Text style={text}>
            Dear {firstName},
          </Text>
          
          <Text style={text}>
            Welcome to PJIAE 360, the new digital platform designed to make your experience with Princess Juliana International Airport Enterprises more efficient, transparent, and empowering.
          </Text>

          <Text style={text}>
            As part of PJIAE's ongoing digital transformation, PJIAE 360 centralizes your performance management activities—goal setting, mid-year reviews, and year-end evaluations—within a single, secure platform. Here, you'll be able to track your objectives, access feedback, and take an active role in your own professional development.
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

          <Text style={{...text, fontWeight: 'bold', color: '#1f2937'}}>
            What you can expect:
          </Text>

          <ul style={list}>
            <li style={listItem}><strong>A streamlined appraisal process:</strong> Complete all steps of the annual performance cycle—from setting your SMART goals to reviewing feedback—entirely online.</li>
            <li style={listItem}><strong>Clarity and transparency:</strong> Easily view your goals, appraisal timelines, and results, with access to resources on competencies, scoring, and PJIAE's Code of Conduct.</li>
            <li style={listItem}><strong>Support at every stage:</strong> Guidance is built in, and our HR team is ready to assist you with any questions as you navigate the new system.</li>
          </ul>

          <Text style={{...text, fontWeight: 'bold', color: '#1f2937'}}>
            Why this matters:
          </Text>

          <Text style={text}>
            Our performance management approach is designed to help you achieve your career goals while contributing to the success of PJIAE. By using PJIAE 360, you'll be able to align your personal objectives with our organizational vision, participate in ongoing development, and ensure your hard work is recognized and rewarded in line with company policy.
          </Text>

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
            PJIAE 360 – Princess Juliana International Airport Enterprises
            <br />
            Your Gateway to Seamless Performance Management
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