import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearch,
  placeholder = "Search transactions...",
}) => {
  return (
    <View 
      style={styles.searchContainer}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Search transactions"
    >
      <Text style={styles.searchIcon} accessibilityHidden={true}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onSearch}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        accessible={true}
        accessibilityLabel={`Search transactions. Current search: ${value || 'empty'}`}
        accessibilityHint="Enter text to search through your transactions"
        accessibilityRole="none"
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onSearch('')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Removes the current search text"
        >
          <Text style={styles.clearIcon} accessibilityHidden={true}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
    color: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
});

export default SearchBar;