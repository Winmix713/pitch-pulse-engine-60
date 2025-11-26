import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyButton } from '@/components/common/CopyButton';
import { CopyBadge } from '@/components/common/CopyBadge';
import { useCopyToClipboard, copyToClipboard } from '@/hooks/useCopyToClipboard';
import { toast } from 'sonner';

// Mock the clipboard API
const mockWriteText = vi.fn();
const mockExecCommand = vi.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

Object.assign(document, {
  execCommand: mockExecCommand,
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Clipboard Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock secure context
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('copyToClipboard utility function', () => {
    it('should copy text using modern clipboard API when available', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      const result = await copyToClipboard('test text');
      
      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard');
    });

    it('should fallback to execCommand when clipboard API is not available', async () => {
      // Mock no clipboard API
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true,
      });
      
      mockExecCommand.mockReturnValue(true);
      
      const result = await copyToClipboard('test text');
      
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard');
    });

    it('should handle errors gracefully', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard');
    });

    it('should use custom success and error messages', async () => {
      mockWriteText.mockResolvedValue(undefined);
      
      await copyToClipboard('test text', {
        successMessage: 'Custom success',
        errorMessage: 'Custom error',
      });
      
      expect(toast.success).toHaveBeenCalledWith('Custom success');
    });
  });

  describe('useCopyToClipboard hook', () => {
    it('should provide copy function and state', () => {
      const TestComponent = () => {
        const { copy, isLoading, isSuccess, error } = useCopyToClipboard();
        
        return (
          <button onClick={() => copy('test')}>
            {isLoading ? 'loading' : isSuccess ? 'success' : 'idle'}
            {error && <span>{error}</span>}
          </button>
        );
      };
      
      render(<TestComponent />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('idle');
    });

    it('should update state during copy operation', async () => {
      mockWriteText.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const TestComponent = () => {
        const { copy, isLoading, isSuccess } = useCopyToClipboard();
        
        return (
          <button onClick={() => copy('test')}>
            {isLoading ? 'loading' : isSuccess ? 'success' : 'idle'}
          </button>
        );
      };
      
      render(<TestComponent />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveTextContent('loading');
      
      await waitFor(() => {
        expect(button).toHaveTextContent('success');
      });
    });
  });
});

describe('CopyButton Component', () => {
  it('should render with default props', () => {
    render(<CopyButton text="test text">Copy</CopyButton>);
    
    const button = screen.getByRole('button', { name: /copy to clipboard/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should copy text when clicked', async () => {
    mockWriteText.mockResolvedValue(undefined);
    
    render(<CopyButton text="test text">Copy</CopyButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });
  });

  it('should show loading state during copy', async () => {
    mockWriteText.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<CopyButton text="test text">Copy</CopyButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    // Check for loading icon instead of test-id
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show success state after successful copy', async () => {
    mockWriteText.mockResolvedValue(undefined);
    
    render(<CopyButton text="test text">Copy</CopyButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(<CopyButton text="test text" disabled>Copy</CopyButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

describe('CopyBadge Component', () => {
  it('should render as clickable badge', () => {
    render(
      <CopyBadge text="test text">
        <span>Badge Content</span>
      </CopyBadge>
    );

    const badge = screen.getByText('Badge Content');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('[aria-label]')).toHaveAttribute('aria-label', 'Copy: test text');
  });

  it('should copy text when clicked', async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(
      <CopyBadge text="test text">
        <span>Badge Content</span>
      </CopyBadge>
    );

    const badge = screen.getByText('Badge Content');
    fireEvent.click(badge);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });
  });

  it('should show icon when showIcon is true', () => {
    render(
      <CopyBadge text="test text" showIcon>
        <span>Badge Content</span>
      </CopyBadge>
    );

    // Check for the copy icon by its class instead of role
    expect(document.querySelector('.lucide-copy')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <CopyBadge text="test text" disabled>
        <span>Badge Content</span>
      </CopyBadge>
    );

    const badge = screen.getByText('Badge Content');
    const badgeElement = badge.closest('[aria-label]');
    expect(badgeElement).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});