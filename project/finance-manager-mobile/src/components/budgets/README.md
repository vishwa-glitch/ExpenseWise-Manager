# Budget Analytics Components

This directory contains React Native components for displaying budget analytics and insights.

## Components

### 1. BudgetAnalyticsSummary
Displays a summary of budget analytics including total budget, spent amount, remaining amount, and overall efficiency.

### 2. BudgetVarianceReport
Displays detailed budget variance analysis with charts and breakdowns.

## Usage

```tsx
import {
  BudgetAnalyticsSummary,
  BudgetVarianceReport,
} from '../components/budgets';

// In your component
<BudgetAnalyticsSummary analytics={analyticsData} />
<BudgetVarianceReport varianceReport={varianceData} />
```

## API Integration

These components expect data from the budget analytics API endpoints:
- `GET /api/budgets/analytics` - For BudgetAnalyticsSummary
- `GET /api/budgets/variance-report` - For BudgetVarianceReport

## Styling

All components use the shared design system:
- Colors from `constants/colors.ts`
- Typography from `constants/colors.ts`
- Spacing from `constants/colors.ts`

## Features

- Responsive design
- Loading states
- Error handling
- Accessibility support
- Dark/light theme support

## Testing

Each component includes unit tests in the `__tests__` directory.

## Dependencies

- React Native
- Expo Vector Icons
- React Native SVG (for charts)
- Victory Native (for charts)

## Performance Considerations

- Components are optimized for large datasets
- Charts use virtualization for better performance
- Images are cached and optimized
