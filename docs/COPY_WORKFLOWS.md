# Copy Workflows Documentation

This document describes the copy/clone functionality available across the WinMix TipsterHub application.

## Overview

The application provides comprehensive copy-to-clipboard utilities and duplication features to satisfy the "másolási funkciók" (copy functions) requirement. These features enable users to quickly share IDs, configurations, analytics data, and insights across the platform.

## Available Copy Actions

### 1. Models Page (`/models`)

#### Model Card Copy Features
- **Model ID Copy**: Click the ID badge to copy the full model ID
- **Hyperparameters Copy**: Click "Copy JSON" button to copy model hyperparameters as formatted JSON
- **Model Duplication**: Use the "Duplicate Model" action to create a cloned model with:
  - Same hyperparameters and algorithm
  - New unique name with timestamp
  - Challenger type by default
  - Inactive status (requires manual activation)

#### Access Points
- Model ID badges in each model card header
- "Copy JSON" button in hyperparameters section
- "Duplicate Model" option in the actions menu

### 2. Scheduled Jobs Page (`/scheduled-jobs`)

#### Job Status Card Copy Features
- **Job ID Copy**: Click the ID badge to copy the full job identifier
- **Cron Expression Copy**: Click the cron badge to copy the schedule expression
- **Log Message Copy**: Click "Copy Log" to copy the latest log message

#### Access Points
- ID badges in job card headers
- Cron expression badges below job type
- "Copy Log" buttons in performance sections

### 3. Analytics Dashboard (`/analytics`)

#### Analytics Copy Features
- **Summary Metrics Copy**: Individual copy buttons for each metric (total evaluations, accuracy, calibration error)
- **Full Summary Export**: "Copy Summary" button exports all metrics as formatted text
- **Performance Data Export**: "Export JSON" button copies the raw `PerformancePoint[]` data

#### Access Points
- Copy buttons in each metric card header
- Action buttons in page header for bulk export

### 4. Cross-League Intelligence (`/cross-league`)

#### Cross-League Copy Features
- **League Selection Copy**: "Copy Selection" button exports selected league names
- **Correlation Data Export**: "Export Correlations" button copies correlation coefficients as JSON
- **Meta-Pattern Insights**: Individual "Copy" buttons on each insight card

#### Access Points
- Copy button in league selection area
- Export button in correlation heatmap section
- Copy buttons on each meta-pattern card

### 5. Phase 9 Components

#### Crowd Wisdom Display
- **Summary Copy**: Copy button in card header exports crowd consensus data
- **Divergence Analysis Copy**: Copy button in analysis section exports model vs crowd comparison

#### Market Integration
- **Value Bet Details Copy**: Individual copy buttons on each value bet card
- **Comprehensive Data**: Exports bookmaker, odds, expected value, confidence, and Kelly fraction

## Technical Implementation

### Core Components

#### `useCopyToClipboard` Hook
```typescript
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const { copy, isLoading, isSuccess, error } = useCopyToClipboard();
await copy('Text to copy');
```

**Features:**
- Modern clipboard API with fallback to `document.execCommand`
- Loading states and error handling
- Toast notifications for user feedback
- Works outside React as utility function

#### `CopyButton` Component
```typescript
import { CopyButton } from '@/components/common';

<CopyButton 
  text="text to copy"
  variant="outline"
  size="sm"
  successMessage="Custom success message"
>
  Copy Text
</CopyButton>
```

**Features:**
- Visual feedback (loading/success states)
- Icon animations
- Customizable variants and sizes
- Accessibility support

#### `CopyBadge` Component
```typescript
import { CopyBadge } from '@/components/common';

<CopyBadge 
  text="text to copy"
  showIcon={true}
  className="custom-class"
>
  Badge Content
</CopyBadge>
```

**Features:**
- Inline copy actions for IDs and short text
- Clickable badge design
- Icon support
- Hover and success states

### Browser Compatibility

#### Supported Browsers
- **Chrome 66+**: Full clipboard API support
- **Firefox 63+**: Full clipboard API support
- **Safari 13.1+**: Full clipboard API support
- **Edge 79+**: Full clipboard API support

#### Fallback Mechanism
For older browsers or non-secure contexts:
- Uses `document.execCommand('copy')` with temporary textarea
- Works in HTTP contexts (clipboard API requires HTTPS)
- Graceful degradation with error messages

## Usage Guidelines

### When to Use Copy Actions

1. **Sharing Model Configurations**: Use hyperparameter copy to share model setups
2. **Job Scheduling**: Copy cron expressions to reuse job schedules
3. **Analytics Reporting**: Export performance data for external analysis
4. **Research Collaboration**: Share cross-league insights and correlations
5. **Market Intelligence**: Copy value bet details for betting analysis

### Security Considerations

- Clipboard API requires HTTPS in production
- No sensitive data is automatically copied
- All copy actions are user-initiated
- Temporary DOM elements are cleaned up in fallback

### Performance Impact

- Minimal overhead - only activates on user interaction
- Asynchronous clipboard operations
- Efficient state management in hooks
- Optimized re-renders in components

## Testing

### Unit Tests Coverage
- Clipboard utility functions
- CopyButton and CopyBadge components
- ModelCard copy integration
- Error handling and fallback scenarios

### Test Commands
```bash
# Run clipboard-specific tests
npm run test -- clipboard

# Run all tests with coverage
npm run test:coverage
```

## Limitations

1. **HTTPS Requirement**: Modern clipboard API requires secure context
2. **Browser Support**: Very old browsers may not support any clipboard methods
3. **Text Only**: Current implementation supports text content only
4. **User Gesture Required**: All copy actions must be triggered by user interaction

## Future Enhancements

### Planned Improvements
- **Rich Content Support**: Copy formatted tables and charts as images
- **Bulk Operations**: Copy multiple items simultaneously
- **Copy History**: Maintain clipboard history within the application
- **Keyboard Shortcuts**: Global shortcuts for common copy actions
- **Export Formats**: Additional export formats (CSV, Excel, PDF)

### Integration Opportunities
- **API Integration**: Direct copy from API responses
- **Real-time Collaboration**: Shared clipboard for team features
- **Mobile Support**: Enhanced touch interactions for mobile devices

## Troubleshooting

### Common Issues

1. **Copy Not Working in Development**
   - Ensure using `localhost` or `https://`
   - Check browser console for clipboard permission errors

2. **Large Text Copy Fails**
   - Some browsers limit clipboard size (~2MB)
   - Consider chunking large data or using file export

3. **No Visual Feedback**
   - Check if toast notifications are properly configured
   - Verify CSS animations are not disabled

### Debug Information

Enable debug mode to see clipboard operation details:
```typescript
// In browser console
localStorage.setItem('debug-clipboard', 'true');
```

This will log detailed clipboard operation information to the console.

## Contributing

When adding new copy functionality:

1. Use the standardized `CopyButton` or `CopyBadge` components
2. Follow the established patterns for loading states
3. Include proper accessibility labels
4. Add appropriate success/error messages
5. Write unit tests for new functionality
6. Update this documentation

---

For questions or support with copy functionality, please refer to the technical implementation in:
- `/src/hooks/useCopyToClipboard.ts`
- `/src/components/common/CopyButton.tsx`
- `/src/components/common/CopyBadge.tsx`