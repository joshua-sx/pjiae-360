import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://via.placeholder.com/200x60/3b82f6/ffffff?text=Your+Logo"
            width="200"
            height="60"
            alt="Company Logo"
            style={logo}
          />
        </Section>
        {children}
        <Section style={footer}>
          <div style={footerText}>
            This is an automated message from your performance management system.
            <br />
            If you have questions, please contact your administrator.
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
)

import { brandColors } from './theme.ts'

const main = {
  backgroundColor: brandColors.white,
  margin: '0 auto',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
}

const header = {
  backgroundColor: brandColors.white,
  padding: '20px 0',
  textAlign: 'center' as const,
  borderBottom: `2px solid ${brandColors.primary}`,
  marginBottom: '30px',
}

const logo = {
  margin: '0 auto',
}

const footer = {
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: `1px solid #e5e7eb`,
  textAlign: 'center' as const,
}

const footerText = {
  color: brandColors.gray,
  fontSize: '12px',
  lineHeight: '18px',
}

export default EmailLayout