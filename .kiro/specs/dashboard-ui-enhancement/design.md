# Design Document

## Overview

This design document outlines the enhancement of the dashboard UI to transform the Smart Insights and Category Breakdown sections from congested card-based layouts to flourished, full-width sections that match the Recent Activity section's design pattern. The goal is to create a more readable, spacious, and visually consistent dashboard experience.

## Architecture

### Current State Analysis
- **Smart Insights**: Currently wrapped in a card container (`SmartInsightsSection.tsx`) with padding and shadows
- **Category Breakdown**: Embedded within Smart Insights as a PieChart component with legend
- **Recent Activity**: Uses full-width design without card containers, directly styled in the main dashboard

### Target State Design
- **Smart Insights**: Transform to full-width section with integrated time period selector
- **Category Breakdown**: Separate full-width section with improved layout and spacing
- **Consistent Styling**: All sections follow the same visual hierarchy and spacing patterns

## Components and Interfaces

### 1. Enhanced SmartInsightsSection Component

**Location**: `src/components/dashboard/SmartInsightsSection.tsx`

**Design Changes**:
- Remove card container styling (background, padding, shadows, border radius)
- Implement full-width layout with section header pattern
- Integrate time period selector seamlessly into section header
- Improve chart spacing and readability
- Add consistent section dividers

**Props Interface** (Updated):
```typescript
interface SmartInsightsSectionProps {
  dashboardInsights: any;
  isLoading: boolean;
  onRefresh: (period: TimePeriod) => void;
  style?: ViewStyle; // New prop for external styling
}
```

### 2. New CategoryBreakdownSection Component

**Location**: `src/components/dashboard/CategoryBreakdownSection.tsx` (New)

**Design Approach**:
- Extract category breakdown logic from SmartInsightsSection
- Create dedicated full-width section component
- Implement improved pie chart and category list layout
- Add better spacing between chart and category items
- Include total amount display prominently

**Props Interface**:
```typescript
interface CategoryBreakdownSectionProps {
  categoryData: CategoryData[];
  totalAmount: number;
  timePeriod?: TimePeriod;
  isLoading?: boolean;
  onCategoryPress?: (category: CategoryData) => void;
  style?: ViewStyle;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon?: string;
}
```

### 3. Enhanced Dashboard Layout

**Location**: `src/screens/dashboard/DashboardScreen.tsx`

**Layout Structure**:
```
- Header (Welcome + Date)
- Total Balance Card (Existing)
- Recent Activity Section (Full-width, existing pattern)
- Smart Insights Section (Full-width, enhanced)
- Category Breakdown Section (Full-width, new)
- Goals Section (Existing)
- Quick Actions (Existing)
```

## Data Models

### Section Header Pattern
```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  showDivider?: boolean;
}
```

### Enhanced Category Data Model
```typescript
interface EnhancedCategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}
```

## Error Handling

### Loading States
- **Smart Insights**: Show skeleton loader for chart area while maintaining section structure
- **Category Breakdown**: Display loading indicators for both chart and category list
- **Graceful Degradation**: Show empty states with retry options when data is unavailable

### Error States
- **Network Errors**: Display retry buttons with clear error messages
- **Data Validation**: Handle malformed data gracefully with fallback displays
- **Chart Rendering**: Provide fallback content when charts fail to render

## Testing Strategy

### Unit Tests
- **Component Rendering**: Test all new components render correctly with various data states
- **Props Handling**: Verify proper handling of loading, error, and data states
- **User Interactions**: Test time period changes, category selections, and refresh actions

### Integration Tests
- **Dashboard Layout**: Verify proper section ordering and spacing
- **Data Flow**: Test data propagation from dashboard to section components
- **Responsive Behavior**: Ensure proper layout on different screen sizes

### Visual Regression Tests
- **Section Consistency**: Compare section styling consistency
- **Spacing Verification**: Ensure proper spacing between all sections
- **Typography Consistency**: Verify consistent text styling across sections

## Implementation Approach

### Phase 1: Smart Insights Enhancement
1. Remove card styling from SmartInsightsSection
2. Implement section header pattern
3. Integrate time period selector into header
4. Update chart spacing and layout
5. Add section dividers

### Phase 2: Category Breakdown Separation
1. Create new CategoryBreakdownSection component
2. Extract category logic from SmartInsightsSection
3. Implement enhanced category list design
4. Add total amount display
5. Integrate into dashboard layout

### Phase 3: Dashboard Integration
1. Update DashboardScreen layout
2. Implement consistent section spacing
3. Add section dividers between all sections
4. Ensure proper scroll behavior
5. Test responsive layout

### Phase 4: Polish and Optimization
1. Fine-tune spacing and typography
2. Add subtle animations for section transitions
3. Optimize performance for smooth scrolling
4. Implement accessibility improvements
5. Add comprehensive error handling

## Design Specifications

### Typography Hierarchy
- **Section Titles**: `typography.h3` (18px, bold)
- **Section Subtitles**: `typography.caption` (12px, secondary color)
- **Chart Labels**: `typography.body` (14px, regular)
- **Category Names**: `typography.body` (14px, semibold)
- **Category Amounts**: `typography.small` (12px, secondary color)

### Spacing System
- **Section Margins**: `spacing.md` (16px) between sections
- **Section Padding**: `spacing.md` (16px) horizontal padding
- **Header Spacing**: `spacing.sm` (12px) between title and content
- **Item Spacing**: `spacing.sm` (12px) between category items
- **Chart Margins**: `spacing.lg` (20px) around charts

### Color Scheme
- **Section Backgrounds**: Transparent (no cards)
- **Section Dividers**: `colors.border` with 0.5 opacity
- **Text Colors**: Follow existing color system
- **Chart Colors**: Use existing `colors.categories` array
- **Interactive Elements**: `colors.primary` for touchable areas

### Layout Patterns
- **Full-Width Sections**: No horizontal margins, consistent with Recent Activity
- **Section Headers**: Left-aligned title with optional right component
- **Content Spacing**: Consistent vertical rhythm throughout dashboard
- **Chart Containers**: Centered with appropriate margins
- **Category Lists**: Full-width with proper touch targets

## Accessibility Considerations

### Screen Reader Support
- **Section Headers**: Proper heading hierarchy for navigation
- **Chart Descriptions**: Meaningful descriptions for chart data
- **Category Items**: Clear labels with amounts and percentages
- **Interactive Elements**: Proper accessibility labels and hints

### Touch Targets
- **Minimum Size**: 44px minimum touch target size
- **Spacing**: Adequate spacing between interactive elements
- **Visual Feedback**: Clear pressed states for all touchable items

### Color Contrast
- **Text Readability**: Ensure proper contrast ratios
- **Chart Accessibility**: Use patterns in addition to colors where needed
- **Focus Indicators**: Clear focus states for keyboard navigation