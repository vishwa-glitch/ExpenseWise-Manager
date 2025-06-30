import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchTransactionCalendar } from '../../store/slices/transactionsSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';

interface TransactionCalendarScreenProps {
  navigation: any;
}

const TransactionCalendarScreen: React.FC<TransactionCalendarScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Date filter states
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);

  const { calendarData } = useTypedSelector((state) => state.transactions);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      loadCalendarData();
    }
  }, [currentDate, isAuthenticated]);

  const loadCalendarData = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping calendar data load - user not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      if (isDateRangeActive && selectedStartDate && selectedEndDate) {
        // Load data for date range
        await dispatch(fetchTransactionCalendar({
          startDate: selectedStartDate,
          endDate: selectedEndDate,
        }));
      } else {
        // Load data for current month
        await dispatch(fetchTransactionCalendar({
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
        }));
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (isDateRangeActive) return; // Don't allow month navigation when date range is active
    
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateRangeFilter = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      Alert.alert('Invalid Date Range', 'Please select both start and end dates.');
      return;
    }

    if (new Date(selectedStartDate) > new Date(selectedEndDate)) {
      Alert.alert('Invalid Date Range', 'Start date must be before end date.');
      return;
    }

    setIsDateRangeActive(true);
    setShowDateFilter(false);
    await loadCalendarData();
  };

  const clearDateFilter = async () => {
    setIsDateRangeActive(false);
    setSelectedStartDate('');
    setSelectedEndDate('');
    setShowDateFilter(false);
    await loadCalendarData();
  };

  const getDaysInMonth = () => {
    if (isDateRangeActive) {
      // For date range, we'll show a simplified view
      return [];
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getTransactionDataForDay = (day: number) => {
    if (!calendarData?.calendar_data) return null;
    return calendarData.calendar_data[day.toString()];
  };

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, getDefaultCurrency(), { maximumFractionDigits: 0 });
  };

  const renderCalendarDay = (day: number | null, index: number) => {
    if (!day) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const dayData = getTransactionDataForDay(day);
    const hasTransactions = dayData && (dayData.income > 0 || dayData.expenses > 0);
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          isToday && styles.today,
          hasTransactions && styles.dayWithTransactions,
        ]}
        onPress={() => {
          if (hasTransactions) {
            // Navigate to transactions list for this specific day
            navigation.navigate('TransactionsMain', {
              screen: 'AllTransactions',
              params: {
                filterDate: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
              },
            });
          }
        }}
        disabled={!hasTransactions}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.todayText,
          hasTransactions && styles.dayWithTransactionsText,
        ]}>
          {day}
        </Text>
        
        {hasTransactions && (
          <View style={styles.transactionSummary}>
            {dayData.income > 0 && (
              <Text style={styles.incomeAmount}>
                +{formatAmount(dayData.income)}
              </Text>
            )}
            {dayData.expenses > 0 && (
              <Text style={styles.expenseAmount}>
                -{formatAmount(dayData.expenses)}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getDateRangeSummary = () => {
    if (!isDateRangeActive || !calendarData) {
      return { totalIncome: 0, totalExpenses: 0, netAmount: 0, transactionCount: 0 };
    }

    // Calculate summary from the date range data
    const summary = calendarData.summary || {};
    return {
      totalIncome: summary.total_income || 0,
      totalExpenses: summary.total_expenses || 0,
      netAmount: (summary.total_income || 0) - (summary.total_expenses || 0),
      transactionCount: summary.transaction_count || 0,
    };
  };

  const getMonthSummary = () => {
    if (isDateRangeActive) {
      return getDateRangeSummary();
    }

    if (!calendarData?.calendar_data) {
      return { totalIncome: 0, totalExpenses: 0, netAmount: 0, transactionCount: 0 };
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;

    Object.values(calendarData.calendar_data).forEach((dayData: any) => {
      totalIncome += dayData.income || 0;
      totalExpenses += dayData.expenses || 0;
      transactionCount += dayData.transaction_count || 0;
    });

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount,
    };
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderDateFilterModal = () => (
    <Modal
      visible={showDateFilter}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDateFilter(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by Date Range</Text>
          
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <TextInput
              style={styles.dateInput}
              value={selectedStartDate}
              onChangeText={setSelectedStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>End Date</Text>
            <TextInput
              style={styles.dateInput}
              value={selectedEndDate}
              onChangeText={setSelectedEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.quickDateButtons}>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setSelectedStartDate(formatDateForInput(lastWeek));
                setSelectedEndDate(formatDateForInput(today));
              }}
            >
              <Text style={styles.quickDateText}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                setSelectedStartDate(formatDateForInput(lastMonth));
                setSelectedEndDate(formatDateForInput(today));
              }}
            >
              <Text style={styles.quickDateText}>Last 30 Days</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <CustomButton
              title="Cancel"
              onPress={() => setShowDateFilter(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <CustomButton
              title="Apply Filter"
              onPress={handleDateRangeFilter}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDateRangeView = () => {
    const summary = getDateRangeSummary();
    
    return (
      <View style={styles.dateRangeView}>
        <View style={styles.dateRangeHeader}>
          <Text style={styles.dateRangeTitle}>
            {formatDateForDisplay(selectedStartDate)} - {formatDateForDisplay(selectedEndDate)}
          </Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearDateFilter}
          >
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateRangeSummary}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              +{formatAmount(summary.totalIncome)}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💸</Text>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              -{formatAmount(summary.totalExpenses)}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryLabel}>Net Amount</Text>
            <Text style={[
              styles.summaryValue,
              { color: summary.netAmount >= 0 ? colors.income : colors.expense }
            ]}>
              {summary.netAmount >= 0 ? '+' : ''}{formatAmount(summary.netAmount)}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🔢</Text>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryValue}>
              {summary.transactionCount}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewTransactionsButton}
          onPress={() => {
            navigation.navigate('TransactionsMain', {
              screen: 'AllTransactions',
              params: {
                startDate: selectedStartDate,
                endDate: selectedEndDate,
              },
            });
          }}
        >
          <Text style={styles.viewTransactionsText}>View All Transactions</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const summary = getMonthSummary();
  const monthName = isDateRangeActive 
    ? `${formatDateForDisplay(selectedStartDate)} - ${formatDateForDisplay(selectedEndDate)}`
    : currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Filter Controls */}
        <View style={styles.filterControls}>
          <TouchableOpacity
            style={[styles.filterButton, isDateRangeActive && styles.filterButtonActive]}
            onPress={() => setShowDateFilter(true)}
          >
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={[styles.filterText, isDateRangeActive && styles.filterTextActive]}>
              {isDateRangeActive ? 'Date Range Active' : 'Filter by Date Range'}
            </Text>
          </TouchableOpacity>
          
          {isDateRangeActive && (
            <TouchableOpacity
              style={styles.clearAllFiltersButton}
              onPress={clearDateFilter}
            >
              <Text style={styles.clearAllFiltersText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Month Navigation or Date Range Display */}
        {!isDateRangeActive ? (
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthName}</Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderDateRangeView()
        )}

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: colors.income }]}>
              +{formatAmount(summary.totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: colors.expense }]}>
              -{formatAmount(summary.totalExpenses)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[
              styles.summaryAmount,
              { color: summary.netAmount >= 0 ? colors.income : colors.expense }
            ]}>
              {summary.netAmount >= 0 ? '+' : ''}{formatAmount(summary.netAmount)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryAmount}>
              {summary.transactionCount}
            </Text>
          </View>
        </View>

        {/* Calendar Grid (only show for monthly view) */}
        {!isDateRangeActive && (
          <View style={styles.calendar}>
            {/* Week day headers */}
            <View style={styles.weekHeader}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {getDaysInMonth().map((day, index) => renderCalendarDay(day, index))}
            </View>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.income }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.expense }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <LoadingSpinner />
          </View>
        )}
      </ScrollView>

      {/* Date Filter Modal */}
      {renderDateFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  filterControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  filterText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.primary,
  },
  clearAllFiltersButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  clearAllFiltersText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  monthTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  dateRangeView: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  dateRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateRangeTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    flex: 1,
  },
  clearFilterButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  clearFilterText: {
    ...typography.small,
    color: colors.background,
    fontWeight: 'bold',
  },
  dateRangeSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewTransactionsButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewTransactionsText: {
    ...typography.body,
    color: colors.background,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryAmount: {
    ...typography.h3,
    fontWeight: 'bold',
  },
  calendar: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekDay: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '14.28%',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    height: 60,
  },
  calendarDay: {
    width: '14.28%',
    height: 60,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 1,
  },
  today: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayWithTransactions: {
    backgroundColor: colors.surface,
  },
  dayNumber: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  dayWithTransactionsText: {
    fontWeight: 'bold',
  },
  transactionSummary: {
    alignItems: 'center',
  },
  incomeAmount: {
    ...typography.small,
    color: colors.income,
    fontSize: 8,
    fontWeight: 'bold',
  },
  expenseAmount: {
    ...typography.small,
    color: colors.expense,
    fontSize: 8,
    fontWeight: 'bold',
  },
  legend: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.caption,
    color: colors.text,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dateInputContainer: {
    marginBottom: spacing.lg,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  quickDateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  quickDateButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  quickDateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default TransactionCalendarScreen;