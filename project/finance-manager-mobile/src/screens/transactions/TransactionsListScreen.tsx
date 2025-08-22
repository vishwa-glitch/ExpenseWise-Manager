import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SectionList,
  Modal,
} from "react-native";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import {
  fetchTransactions,
  deleteTransaction,
} from "../../store/slices/transactionsSlice";
import { TransactionItem } from "../../components/common/TransactionItem";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { colors, spacing } from "../../constants/colors";

// Enhanced filter components
import SearchBar from "../../components/transactions/SearchBar";
import TransactionFilters from "../../components/transactions/TransactionFilters";

// Enhanced hooks
import { useSearchWithDebounce } from "../../hooks/useSearchWithDebounce";
import { useTransactionFilters } from "../../hooks/useTransactionFilters";
import { hasActiveFilters } from "../../utils/filterValidation";

interface TransactionsListScreenProps {
  navigation: any;
  route?: any;
}

const TransactionsListScreen: React.FC<TransactionsListScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const { transactions, pagination, isLoading } = useTypedSelector(
    (state) => state.transactions
  );
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  // Get accountId, filterDate, startDate, and endDate from route params
  const { accountId, filterDate, startDate, endDate } = route?.params || {};

  // Enhanced filtering hooks
  const {
    filterState,
    setTimePeriod,
    toggleCategory,
    setTransactionType,
    setCustomDateRange,
    clearAllFilters,
    getQueryParams,
    hasActiveFilters: hasActiveFiltersFromHook,
    getFilterDescription,
  } = useTransactionFilters();

  // Debounced search
  const { searchQuery, setSearchQuery: setLocalSearchQuery } =
    useSearchWithDebounce({
      onSearch: () => {}, // We'll handle search in the main query
      debounceMs: 300,
    });

  const loadData = useCallback(
    async (page = 1, reset = true) => {
      if (!isAuthenticated) {
        console.log(
          "🚫 Skipping transactions data load - user not authenticated"
        );
        return;
      }

      try {
        console.log("📋 Loading transactions data for authenticated user");

        // Build query parameters from filters
        const filterParams = getQueryParams();

        const params: any = {
          page,
          limit: 20,
          ...filterParams,
        };

        // Add search query if present
        if (searchQuery.trim()) {
          params.searchQuery = searchQuery.trim();
        }

        // Legacy support for route params
        if (accountId) {
          params.accountId = accountId;
        }
        if (filterDate) {
          params.date = filterDate;
        }

        // Handle date range from calendar screen
        if (startDate && endDate) {
          params.dateRange = {
            startDate,
            endDate,
          };
        }

        console.log("🔍 Query params:", params);
        await dispatch(fetchTransactions(params));

        if (reset) {
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    },
    [
      isAuthenticated,
      accountId,
      filterDate,
      startDate,
      endDate,
      getQueryParams,
      searchQuery,
      dispatch,
    ]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [
    isAuthenticated,
    accountId,
    filterDate,
    startDate,
    endDate,
    hasActiveFiltersFromHook,
    loadData,
  ]);

  // Load data when filters change
  useEffect(() => {
    if (isAuthenticated && hasActiveFiltersFromHook) {
      loadData(1, true);
    }
  }, [filterState, isAuthenticated, hasActiveFiltersFromHook, loadData]);

  useEffect(() => {
    if (transactions.length > 0) {
      const grouped = groupAndCalculateRunningBalance(transactions);

      // Expand all groups by default
      const allGroups = new Set(grouped.map((group) => group.title));
      setExpandedGroups(allGroups);
    }
  }, [transactions]);

  // Handle search changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData(1, true);
    }
  }, [searchQuery, isAuthenticated, loadData]);

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log("🚫 Skipping refresh - user not authenticated");
      return;
    }

    setRefreshing(true);
    await loadData(1, true);
    setRefreshing(false);
  };

  const loadMoreTransactions = async () => {
    if (loadingMore || !pagination || currentPage >= pagination.pages) {
      return;
    }

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await loadData(nextPage, false);
    setCurrentPage(nextPage);
    setLoadingMore(false);
  };

  const groupAndCalculateRunningBalance = (transactionsList: any[]) => {
    // Helper function to extract date key without timezone issues
    const getDateKey = (transaction: any) => {
      if (transaction.transaction_date.includes("T")) {
        // If it's an ISO string, extract the date part
        return transaction.transaction_date.split("T")[0];
      } else if (transaction.transaction_date.includes(" ")) {
        // If it's a datetime string, extract the date part
        return transaction.transaction_date.split(" ")[0];
      } else {
        // If it's already just a date, use it as is
        return transaction.transaction_date;
      }
    };

    // Sort transactions by date string (newest first) - avoid new Date() for sorting
    const sortedTransactions = [...transactionsList].sort((a, b) => {
      const dateA = getDateKey(a);
      const dateB = getDateKey(b);
      // String comparison works for YYYY-MM-DD format
      return dateB.localeCompare(dateA);
    });

    // Group by date key (string-based grouping)
    const groupedByDate: { [key: string]: any[] } = {};
    let runningBalance = 0; // Start with 0 or get from account balance

    // First pass: group by date using string keys
    sortedTransactions.forEach((transaction) => {
      const dateKey = getDateKey(transaction);

      // Debug logging to see what's happening
      console.log(
        `📅 Transaction date: ${transaction.transaction_date} → Group key: ${dateKey}`
      );

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(transaction);
    });

    // Second pass: calculate running balance for each transaction
    const result = Object.entries(groupedByDate).map(
      ([dateKey, transactions]) => {
        // Sort transactions within the day by time if available, otherwise maintain order
        const sortedDayTransactions = [...transactions].sort((a, b) => {
          // If we have time information, use it for sorting within the day
          if (
            a.transaction_date.includes("T") &&
            b.transaction_date.includes("T")
          ) {
            return b.transaction_date.localeCompare(a.transaction_date);
          }
          // Otherwise maintain the original order
          return 0;
        });

        // Calculate running balance for each transaction
        const transactionsWithBalance = sortedDayTransactions.map(
          (transaction) => {
            // Update running balance based on transaction type
            if (transaction.type.toLowerCase() === "income") {
              runningBalance += transaction.amount;
            } else {
              runningBalance -= transaction.amount;
            }

            return {
              ...transaction,
              runningBalance,
            };
          }
        );

        return {
          title: dateKey, // Keep the date string as-is for grouping
          data: transactionsWithBalance,
          totalAmount: transactionsWithBalance.reduce(
            (sum, t) =>
              t.type.toLowerCase() === "income"
                ? sum + t.amount
                : sum - t.amount,
            0
          ),
        };
      }
    );

    // Sort the result by date (newest first) using string comparison
    return result.sort((a, b) => b.title.localeCompare(a.title));
  };

  const handleTransactionPress = (transaction: any) => {
    navigation.navigate("TransactionDetail", {
      transactionId: transaction.id,
      transaction,
    });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteTransaction(transactionId)).unwrap();
              // Refresh the list
              await loadData(1, true);
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete transaction. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleEditTransaction = (transaction: any) => {
    navigation.navigate("AddEditTransaction", {
      transactionId: transaction.id,
      transaction,
    });
  };

  const formatFilterDate = (dateString: string) => {
    // Parse date safely to avoid timezone issues
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);

    // Create date in local timezone to avoid shifts
    const date = new Date(year, month, day);

    // Manual formatting to avoid timezone issues
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const weekday = weekdays[date.getDay()];
    const monthName = months[date.getMonth()];

    return `${weekday}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatDateForDisplay = (dateString: string) => {
    // Parse date safely to avoid timezone issues
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);

    // Create date in local timezone to avoid shifts
    const date = new Date(year, month, day);

    // Manual formatting to avoid timezone issues
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const weekday = weekdays[date.getDay()];
    const monthName = months[date.getMonth()];

    return `${weekday}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const toggleGroupExpansion = (groupTitle: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle);
      } else {
        newSet.add(groupTitle);
      }
      return newSet;
    });
  };

  const renderTransactionItem = ({ item }: { item: any }) => {
    return (
      <TransactionItem
        transaction={item}
        onPress={() => handleTransactionPress(item)}
        onLongPress={() => handleDeleteTransaction(item.id)}
        onEdit={() => handleEditTransaction(item)}
        onDelete={() => handleDeleteTransaction(item.id)}
        showAccount={!accountId}
        runningBalance={item.runningBalance}
      />
    );
  };

  const renderSectionHeader = ({ section }: { section: any }) => {
    // Use our timezone-safe formatting function
    const formattedDate = formatDateForDisplay(section.title);
    const isExpanded = expandedGroups.has(section.title);

    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleGroupExpansion(section.title)}
      >
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionHeaderIcon}>{isExpanded ? "▼" : "▶"}</Text>
          <Text style={styles.sectionHeaderDate}>{formattedDate}</Text>
        </View>
        <View style={styles.sectionHeaderRight}>
          <Text
            style={[
              styles.sectionHeaderAmount,
              {
                color:
                  section.totalAmount >= 0 ? colors.income : colors.expense,
              },
            ]}
          >
            {`${section.totalAmount >= 0 ? "+" : ""}₹${Math.abs(
              section.totalAmount
            ).toLocaleString("en-IN")}`}
          </Text>
          <Text style={styles.sectionHeaderCount}>
            {section.data.length} transactions
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Date Filter Display */}
      {filterDate && (
        <View style={styles.dateFilterContainer}>
          <Text style={styles.dateFilterLabel}>Showing transactions for:</Text>
          <Text style={styles.dateFilterValue}>
            {formatFilterDate(filterDate)}
          </Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              // Navigate back to all transactions without date filter
              navigation.setParams({ filterDate: undefined });
            }}
          >
            <Text style={styles.clearFilterText}>Show All Transactions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Range Filter Display */}
      {startDate && endDate && (
        <View style={styles.dateFilterContainer}>
          <Text style={styles.dateFilterLabel}>
            Showing transactions for date range:
          </Text>
          <Text style={styles.dateFilterValue}>
            {formatFilterDate(startDate)} - {formatFilterDate(endDate)}
          </Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              // Navigate back to all transactions without date range filter
              navigation.setParams({
                startDate: undefined,
                endDate: undefined,
              });
            }}
          >
            <Text style={styles.clearFilterText}>Show All Transactions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Enhanced Search Bar */}
      <SearchBar
        value={searchQuery}
        onSearch={setLocalSearchQuery}
        placeholder="Search transactions..."
      />

      {/* Filters Button */}
      <View style={styles.filtersButtonContainer}>
        <TouchableOpacity
          style={[
            styles.filtersButton,
            hasActiveFiltersFromHook && styles.filtersButtonActive
          ]}
          onPress={() => setShowFiltersModal(true)}
        >
          <Text style={styles.filtersButtonIcon}>🔍</Text>
          <Text style={[
            styles.filtersButtonText,
            hasActiveFiltersFromHook && styles.filtersButtonTextActive
          ]}>
            Filters
            {hasActiveFiltersFromHook && " (Active)"}
          </Text>
        </TouchableOpacity>
        
        {hasActiveFiltersFromHook && (
          <TouchableOpacity
            style={styles.clearAllFiltersButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.clearAllFiltersText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Summary */}
      {hasActiveFiltersFromHook && (
        <View style={styles.filterSummaryContainer}>
          <Text style={styles.filterSummaryText}>{getFilterDescription()}</Text>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {transactions.length} transactions
          {pagination && ` (${pagination.total} total)`}
          {filterDate && " on selected date"}
          {startDate && endDate && " in selected date range"}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {hasActiveFiltersFromHook || searchQuery
          ? "No Matching Transactions"
          : filterDate
          ? "No Transactions on This Date"
          : startDate && endDate
          ? "No Transactions in This Date Range"
          : "No Transactions Yet"}
      </Text>
      <Text style={styles.emptyMessage}>
        {hasActiveFiltersFromHook || searchQuery
          ? "Try adjusting your filters or search terms"
          : filterDate
          ? "No transactions were recorded on this date"
          : startDate && endDate
          ? "No transactions were recorded in this date range"
          : "Add your first transaction to get started tracking your finances"}
      </Text>
      {(hasActiveFiltersFromHook || searchQuery) && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={() => {
            clearAllFilters();
            setLocalSearchQuery("");
          }}
        >
          <Text style={styles.clearFiltersText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
      {!hasActiveFiltersFromHook &&
        !searchQuery &&
        !filterDate &&
        !startDate &&
        !endDate && (
          <TouchableOpacity
            style={styles.addFirstTransactionButton}
            onPress={() =>
              navigation.navigate("AddEditTransaction", { accountId })
            }
          >
            <Text style={styles.addFirstTransactionText}>Add Transaction</Text>
          </TouchableOpacity>
        )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingMore}>
        <LoadingSpinner size="small" />
        <Text style={styles.loadingMoreText}>Loading more transactions...</Text>
      </View>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFiltersModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFiltersModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFiltersModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Transaction Filters */}
          <TransactionFilters
            activeTimePeriod={filterState.timePeriod}
            activeCategories={filterState.categories}
            activeType={filterState.transactionType}
            onTimePeriodChange={setTimePeriod}
            onCategoryToggle={toggleCategory}
            onTypeChange={setTransactionType}
            onCustomDateRange={setCustomDateRange}
            onClearFilters={clearAllFilters}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => {
                clearAllFilters();
              }}
            >
              <Text style={styles.modalActionButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalActionButtonPrimary]}
              onPress={() => setShowFiltersModal(false)}
            >
              <Text style={[styles.modalActionButtonText, styles.modalActionButtonTextPrimary]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const processTransactionsForSectionList = () => {
    // Transactions are now filtered by the API, so we use them directly
    const grouped = groupAndCalculateRunningBalance(transactions);

    // Filter out sections that are not expanded
    return grouped.map((section) => ({
      ...section,
      data: expandedGroups.has(section.title) ? section.data : [],
    }));
  };

  if (!isAuthenticated || (isLoading && transactions.length === 0)) {
    return <LoadingSpinner />;
  }

  const sections = processTransactionsForSectionList();

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderTransactionItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreTransactions}
        onEndReachedThreshold={0.1}
        stickySectionHeadersEnabled={true}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddEditTransaction", { accountId })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Filters Modal */}
      {renderFiltersModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  searchSection: {
    marginBottom: spacing.md,
  },
  dateFilterContainer: {
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  dateFilterLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: "500",
  },
  dateFilterValue: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  clearFilterButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearFilterText: {
    fontSize: 11,
    color: colors.background,
    fontWeight: "600",
  },
  summaryContainer: {
    alignItems: "center",
  },
  summaryText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionHeaderIcon: {
    fontSize: 12,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  sectionHeaderDate: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },
  sectionHeaderRight: {
    alignItems: "flex-end",
  },
  sectionHeaderAmount: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeaderCount: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  addFirstTransactionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  addFirstTransactionText: {
    fontSize: 13,
    color: colors.background,
    fontWeight: "600",
  },
  loadingMore: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  loadingMoreText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 20,
    color: colors.background,
    fontWeight: "bold",
  },
  // Enhanced filter styles
  filterSummaryContainer: {
    backgroundColor: colors.primary + "10",
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  filterSummaryText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  clearFiltersButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  clearFiltersText: {
    fontSize: 13,
    color: colors.background,
    fontWeight: "600",
  },
  // Filters button styles
  filtersButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginRight: spacing.sm,
  },
  filtersButtonActive: {
    backgroundColor: colors.primary + "20",
    borderColor: colors.primary,
  },
  filtersButtonIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  filtersButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  filtersButtonTextActive: {
    color: colors.primary,
  },
  clearAllFiltersButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  clearAllFiltersText: {
    fontSize: 12,
    color: colors.background,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "bold",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalActionButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  modalActionButtonTextPrimary: {
    color: colors.background,
  },
 });
 
 export default TransactionsListScreen;