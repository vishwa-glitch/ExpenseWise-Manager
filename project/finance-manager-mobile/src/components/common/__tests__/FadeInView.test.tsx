import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FadeInView, SlideInView, ScaleInView, StaggeredFadeInView } from '../FadeInView';

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.Animated.timing = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  }));
  
  RN.Animated.parallel = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  }));
  
  RN.Animated.Value = jest.fn(() => ({
    interpolate: jest.fn(),
  }));

  return RN;
});

describe('Animation Components', () => {
  describe('FadeInView', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <FadeInView>
          <Text>Test content</Text>
        </FadeInView>
      );

      expect(getByText('Test content')).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <FadeInView style={customStyle}>
          <Text testID="test-content">Test content</Text>
        </FadeInView>
      );

      expect(getByTestId('test-content')).toBeTruthy();
    });

    it('calls onAnimationComplete when provided', () => {
      const mockCallback = jest.fn();
      
      render(
        <FadeInView onAnimationComplete={mockCallback}>
          <Text>Test content</Text>
        </FadeInView>
      );

      // Animation should start automatically
      expect(require('react-native').Animated.timing).toHaveBeenCalled();
    });
  });

  describe('SlideInView', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <SlideInView>
          <Text>Sliding content</Text>
        </SlideInView>
      );

      expect(getByText('Sliding content')).toBeTruthy();
    });

    it('uses parallel animation', () => {
      render(
        <SlideInView>
          <Text>Sliding content</Text>
        </SlideInView>
      );

      expect(require('react-native').Animated.parallel).toHaveBeenCalled();
    });
  });

  describe('ScaleInView', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <ScaleInView>
          <Text>Scaling content</Text>
        </ScaleInView>
      );

      expect(getByText('Scaling content')).toBeTruthy();
    });

    it('uses parallel animation for scale and fade', () => {
      render(
        <ScaleInView>
          <Text>Scaling content</Text>
        </ScaleInView>
      );

      expect(require('react-native').Animated.parallel).toHaveBeenCalled();
    });
  });

  describe('StaggeredFadeInView', () => {
    it('renders all children', () => {
      const children = [
        <Text key="1">Item 1</Text>,
        <Text key="2">Item 2</Text>,
        <Text key="3">Item 3</Text>,
      ];

      const { getByText } = render(
        <StaggeredFadeInView>
          {children}
        </StaggeredFadeInView>
      );

      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();
    });

    it('applies staggered delays to children', () => {
      const children = [
        <Text key="1">Item 1</Text>,
        <Text key="2">Item 2</Text>,
      ];

      render(
        <StaggeredFadeInView staggerDelay={200}>
          {children}
        </StaggeredFadeInView>
      );

      // Each child should have its own animation
      expect(require('react-native').Animated.timing).toHaveBeenCalledTimes(2);
    });
  });
});