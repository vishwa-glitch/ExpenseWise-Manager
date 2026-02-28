import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ViewStyle,
} from 'react-native';
import { getAnimationDuration } from '../../utils/accessibilityUtils';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const accessibleDuration = getAnimationDuration(duration);
    const accessibleDelay = getAnimationDuration(delay);
    
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: accessibleDuration,
        useNativeDriver: true,
      }).start(onAnimationComplete);
    }, accessibleDelay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay, onAnimationComplete]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'up',
  distance = 50,
  duration = 300,
  delay = 0,
  style,
  onAnimationComplete,
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start(onAnimationComplete);
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, duration, delay, onAnimationComplete]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'left':
        return [{ translateX: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'right':
        return [{ translateX: slideAnim }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ScaleInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start(onAnimationComplete);
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, fadeAnim, duration, delay, onAnimationComplete]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};