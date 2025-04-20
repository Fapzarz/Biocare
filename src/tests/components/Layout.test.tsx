import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { Layout } from '../../components/Layout';

describe('Layout', () => {
  const mockUser = {
    username: 'Test User',
    isAdmin: false,
    isDoctor: false
  };

  const mockOnLogout = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnProfileClick = vi.fn();
  const mockOnNavigate = vi.fn();

  it('renders header with user info when logged in', () => {
    render(
      <Layout 
        user={mockUser}
        onLogout={mockOnLogout}
        onSearch={mockOnSearch}
        onProfileClick={mockOnProfileClick}
        onNavigate={mockOnNavigate}
      >
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles logout click', () => {
    render(
      <Layout 
        user={mockUser}
        onLogout={mockOnLogout}
        onSearch={mockOnSearch}
        onProfileClick={mockOnProfileClick}
        onNavigate={mockOnNavigate}
      >
        <div>Content</div>
      </Layout>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('shows admin features for admin users', () => {
    const adminUser = { ...mockUser, isAdmin: true };
    render(
      <Layout 
        user={adminUser}
        onLogout={mockOnLogout}
        onSearch={mockOnSearch}
        onProfileClick={mockOnProfileClick}
        onNavigate={mockOnNavigate}
      >
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});