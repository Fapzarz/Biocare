import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { ThemeToggle } from '../../components/ThemeToggle';

describe('ThemeToggle', () => {
  it('renders without crashing', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles theme when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    // Initial state (light theme)
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    
    // Click to toggle
    fireEvent.click(button);
    
    // Should now be dark theme
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});