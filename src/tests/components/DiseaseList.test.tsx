import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { DiseaseList } from '../../components/DiseaseList';

describe('DiseaseList', () => {
  const mockDiseases = [
    {
      name: 'Diabetes',
      type: 'physical',
      medication: 'Insulin',
      therapy: '-'
    },
    {
      name: 'Depression',
      type: 'mental',
      medication: 'SSRIs',
      therapy: 'CBT'
    }
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnAdd = vi.fn();

  it('renders disease list', () => {
    render(<DiseaseList diseases={mockDiseases} />);

    expect(screen.getByText('Diabetes')).toBeInTheDocument();
    expect(screen.getByText('Depression')).toBeInTheDocument();
  });

  it('shows admin controls when isAdmin is true', () => {
    render(
      <DiseaseList
        diseases={mockDiseases}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    expect(screen.getByRole('button', { name: /add disease/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /edit disease/i })).toHaveLength(2);
  });

  it('handles edit button click', () => {
    render(
      <DiseaseList
        diseases={mockDiseases}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit disease/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockDiseases[0]);
  });

  it('handles delete button click', () => {
    render(
      <DiseaseList
        diseases={mockDiseases}
        isAdmin={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete disease/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockDiseases[0]);
  });

  it('displays disease type badges correctly', () => {
    render(<DiseaseList diseases={mockDiseases} />);

    const physicalBadge = screen.getByText('physical');
    const mentalBadge = screen.getByText('mental');

    expect(physicalBadge).toHaveClass('bg-purple-100');
    expect(mentalBadge).toHaveClass('bg-blue-100');
  });
});