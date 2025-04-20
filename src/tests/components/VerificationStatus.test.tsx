import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { VerificationStatus } from '../../components/VerificationStatus';

describe('VerificationStatus', () => {
  const mockOnRequestVerification = vi.fn();

  it('renders unverified status', () => {
    render(
      <VerificationStatus
        status="unverified"
        onRequestVerification={mockOnRequestVerification}
      />
    );

    expect(screen.getByText('Not Verified')).toBeInTheDocument();
    expect(screen.getByText(/get verified to provide medical consultations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request verification/i })).toBeInTheDocument();
  });

  it('renders pending status', () => {
    render(
      <VerificationStatus
        status="pending"
        onRequestVerification={mockOnRequestVerification}
      />
    );

    expect(screen.getByText('Verification Pending')).toBeInTheDocument();
    expect(screen.getByText(/your verification request is being reviewed/i)).toBeInTheDocument();
  });

  it('renders verified status', () => {
    render(
      <VerificationStatus
        status="verified"
        onRequestVerification={mockOnRequestVerification}
      />
    );

    expect(screen.getByText('Verified Doctor')).toBeInTheDocument();
    expect(screen.getByText(/your medical credentials have been verified/i)).toBeInTheDocument();
  });

  it('handles verification request', () => {
    render(
      <VerificationStatus
        status="unverified"
        onRequestVerification={mockOnRequestVerification}
      />
    );

    const requestButton = screen.getByRole('button', { name: /request verification/i });
    fireEvent.click(requestButton);

    expect(mockOnRequestVerification).toHaveBeenCalled();
  });

  it('shows rejected status', () => {
    render(
      <VerificationStatus
        status="rejected"
        onRequestVerification={mockOnRequestVerification}
      />
    );

    expect(screen.getByText('Verification Rejected')).toBeInTheDocument();
    expect(screen.getByText(/your verification request was not approved/i)).toBeInTheDocument();
  });
});