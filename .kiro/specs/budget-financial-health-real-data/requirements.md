# Requirements Document

## Introduction

This feature enhances the existing Budget Status and Weekly Financial Health sections on the dashboard to use real data from the backend APIs instead of mock data. The components will integrate with the budget and analytics APIs to display accurate, up-to-date financial information while maintaining the full-width mobile design and preventing UI overflow issues.

## Requirements

### Requirement 1

**User Story:** As a user, I want the Budget Status section to display real budget data from my accounts, so that I can see accurate information about my current spending against my budgets.

#### Acceptance Criteria

1. WHEN the user views the Budget Status section THEN it SHALL fetch and display real budget data from the `/api/budgets` endpoint
2. WHEN budget data is available THEN the section SHALL calculate total budget amount, total spent amount, and percentage used from actual budget records
3. WHEN no budget data exists THEN the section SHALL display an appropriate empty state encouraging the user to create budgets
4. WHEN budget data is loading THEN the section SHALL show a loading skeleton while maintaining the section layout
5. WHEN the user has exceeded their budget THEN the section SHALL display the over-budget amount and visual indicators clearly

### Requirement 2

**User Story:** As a user, I want the Weekly Financial Health section to use real transaction and goal data, so that I can see accurate insights about my financial behavior.

#### Acceptance Criteria

1. WHEN the user views the Weekly Financial Health section THEN it SHALL fetch real data from `/api/insights/weekly-report` endpoint
2. WHEN calculating the overall score THEN the system SHALL use actual spending patterns, budget adherence, and goal progress from user data
3. WHEN displaying achievements and warnings THEN the system SHALL generate them based on real transaction data and budget performance
4. WHEN showing weekly statistics THEN the section SHALL display actual spending amounts, budget comparisons, and percentage changes from real data
5. WHEN the user has no sufficient data THEN the section SHALL show helpful guidance on how to improve their financial health score

### Requirement 3

**User Story:** As a user, I want both sections to be responsive and prevent text overflow, so that all information is clearly visible on my mobile device.

#### Acceptance Criteria

1. WHEN the sections are displayed on mobile devices THEN all text SHALL wrap properly and not extend beyond screen boundaries
2. WHEN displaying star ratings THEN they SHALL be contained within the section width and not cause horizontal overflow
3. WHEN showing currency amounts THEN they SHALL be formatted consistently and truncate gracefully if needed
4. WHEN the content is too long THEN the sections SHALL use appropriate text wrapping and ellipsis where necessary

### Requirement 4

**User Story:** As a user, I want the sections to handle errors gracefully, so that I can still use the dashboard even when some data is unavailable.

#### Acceptance Criteria

1. WHEN API calls fail THEN the sections SHALL display user-friendly error messages with retry options
2. WHEN network connectivity is poor THEN the sections SHALL show appropriate loading states and timeout handling
3. WHEN partial data is available THEN the sections SHALL display what they can and indicate what information is missing
4. WHEN the user taps retry THEN the sections SHALL attempt to reload the data and update the display accordingly

### Requirement 5

**User Story:** As a user, I want the sections to refresh automatically when I make changes to my budgets or transactions, so that the information stays current.

#### Acceptance Criteria

1. WHEN the user creates, updates, or deletes a budget THEN the Budget Status section SHALL refresh automatically to reflect changes
2. WHEN the user adds new transactions THEN the Weekly Financial Health section SHALL update to include the new data
3. WHEN the user pulls to refresh the dashboard THEN both sections SHALL reload their data from the APIs
4. WHEN data updates successfully THEN the sections SHALL animate smoothly to show the new information