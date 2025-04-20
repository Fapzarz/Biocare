import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { UserManagementTable } from '../../components/UserManagementTable';

describe('UserManagementTable', () => {
  const mockUsers = [
    {
      id: '1',
      full_name: 'Test User',
      email: 'test@example.com',
      reputation_score: 100,
      is_banned: false,
      total_posts: 5,
      total_solutions: 2
    },
    {
      id: '2',
      full_name: 'Banned User',
      email: 'banned@example.com',
      reputation_score: 0,
      is_banned: true,
      total_posts: 1,
      total_solutions: 0
    }
  ];

  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user table with data', () => {
    render(<UserManagementTable users={mockUsers} onRefresh={mockOnRefresh} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('filters users by search', () => {
    render(<UserManagementTable users={mockUsers} onRefresh={mockOnRefresh} />);

    const searchInput = screen.getByPlaceholderText(/search users/i);
    fireEvent.change(searchInput, { target: { value: 'banned' } });

    expect(screen.getByText('Banned User')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('shows banned users filter', () => {
    render(<UserManagementTable users={mockUsers} onRefresh={mockOnRefresh} />);

    const filterButton = screen.getByRole('button', { name: /show banned/i });
    fireEvent.click(filterButton);

    expect(screen.getByText('Banned User')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('sorts users by reputation', () => {
    render(<UserManagementTable users={mockUsers} onRefresh={mockOnRefresh} />);

    const sortButton = screen.getByRole('button', { name: /sort by points/i });
    fireEvent.click(sortButton);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Test User'); // First user after header
  });
});