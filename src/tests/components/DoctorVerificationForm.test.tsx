import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { DoctorVerificationForm } from '../../components/DoctorVerificationForm';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn()
      }))
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn()
    }))
  }
}));

describe('DoctorVerificationForm', () => {
  const mockUserId = '123';
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders verification form', () => {
    render(
      <DoctorVerificationForm
        userId={mockUserId}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Doctor Verification')).toBeInTheDocument();
    expect(screen.getByLabelText(/license number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/specialization/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <DoctorVerificationForm
        userId={mockUserId}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/license number is required/i)).toBeInTheDocument();
    });
  });

  it('handles file upload', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockPublicUrl = 'https://example.com/test.pdf';

    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test.pdf' } }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } })
    } as any);

    render(
      <DoctorVerificationForm
        userId={mockUserId}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const fileInput = screen.getByLabelText(/upload a file/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/document uploaded successfully/i)).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {} })
        })
      })
    } as any);

    render(
      <DoctorVerificationForm
        userId={mockUserId}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/license number/i), {
      target: { value: 'TEST-123' }
    });
    fireEvent.change(screen.getByLabelText(/specialization/i), {
      target: { value: 'General Medicine' }
    });

    // Mock file upload success
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test.pdf' } }),
      getPublicUrl: vi.fn().mockReturnValue({ 
        data: { publicUrl: 'https://example.com/test.pdf' }
      })
    } as any);

    const fileInput = screen.getByLabelText(/upload a file/i);
    fireEvent.change(fileInput, { 
      target: { files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })] }
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});