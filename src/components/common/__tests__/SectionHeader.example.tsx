import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { SectionHeader } from '../SectionHeader';

// Example usage of SectionHeader component
// This demonstrates all the features and props

export const SectionHeaderExamples = () => {
  return (
    <>
      {/* Basic usage - just title */}
      <SectionHeader title="Recent Activity" />

      {/* With subtitle */}
      <SectionHeader 
        title="Smart Insights" 
        subtitle="Your spending patterns" 
      />

      {/* With right component (See All button) */}
      <SectionHeader 
        title="Recent Activity" 
        rightComponent={
          <TouchableOpacity>
            <Text style={{ color: '#2E7D57', fontWeight: '600' }}>See All</Text>
          </TouchableOpacity>
        }
      />

      {/* With divider */}
      <SectionHeader 
        title="Category Breakdown" 
        showDivider={true}
      />

      {/* Complex example with all props */}
      <SectionHeader 
        title="Smart Insights" 
        subtitle="Weekly overview"
        showDivider={true}
        rightComponent={
          <TouchableOpacity>
            <Text style={{ color: '#2E7D57', fontWeight: '600' }}>Refresh</Text>
          </TouchableOpacity>
        }
        style={{ backgroundColor: '#F8F9FA' }}
        titleStyle={{ color: '#2E7D57' }}
        subtitleStyle={{ fontStyle: 'italic' }}
      />
    </>
  );
};

// This demonstrates how the component would be used in the dashboard
export const DashboardSectionHeaderUsage = () => {
  return (
    <>
      {/* Recent Activity Section Header */}
      <SectionHeader 
        title="Recent Activity" 
        rightComponent={
          <TouchableOpacity>
            <Text style={{ color: '#2E7D57', fontWeight: '600' }}>See All</Text>
          </TouchableOpacity>
        }
      />

      {/* Smart Insights Section Header with Time Period Selector */}
      <SectionHeader 
        title="Smart Insights" 
        rightComponent={
          // This would be the TimePeriodSelector component
          <TouchableOpacity>
            <Text style={{ color: '#2E7D57', fontWeight: '600' }}>Monthly ▼</Text>
          </TouchableOpacity>
        }
      />

      {/* Category Breakdown Section Header */}
      <SectionHeader 
        title="Category Breakdown" 
        subtitle="This month's spending"
      />
    </>
  );
};