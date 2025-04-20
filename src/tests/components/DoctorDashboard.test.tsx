import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { DoctorDashboard } from '../../components/DoctorDashboard';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn()
    }))
  }
}));

describe('DoctorDashboard', () => {
  const mockUser = {
    id: '123',
    email: 'doctor@example.com',
    fullName: 'Dr. Test',
    isAdmin: false,
    password: ''
  };

  const mockOnLogout = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [] })
        })
      })
    } as any);
  });

  it('renders doctor dashboard', async () => {
    render(
      <DoctorDashboard
        user={mockUser}
        onLogout={mockOnLogout}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Dr. Test')).toBeInTheDocument();
      expect(screen.getByText('Consultations')).toBeInTheDocument();
    });
  });

  it('handles section navigation', async () => {
    render(
      <DoctorDashboard
        user={mockUser}
        onLogout={mockOnLogout}
        onBack={mockOnBack}
      />
    );

    const statsButton = screen.getByText('Statistics');
    fireEvent.click(statsButton);

    await waitFor(() => {
      expect(screen.getByText('Total Responses')).toBeInTheDocument();
    });
  });

  it('displays achievements section', async () => {
    const mockAchievements = [
      {
        badge: {
          name: 'Helper',
          description: 'Helped many patients',
          icon_name: 'Heart',
          required_score: 100
        },
        level: 2
      }
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockAchievements })
        })
      })
    } as any);

    render(
      <DoctorDashboard
        user={mockUser}
        onLogout={mockOnLogout}
        onBack={mockOnBack}
      />
    );

    const achievementsButton = screen.getByText('Achievements');
    fireEvent.click(achievementsButton);

    await waitFor(() => {
      expect(screen.getByText('Helper')).toBeInTheDocument();
    });
  });

  it('handles back navigation', () => {
    render(
      <DoctorDashboard
        user={mockUser}
        onLogout={mockOnLogout}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByText('Back to Main Menu');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
});