import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { ConsultationForm } from '../../components/ConsultationForm';

describe('ConsultationForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockCurrentUser = {
    id: '123',
    fullName: 'Test User',
    isDoctor: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders consultation form', () => {
    render(
      <ConsultationForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByText('Ask for Health Consultation')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <ConsultationForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        currentUser={mockCurrentUser}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    render(
      <ConsultationForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        currentUser={mockCurrentUser}
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Consultation' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' }
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'general' }
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Consultation',
        content: 'Test description',
        category: 'general'
      }));
    });
  });

  it('handles cancellation', () => {
    render(
      <ConsultationForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        currentUser={mockCurrentUser}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});