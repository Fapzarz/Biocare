import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { NotificationBell } from '../../components/NotificationBell';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn()
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    }))
  }
}));

describe('NotificationBell', () => {
  const mockUserId = '123';
  const mockNotifications = [
    {
      id: '1',
      type: 'new_response',
      title: 'New Response',
      content: 'Someone responded to your post',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      type: 'achievement_earned',
      title: 'New Achievement',
      content: 'You earned a new badge',
      read: true,
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockNotifications })
        })
      })
    } as any);
  });

  it('renders notification bell with unread count', async () => {
    render(<NotificationBell userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 unread notification
    });
  });

  it('shows notification list when clicked', async () => {
    render(<NotificationBell userId={mockUserId} />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('New Response')).toBeInTheDocument();
      expect(screen.getByText('New Achievement')).toBeInTheDocument();
    });
  });

  it('marks notification as read when clicked', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockResolvedValue({ data: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockNotifications })
        })
      })
    } as any);

    render(<NotificationBell userId={mockUserId} />);

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const notification = screen.getByText('New Response');
      fireEvent.click(notification);
    });

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });
  });

  it('subscribes to real-time updates', () => {
    render(<NotificationBell userId={mockUserId} />);

    expect(supabase.channel).toHaveBeenCalled();
    expect(supabase.channel().subscribe).toHaveBeenCalled();
  });
});