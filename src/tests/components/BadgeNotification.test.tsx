import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { BadgeNotification } from '../../components/BadgeNotification';

describe('BadgeNotification', () => {
  const mockBadge = {
    name: 'Problem Solver',
    description: 'Solved 5 problems',
    level: 1
  };

  const mockOnClose = vi.fn();

  it('renders badge notification', () => {
    render(<BadgeNotification badge={mockBadge} onClose={mockOnClose} />);

    expect(screen.getByText('New Badge Earned!')).toBeInTheDocument();
    expect(screen.getByText(mockBadge.name)).toBeInTheDocument();
    expect(screen.getByText(`Level ${mockBadge.level}`)).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(<BadgeNotification badge={mockBadge} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows animation on mount', () => {
    render(<BadgeNotification badge={mockBadge} onClose={mockOnClose} />);

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('translate-y-0', 'opacity-100');
  });
});