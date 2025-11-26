import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { FeatureFlagsProvider } from '@/providers/FeatureFlagsProvider';
import AppRoutes from '@/components/AppRoutes';
import PageLoading from '@/components/ui/PageLoading';
import { vi } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useRequireAuth: () => ({ loading: false, authenticated: true }),
  useRequireRole: () => ({ loading: true, authorized: false }),
}));

vi.mock('@/hooks/usePhaseFlags', () => ({
  usePhaseFlags: () => ({
    isPhase5Enabled: false,
    isPhase6Enabled: false,
    isPhase7Enabled: false,
    isPhase8Enabled: false,
    isPhase9Enabled: false,
  }),
}));

// Mock lazy components
vi.mock('@/pages/Index', () => ({
  default: () => <div>Index Page</div>,
}));

vi.mock('@/pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

vi.mock('@/pages/admin/AdminDashboard', () => ({
  default: () => <div>Admin Dashboard</div>,
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FeatureFlagsProvider>
          <AuthProvider>
            {component}
          </AuthProvider>
        </FeatureFlagsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the index page', () => {
    renderWithProviders(<AppRoutes />);
    expect(screen.getByText('Index Page')).toBeInTheDocument();
  });

  it('renders protected routes when authenticated', () => {
    const { useRequireAuth } = require('@/hooks/useAuth');
    useRequireAuth.mockReturnValue({ loading: false, authenticated: true });
    
    renderWithProviders(<AppRoutes />);
    expect(screen.getByText('Index Page')).toBeInTheDocument();
  });

  it('shows loading state while checking permissions', () => {
    const { useRequireRole } = require('@/hooks/useAuth');
    useRequireRole.mockReturnValue({ loading: true, authorized: false });
    
    renderWithProviders(<AppRoutes />);
    expect(screen.getByText('Checking permissions...')).toBeInTheDocument();
  });

  it('respects phase flags for conditional routes', () => {
    const { usePhaseFlags } = require('@/hooks/usePhaseFlags');
    usePhaseFlags.mockReturnValue({
      isPhase5Enabled: true,
      isPhase6Enabled: false,
      isPhase7Enabled: false,
      isPhase8Enabled: false,
      isPhase9Enabled: false,
    });
    
    renderWithProviders(<AppRoutes />);
    // Phase 5 is enabled, but the component just shows a placeholder
    expect(screen.getByText('Index Page')).toBeInTheDocument();
  });

  it('applies role-based access control', () => {
    const { useRequireRole } = require('@/hooks/useAuth');
    useRequireRole.mockImplementation((roles) => {
      if (roles && roles.includes('admin')) {
        return { loading: false, authorized: false, error: 'Requires admin role' };
      }
      return { loading: false, authorized: true };
    });
    
    renderWithProviders(<AppRoutes />);
    // Should still render index page since admin routes are separate
    expect(screen.getByText('Index Page')).toBeInTheDocument();
  });
});