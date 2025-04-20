import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { ConsultationDetail } from '../../components/ConsultationDetail';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn()
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    }))
  }
}));

describe('ConsultationDetail', () => {
  const mockPost = {
    id: '123',
    title: 'Test Consultation',
    content: 'Test content',
    author_id: 'author123',
    author_name: 'Test Author',
    author_type: 'user',
    category: 'general',
    status: 'open',
    created_at: new Date().toISOString(),
    tags: ['test'],
    likes: 0,
    is_private: false
  };

  const mockComments = [
    {
      id: 'comment1',
      content: 'Test comment',
      author_id: 'user123',
      author_name: 'Commenter',
      author_type: 'user',
      created_at: new Date().toISOString(),
      is_solution: false,
      likes: 0
    }
  ];

  const mockCurrentUser = {
    id: 'user123',
    fullName: 'Current User',
    isDoctor: false
  };

  const mockOnClose = vi.fn();
  const mockOnCommentAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders consultation details', () => {
    render(
      <ConsultationDetail
        post={mockPost}
        comments={mockComments}
        currentUser={mockCurrentUser}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
    expect(screen.getByText(mockComments[0].content)).toBeInTheDocument();
  });

  it('handles adding new comment', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {
            id: 'newcomment',
            content: 'New comment',
            author_id: mockCurrentUser.id,
            author_name: mockCurrentUser.fullName
          }})
        })
      })
    } as any);

    render(
      <ConsultationDetail
        post={mockPost}
        comments={mockComments}
        currentUser={mockCurrentUser}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    const commentInput = screen.getByPlaceholderText(/add your response/i);
    fireEvent.change(commentInput, { target: { value: 'New comment' } });
    fireEvent.submit(screen.getByRole('button', { name: /post response/i }));

    await waitFor(() => {
      expect(mockOnCommentAdded).toHaveBeenCalled();
    });
  });

  it('shows doctor badge for doctor comments', () => {
    const doctorComments = [
      {
        ...mockComments[0],
        author_type: 'doctor'
      }
    ];

    render(
      <ConsultationDetail
        post={mockPost}
        comments={doctorComments}
        currentUser={mockCurrentUser}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    expect(screen.getByText('Doctor')).toBeInTheDocument();
  });

  it('handles solution marking for doctors', () => {
    const doctorUser = { ...mockCurrentUser, isDoctor: true };

    render(
      <ConsultationDetail
        post={mockPost}
        comments={mockComments}
        currentUser={doctorUser}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    expect(screen.getByRole('button', { name: /mark as solution/i })).toBeInTheDocument();
  });
});