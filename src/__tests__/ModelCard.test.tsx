import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModelCard from '@/components/models/ModelCard';
import type { ModelRegistry } from '@/types/models';

// Mock the copy components
vi.mock('@/components/common', () => ({
  CopyButton: ({ text, children, onClick }: { text: string; children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="copy-button" onClick={onClick}>
      {children}
    </button>
  ),
  CopyBadge: ({ text, children, onClick }: { text: string; children: React.ReactNode; onClick?: () => void }) => (
    <span data-testid="copy-badge" onClick={onClick}>
      {children}
    </span>
  ),
}));

const mockModel: ModelRegistry = {
  id: 'test-model-id-12345678',
  model_name: 'Test Model',
  model_version: '1.0.0',
  model_type: 'challenger',
  algorithm: 'Random Forest',
  hyperparameters: JSON.stringify({
    n_estimators: 100,
    max_depth: 10,
    random_state: 42,
  }),
  traffic_allocation: 20,
  accuracy: 0.85,
  total_predictions: 1500,
  is_active: true,
  registered_at: '2024-01-01T00:00:00Z',
  description: 'Test model for unit testing',
};

describe('ModelCard with Copy Functionality', () => {
  const mockOnPromote = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnAction = vi.fn();

  const defaultProps = {
    model: mockModel,
    onPromote: mockOnPromote,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onAction: mockOnAction,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render model ID copy badge', () => {
    render(<ModelCard {...defaultProps} />);
    
    const copyBadge = screen.getByTestId('copy-badge');
    expect(copyBadge).toBeInTheDocument();
    expect(copyBadge).toHaveTextContent('ID: test-mode...');
  });

  it('should render hyperparameters with copy button', () => {
    render(<ModelCard {...defaultProps} />);
    
    expect(screen.getByText('Hyperparameters')).toBeInTheDocument();
    expect(screen.getByText('Copy JSON')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/"n_estimators": 100/)).toBeInTheDocument();
  });

  it('should call onPromote when promote button is clicked', () => {
    render(<ModelCard {...defaultProps} />);
    
    const promoteButton = screen.getByText('Promote');
    fireEvent.click(promoteButton);
    
    expect(mockOnPromote).toHaveBeenCalledWith(mockModel);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ModelCard {...defaultProps} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockModel);
  });

  it('should call onAction when duplicate action is triggered', () => {
    const actions = [
      { type: 'duplicate', label: 'Duplicate Model' },
    ];
    
    render(<ModelCard {...defaultProps} actions={actions} />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    const duplicateButton = screen.getByText('Duplicate Model');
    fireEvent.click(duplicateButton);
    
    expect(mockOnAction).toHaveBeenCalledWith(
      { type: 'duplicate', label: 'Duplicate Model' },
      mockModel
    );
  });

  it('should display model metrics correctly', () => {
    render(<ModelCard {...defaultProps} />);
    
    expect(screen.getByText('85%')).toBeInTheDocument(); // accuracy
    expect(screen.getByText('1500')).toBeInTheDocument(); // predictions
    expect(screen.getByText('20%')).toBeInTheDocument(); // traffic allocation
    expect(screen.getByText('Random Forest')).toBeInTheDocument(); // algorithm
  });

  it('should show correct model type badge', () => {
    render(<ModelCard {...defaultProps} />);
    
    const typeBadges = screen.getAllByText('challenger');
    expect(typeBadges.length).toBeGreaterThan(0);
  });

  it('should render description when provided', () => {
    render(<ModelCard {...defaultProps} />);
    
    expect(screen.getByText('Test model for unit testing')).toBeInTheDocument();
  });

  it('should not show promote button for non-challenger models', () => {
    const championModel = {
      ...mockModel,
      model_type: 'champion' as const,
    };
    
    render(<ModelCard {...defaultProps} model={championModel} />);
    
    expect(screen.queryByText('Promote')).not.toBeInTheDocument();
  });

  it('should handle models without hyperparameters', () => {
    const modelWithoutHyperparams = {
      ...mockModel,
      hyperparameters: undefined,
    };
    
    render(<ModelCard {...defaultProps} model={modelWithoutHyperparams} />);
    
    expect(screen.queryByText('Hyperparameters')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy JSON')).not.toBeInTheDocument();
  });

  it('should handle models without description', () => {
    const modelWithoutDescription = {
      ...mockModel,
      description: undefined,
    };
    
    render(<ModelCard {...defaultProps} model={modelWithoutDescription} />);
    
    expect(screen.queryByText('Test model for unit testing')).not.toBeInTheDocument();
  });
});