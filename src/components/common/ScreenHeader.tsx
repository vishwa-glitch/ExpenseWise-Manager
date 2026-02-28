import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface ScreenHeaderProps {
  title: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  showBorder?: boolean;
  style?: any;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  leftComponent,
  rightComponent,
  showBorder = true,
  style,
}) => {
  return (
    <View style={[
      styles.header,
      showBorder && styles.headerWithBorder,
      style,
    ]}>
      <View style={styles.leftSection}>
        {leftComponent}
      </View>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
});
