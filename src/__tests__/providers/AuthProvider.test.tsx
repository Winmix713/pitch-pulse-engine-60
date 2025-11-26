import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, AuthContext } from '@/providers/AuthProvider';
import { ReactNode } from 'react';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: ReactNode, queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides auth context to children', () => {
    const TestComponent = () => {
      const context = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="loading">{String(context?.loading)}</div>
          <div data-testid="user">{context?.user ? 'has-user' : 'no-user'}</div>
        </div>
      );
    };

    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('handles role-based access methods', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
    };

    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'admin' as const,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    const { supabase } = require('@/integrations/supabase/client');
    
    // Mock session and profile
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      }),
    });

    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const TestComponent = () => {
      const { hasRole, hasAnyRole, isAdmin, isAnalyst } = React.useContext(AuthContext) || {};
      
      return (
        <div>
          <div data-testid="has-admin-role">{String(hasRole?.('admin'))}</div>
          <div data-testid="has-any-role">{String(hasAnyRole?.(['admin', 'analyst']))}</div>
          <div data-testid="is-admin">{String(isAdmin?.())}</div>
          <div data-testid="is-analyst">{String(isAnalyst?.())}</div>
        </div>
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('has-admin-role')).toHaveTextContent('true');
      expect(screen.getByTestId('has-any-role')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('is-analyst')).toHaveTextContent('false');
    });
  });

  it('handles sign in functionality', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
    };

    const { supabase } = require('@/integrations/supabase/client');
    
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null, // No profile initially
            error: null,
          }),
        }),
      }),
    });

    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const TestComponent = () => {
      const { signIn } = React.useContext(AuthContext) || {};
      
      const handleSignIn = async () => {
        try {
          await signIn?.('test@example.com', 'password');
        } catch (error) {
          // Handle error
        }
      };
      
      return (
        <button onClick={handleSignIn} data-testid="sign-in-button">
          Sign In
        </button>
      );
    };

    renderWithProviders(<TestComponent />);
    
    const signInButton = screen.getByTestId('sign-in-button');
    await user.click(signInButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('handles sign out functionality', async () => {
    const user = userEvent.setup();
    const { supabase } = require('@/integrations/supabase/client');
    
    supabase.auth.signOut.mockResolvedValue({ error: null });
    
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const TestComponent = () => {
      const { signOut } = React.useContext(AuthContext) || {};
      
      const handleSignOut = async () => {
        try {
          await signOut?.();
        } catch (error) {
          // Handle error
        }
      };
      
      return (
        <button onClick={handleSignOut} data-testid="sign-out-button">
          Sign Out
        </button>
      );
    };

    renderWithProviders(<TestComponent />);
    
    const signOutButton = screen.getByTestId('sign-out-button');
    await user.click(signOutButton);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});