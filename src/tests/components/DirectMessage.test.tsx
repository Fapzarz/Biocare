import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { DirectMessage } from '../../components/DirectMessage';
import { supabase } from '../../lib/supabase';
import { encryption } from '../../lib/encryption';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
      eq: vi.fn(),
      single: vi.fn()
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    }))
  }
}));

vi.mock('../../lib/encryption', () => ({
  encryption: {
    init: vi.fn(),
    getPublicKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn()
  }
}));

describe('DirectMessage', () => {
  const mockProps = {
    currentUserId: 'user1',
    recipientId: 'user2',
    recipientName: 'Test User',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(encryption.init).mockResolvedValue(undefined);
    vi.mocked(encryption.getPublicKey).mockReturnValue('mockPublicKey');
    vi.mocked(encryption.encrypt).mockResolvedValue('encryptedMessage');
    vi.mocked(encryption.decrypt).mockResolvedValue('decryptedMessage');
  });

  it('renders direct message component', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { public_key: 'mockPublicKey' }
          })
        })
      })
    } as any);

    render(<DirectMessage {...mockProps} />);

    expect(screen.getByText(mockProps.recipientName)).toBeInTheDocument();
    expect(screen.getByText('End-to-end encrypted')).toBeInTheDocument();
  });

  it('handles message sending', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { public_key: 'mockPublicKey' }
          })
        })
      }),
      insert: vi.fn().mockResolvedValue({ error: null })
    } as any);

    render(<DirectMessage {...mockProps} />);

    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(encryption.encrypt).toHaveBeenCalledWith('Hello', 'mockPublicKey');
    });
  });

  it('shows error on encryption failure', async () => {
    vi.mocked(encryption.init).mockRejectedValue(new Error('Encryption failed'));

    render(<DirectMessage {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to initialize encryption/i)).toBeInTheDocument();
    });
  });

  it('decrypts received messages', async () => {
    const mockMessages = [{
      id: '1',
      sender_id: 'user2',
      recipient_id: 'user1',
      encrypted_content: 'encryptedContent',
      created_at: new Date().toISOString()
    }];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { public_key: 'mockPublicKey' }
          })
        }),
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockMessages })
        })
      })
    } as any);

    render(<DirectMessage {...mockProps} />);

    await waitFor(() => {
      expect(encryption.decrypt).toHaveBeenCalledWith(
        'encryptedContent',
        'mockPublicKey'
      );
    });
  });
});