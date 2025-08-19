import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ImportSummaryEmailProps {
  adminName: string
  companyName: string
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  dashboardUrl: string
  hasErrors: boolean
}

export const ImportSummaryEmail = ({
  adminName,
  companyName,
  totalRecords,
  successfulRecords,
  failedRecords,
  dashboardUrl,
  hasErrors,
}: ImportSummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Employee import completed - {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {hasErrors ? '⚠️' : '✅'} Employee Import Completed
        </Heading>
        
        <Text style={text}>Hi {adminName},</Text>
        
        <Text style={text}>
          Your employee import for {companyName} has been completed. 
          Here's a summary of the results:
        </Text>
        
        <Section style={summaryBox}>
          <Text style={summaryTitle}>Import Summary</Text>
          <Text style={summaryText}>
            <strong>Total Records Processed:</strong> {totalRecords}<br />
            <strong>Successfully Imported:</strong> {successfulRecords}<br />
            <strong>Failed Imports:</strong> {failedRecords}
          </Text>
          
          {hasErrors && (
            <Text style={errorNote}>
              ⚠️ Some records failed to import. Please review the failed imports 
              in your dashboard for detailed error information.
            </Text>
          )}
        </Section>
        
        <Section style={buttonContainer}>
          <Button href={dashboardUrl} style={button}>
            View Employee Dashboard
          </Button>
        </Section>
        
        {hasErrors ? (
          <Text style={text}>
            Please review the failed imports and correct any data issues before 
            re-attempting the import. Common issues include duplicate email addresses, 
            invalid data formats, or missing required fields.
          </Text>
        ) : (
          <Text style={text}>
            All employees have been successfully imported! They should receive 
            welcome emails with instructions to complete their account setup.
          </Text>
        )}
        
        <Text style={text}>
          If you need assistance with any failed imports, please contact support 
          or refer to the import documentation.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          The {companyName} Performance Management System
        </Text>
        
        <Text style={disclaimer}>
          This is an automated system notification. 
          If you have questions, please contact your system administrator.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ImportSummaryEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  lineHeight: '42px',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const summaryBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const summaryTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const summaryText = {
  color: '#495057',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px 0',
}

const errorNote = {
  color: '#856404',
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  padding: '12px',
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#007bff',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const footer = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 0 16px 0',
}

const disclaimer = {
  color: '#6c757d',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '24px 0 0 0',
  paddingTop: '16px',
  borderTop: '1px solid #e9ecef',
}