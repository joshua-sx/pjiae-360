import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { EmailTestPanel } from './EmailTestPanel';

const mockSupabase = {
  functions: {
    invoke: vi.fn(),
  },
  auth: {
    signUp: vi.fn(),
  },
};

const mockToast = vi.fn();
const mockEmailConfiguration = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/hooks/useEmailConfiguration', () => ({
  useEmailConfiguration: () => mockEmailConfiguration(),
}));

describe('EmailTestPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailConfiguration.mockReturnValue({
      isFullyConfigured: true,
      isResendConfigured: true,
      isServiceRoleConfigured: true,
      loading: false,
      error: null,
    });
  });

  it('renders email test panel with all sections', () => {
    render(<EmailTestPanel />);

    expect(screen.getByText('Email Workflow Testing')).toBeInTheDocument();
    expect(screen.getByText('Test Data Configuration')).toBeInTheDocument();
    expect(screen.getByText('Welcome Email Test')).toBeInTheDocument();
    expect(screen.getByText('Employee Invitation Test')).toBeInTheDocument();
    expect(screen.getByText('Email Verification Test')).toBeInTheDocument();
    expect(screen.getByText('Email Template Preview')).toBeInTheDocument();
  });

  it('shows error when trying to test without email', async () => {
    render(<EmailTestPanel />);

    const welcomeButton = screen.getByText('Test Welcome Email');
    fireEvent.click(welcomeButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Email Required',
      description: 'Please enter an email address to test with.',
      variant: 'destructive',
    });
  });

  it('tests welcome email successfully', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { success: true, id: 'email-123' },
      error: null,
    });

    render(<EmailTestPanel />);

    const emailInput = screen.getByPlaceholderText('test@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const welcomeButton = screen.getByText('Test Welcome Email');
    fireEvent.click(welcomeButton);

    await waitFor(() => {
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('send-account-welcome', {
        body: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Email Sent',
      description: 'Welcome email sent successfully! Check edge function logs for delivery status.',
    });
  });

  it('handles welcome email errors', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Domain not verified' },
    });

    render(<EmailTestPanel />);

    const emailInput = screen.getByPlaceholderText('test@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const welcomeButton = screen.getByText('Test Welcome Email');
    fireEvent.click(welcomeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Email Failed',
        description: expect.stringContaining('Domain not verified'),
        variant: 'destructive',
      });
    });
  });

  it('tests email verification successfully', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    render(<EmailTestPanel />);

    const emailInput = screen.getByPlaceholderText('test@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const verificationButton = screen.getByText('Test Email Verification');
    fireEvent.click(verificationButton);

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Email Sent',
      description: 'Verification email sent successfully!',
    });
  });

  it('displays email configuration status correctly', () => {
    mockEmailConfiguration.mockReturnValue({
      isFullyConfigured: false,
      isResendConfigured: true,
      isServiceRoleConfigured: false,
      loading: false,
      error: null,
    });

    render(<EmailTestPanel />);

    expect(screen.getByText('Email Configuration Status')).toBeInTheDocument();
    expect(screen.getByText('Resend API Key')).toBeInTheDocument();
    expect(screen.getByText('Service Role Key')).toBeInTheDocument();
    expect(screen.getByText('Setup Required:')).toBeInTheDocument();
  });

  it('shows loading state during configuration check', () => {
    mockEmailConfiguration.mockReturnValue({
      isFullyConfigured: false,
      isResendConfigured: false,
      isServiceRoleConfigured: false,
      loading: true,
      error: null,
    });

    render(<EmailTestPanel />);

    expect(screen.getByText('Checking configuration...')).toBeInTheDocument();
  });

  it('updates form fields correctly', () => {
    render(<EmailTestPanel />);

    const firstNameInput = screen.getByDisplayValue('Test');
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    expect(firstNameInput).toHaveValue('John');

    const lastNameInput = screen.getByDisplayValue('User');
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('disables buttons while requests are loading', async () => {
    mockSupabase.functions.invoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 100))
    );

    render(<EmailTestPanel />);

    const emailInput = screen.getByPlaceholderText('test@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const welcomeButton = screen.getByText('Test Welcome Email');
    fireEvent.click(welcomeButton);

    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(welcomeButton).toBeDisabled();
  });
});