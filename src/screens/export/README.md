# Export Functionality

This module provides comprehensive export functionality for transactions in multiple formats (Excel, CSV, PDF) with subscription-based access control.

## Features

### Export Formats
- **Excel (.xlsx)**: Professional spreadsheet with formatting and charts
- **CSV**: Simple comma-separated values file for data analysis
- **PDF**: Professional PDF report with styling and layout

### Subscription Tiers
- **Free Tier**: Limited to 1 export per month
- **Premium Tier**: Unlimited exports with all formats available

### Date Range Selection
- Custom date range picker
- Defaults to current month
- Validation to ensure start date ≤ end date

### File Sharing
- Native file sharing on mobile devices
- Automatic file naming with date range
- Support for email, cloud storage, and other apps

## Components

### ExportScreen
Main export screen with full functionality:
- Format selection with visual indicators
- Date range picker
- Export summary
- Subscription limit display
- Premium upgrade prompts

### ExportSection
Reusable component for quick export access:
- Embedded in Dashboard, Transactions, and More screens
- Quick export buttons for current month
- Subscription status display
- Navigation to full export screen

## Usage

### Navigation
```typescript
// Navigate to export screen
navigation.navigate('Export');

// From More screen menu
// "Export Data" menu item

// From Dashboard/Transactions
// ExportSection component
```

### API Integration
```typescript
// Export transactions
const exportData = await apiService.exportTransactions(
  format, // 'excel' | 'csv' | 'pdf'
  startDate, // 'YYYY-MM-DD'
  endDate   // 'YYYY-MM-DD'
);
```

### File Handling
```typescript
// Create and share file
const fileName = `transactions_${startDate}_to_${endDate}.${format}`;
const fileUri = `${FileSystem.documentDirectory}${fileName}`;

await FileSystem.writeAsStringAsync(fileUri, exportData, {
  encoding: FileSystem.EncodingType.Base64,
});

await Sharing.shareAsync(fileUri, {
  mimeType: getMimeType(format),
  dialogTitle: `Export Transactions (${format.toUpperCase()})`,
});
```

## Backend Integration

The export functionality integrates with the backend API endpoints:

- `GET /api/transactions/export?format={format}&start_date={date}&end_date={date}`
- Supports Excel, CSV, and PDF formats
- Returns blob data for file creation
- Includes subscription tier validation

## Subscription Limits

### Free Tier
- 1 export per month
- CSV format only
- Basic data export

### Premium Tier
- Unlimited exports
- All formats (Excel, CSV, PDF)
- Professional formatting
- Advanced features

## Error Handling

- Network connectivity issues
- File system permissions
- Subscription limit exceeded
- Invalid date ranges
- Export failures

## Testing

Run the test suite:
```bash
npm test -- --testPathPattern=ExportScreen.test.tsx
```

Tests cover:
- Component rendering
- Format selection
- Subscription tier display
- Navigation
- Error scenarios

## Dependencies

- `expo-file-system`: File creation and management
- `expo-sharing`: Native file sharing
- `@react-native-community/datetimepicker`: Date selection
- Redux store for state management
- API service for backend communication

## Future Enhancements

- Batch export functionality
- Custom export templates
- Scheduled exports
- Export history tracking
- Advanced filtering options
- Multi-currency support
- Account-specific exports
