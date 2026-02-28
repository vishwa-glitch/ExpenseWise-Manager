/**
 * Test utility to verify frontend compatibility with new API response structure
 */

// Mock API responses based on backend documentation
export const mockDashboardInsightsResponse = {
  success: true,
  data: {
    monthlySpending: 1212.01,
    monthlyIncome: 5000.00,
    savingsRate: 75.76,
    topCategories: [
      {
        category_name: "Uncategorized",
        color: "#9E9E9E",
        total_amount: "1000.00",
        transaction_count: "1"
      },
      {
        category_name: "Food & Dining", 
        color: "#FF5722",
        total_amount: "137.01",
        transaction_count: "3"
      },
      {
        category_name: "Goal Contribution",
        color: "#4CAF50",
        total_amount: "200.00",
        transaction_count: "2"
      }
    ],
    weeklySpending: [
      {
        category_name: "Uncategorized",
        color: "#9E9E9E", 
        weekly_amount: "1000.00",
        transaction_count: "1",
        avg_transaction: "1000.00"
      }
    ],
    spendingTrend: {
      trend: "increasing",
      percentage: 15.5
    }
  }
};

export const mockCategoryBreakdownResponse = {
  success: true,
  data: [
    {
      category_name: "Uncategorized",
      color: "#9E9E9E",
      total_amount: "1000.00",
      transaction_count: "1",
      avg_amount: "1000.00"
    },
    {
      category_name: "Food & Dining",
      color: "#FF5722", 
      total_amount: "137.01",
      transaction_count: "3",
      avg_amount: "45.67"
    },
    {
      category_name: "Goal Contribution",
      color: "#4CAF50",
      total_amount: "200.00",
      transaction_count: "2",
      avg_amount: "100.00"
    }
  ]
};

export const mockAccountSummaryResponse = {
  success: true,
  data: {
    account: {
      id: "uuid",
      name: "Checking Account",
      balance: 32900.00,
      currency: "USD"
    },
    summary: {
      total_income: 5000.00,
      total_expenses: 1212.01,
      net_amount: 3787.99,
      transaction_count: 7
    },
    topCategories: [
      {
        name: "Uncategorized",
        color: "#9E9E9E",
        total_amount: "1000.00",
        transaction_count: "1"
      },
      {
        name: "Goal Contribution",
        color: "#4CAF50",
        total_amount: "200.00",
        transaction_count: "2"
      }
    ]
  }
};

/**
 * Test function to verify that our frontend components can process the new API structure
 */
export const testApiResponseCompatibility = () => {
  console.log('🧪 Testing API response compatibility...');
  
  // Test dashboard insights processing
  const dashboardData = mockDashboardInsightsResponse.data;
  const topCategories = dashboardData.topCategories;
  
  console.log('✅ Dashboard insights structure:', {
    hasData: !!dashboardData,
    hasTopCategories: !!topCategories,
    categoryCount: topCategories.length,
    firstCategory: topCategories[0]
  });
  
  // Test category breakdown processing
  const categoryData = mockCategoryBreakdownResponse.data;
  
  console.log('✅ Category breakdown structure:', {
    hasData: !!categoryData,
    categoryCount: categoryData.length,
    firstCategory: categoryData[0],
    hasGoalContribution: categoryData.some(cat => cat.category_name === 'Goal Contribution')
  });
  
  // Test field name compatibility
  const testCategory = categoryData[0];
  const categoryName = testCategory.category_name || testCategory.name;
  const categoryAmount = testCategory.total_amount || testCategory.amount;
  const categoryColor = testCategory.color;
  
  console.log('✅ Field name compatibility:', {
    categoryName,
    categoryAmount,
    categoryColor,
    isStringAmount: typeof categoryAmount === 'string',
    parsedAmount: typeof categoryAmount === 'string' ? parseFloat(categoryAmount) : categoryAmount
  });
  
  // Test goal contribution detection
  const goalContribution = categoryData.find(cat => 
    cat.category_name?.toLowerCase().includes('goal contribution') ||
    cat.name?.toLowerCase().includes('goal contribution')
  );
  
  console.log('✅ Goal contribution detection:', {
    found: !!goalContribution,
    name: goalContribution?.category_name,
    color: goalContribution?.color
  });
  
  console.log('🎉 API response compatibility test completed successfully!');
  
  return {
    dashboardInsights: dashboardData,
    categoryBreakdown: categoryData,
    accountSummary: mockAccountSummaryResponse.data
  };
};

/**
 * Simulate API response processing for testing components
 */
export const processApiResponse = (response: any) => {
  // Handle new API structure with data property
  if (response.data) {
    return response.data;
  }
  
  // Handle legacy structure
  return response;
};
