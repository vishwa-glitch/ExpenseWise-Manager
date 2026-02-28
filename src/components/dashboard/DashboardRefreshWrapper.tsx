import React from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useDashboardRefresh } from '../../utils/refreshUtils';
import { colors } from '../../constants/colors';

interface DashboardRefreshWrapperProps {
  children: React.ReactNode;
}

export const DashboardRefreshWrapper: React.FC<DashboardRefreshWrapperProps> = ({
  children,
}) => {
  const { isRefreshing, onPullRefresh } = useDashboardRefresh();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onPullRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
          title="Pull to refresh"
          titleColor={colors.textSecondary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});