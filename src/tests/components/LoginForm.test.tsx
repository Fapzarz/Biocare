import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { LoginForm } from '../../components/LoginForm';
import { auth } from '../../lib/auth';

vi.mock('../../lib/auth', () => ({
  auth: {
    signIn: vi.fn(),
    signUp: vi.fn()
  }
}));

describe('LoginForm', () => {
  const mockOnLogin = vi.fn();
  const mockOnAcceptTerms = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        acceptedTerms={false}
        onAcceptTerms={mockOnAcceptTerms}
      />
    );

    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows registration form when switching modes', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        acceptedTerms={false}
        onAcceptTerms={mockOnAcceptTerms}
      />
    );

    fireEvent.click(screen.getByText(/don't have an account/i));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        acceptedTerms={false}
        onAcceptTerms={mockOnAcceptTerms}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      fullName: 'Test User'
    };

    vi.mocked(auth.signIn).mockResolvedValue(mockUser);

    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        acceptedTerms={true}
        onAcceptTerms={mockOnAcceptTerms}
      />
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });
});