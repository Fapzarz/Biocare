import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { DiseaseForm } from '../../components/DiseaseForm';

describe('DiseaseForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockInitialDisease = {
    name: 'Test Disease',
    type: 'physical',
    medication: 'Test Medication',
    therapy: '-'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders disease form', () => {
    render(
      <DiseaseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        title="Add Disease"
      />
    );

    expect(screen.getByText('Add Disease')).toBeInTheDocument();
    expect(screen.getByLabelText(/disease name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/medication/i)).toBeInTheDocument();
  });

  it('populates form with initial disease data', () => {
    render(
      <DiseaseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        initialDisease={mockInitialDisease}
        title="Edit Disease"
      />
    );

    expect(screen.getByDisplayValue('Test Disease')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Medication')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <DiseaseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        title="Add Disease"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/disease name is required/i)).toBeInTheDocument();
    });
  });

  it('shows therapy field for mental diseases', () => {
    render(
      <DiseaseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        title="Add Disease"
      />
    );

    const typeSelect = screen.getByLabelText(/type/i);
    fireEvent.change(typeSelect, { target: { value: 'mental' } });

    expect(screen.getByLabelText(/therapy/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(
      <DiseaseForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        title="Add Disease"
      />
    );

    fireEvent.change(screen.getByLabelText(/disease name/i), {
      target: { value: 'New Disease' }
    });
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: 'physical' }
    });
    fireEvent.change(screen.getByLabelText(/medication/i), {
      target: { value: 'New Medication' }
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Disease',
        type: 'physical',
        medication: 'New Medication',
        therapy: '-'
      });
    });
  });
});