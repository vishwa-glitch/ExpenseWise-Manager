import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  useSafeArea?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  contentContainerStyle,
  useSafeArea = true,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    useSafeArea && { paddingTop: insets.top },
    style,
  ];

  const contentStyle = [
    styles.content,
    contentContainerStyle,
  ];

  if (useSafeArea) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={contentStyle}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
