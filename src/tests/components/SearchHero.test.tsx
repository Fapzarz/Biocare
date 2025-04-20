import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import { SearchHero } from '../../components/SearchHero';

describe('SearchHero', () => {
  const mockOnSearch = vi.fn();

  it('renders search input', () => {
    render(<SearchHero onSearch={mockOnSearch} />);
    expect(screen.getByPlaceholderText(/search diseases/i)).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    render(<SearchHero onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search diseases/i);
    fireEvent.change(input, { target: { value: 'diabetes' } });
    fireEvent.submit(input.closest('form')!);

    expect(mockOnSearch).toHaveBeenCalledWith('diabetes');
  });

  it('shows popular searches', () => {
    render(<SearchHero onSearch={mockOnSearch} />);
    expect(screen.getByText('Popular searches:')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
  });
});