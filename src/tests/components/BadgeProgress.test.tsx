import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { BadgeProgress } from '../../components/BadgeProgress';

describe('BadgeProgress', () => {
  const mockBadge = {
    name: 'Helper',
    description: 'Provided helpful responses',
    icon_name: 'Heart',
    required_score: 100,
    current_level: 2,
    progress: 75
  };

  it('renders badge information', () => {
    render(<BadgeProgress badge={mockBadge} />);

    expect(screen.getByText(mockBadge.name)).toBeInTheDocument();
    expect(screen.getByText(mockBadge.description)).toBeInTheDocument();
    expect(screen.getByText(`Level ${mockBadge.current_level}`)).toBeInTheDocument();
  });

  it('displays progress correctly', () => {
    render(<BadgeProgress badge={mockBadge} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('shows max level correctly', () => {
    const maxLevelBadge = {
      ...mockBadge,
      current_level: 3,
      progress: 100
    };

    render(<BadgeProgress badge={maxLevelBadge} />);
    expect(screen.getByText('Level 3 / 3')).toBeInTheDocument();
  });
});