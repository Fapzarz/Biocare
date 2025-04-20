import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { UserManagementModal } from '../../components/UserManagementModal';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(),
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn()
    }))
  }
}));

describe('UserManagementModal', () => {
  const mockUser = {
    id: '123',
    fullName: 'Test User',
    email: 'test@example.com',
    reputation_score: 100,
    is_banned: false
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user management modal', () => {
    render(
      <UserManagementModal
        user={mockUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Manage User')).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it('handles reputation points adjustment', () => {
    render(
      <UserManagementModal
        user={mockUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const increaseButton = screen.getByRole('button', { name: /increase/i });
    fireEvent.click(increaseButton);

    expect(screen.getByDisplayValue('110')).toBeInTheDocument();
  });

  it('handles user ban', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {} })
        })
      })
    } as any);

    render(
      <UserManagementModal
        user={mockUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const banButton = screen.getByRole('button', { name: /ban user/i });
    fireEvent.click(banButton);

    // Confirm ban
    const confirmButton = screen.getByRole('button', { name: /yes, ban user/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/banned/i)).toBeInTheDocument();
    });
  });

  it('shows action history', async () => {
    const mockHistory = [
      {
        action_type: 'points_update',
        details: 'Updated points from 90 to 100',
        created_at: new Date().toISOString()
      }
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockHistory })
    } as any);

    render(
      <UserManagementModal
        user={mockUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const historyButton = screen.getByRole('button', { name: /show history/i });
    fireEvent.click(historyButton);

    await waitFor(() => {
      expect(screen.getByText(/updated points/i)).toBeInTheDocument();
    });
  });
});