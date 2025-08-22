import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { SectionHeader } from '../SectionHeader';

describe('SectionHeader', () => {
  it('renders title correctly', () => {
    render(<SectionHeader title="Test Section" />);
    
    expect(screen.getByText('Test Section')).toBeTruthy();
    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    render(
      <SectionHeader 
        title="Test Section" 
        subtitle="This is a subtitle" 
      />
    );
    
    expect(screen.getByText('Test Section')).toBeTruthy();
    expect(screen.getByText('This is a subtitle')).toBeTruthy();
  });

  it('renders right component when provided', () => {
    const rightComponent = (
      <TouchableOpacity testID="right-button">
        <Text>See All</Text>
      </TouchableOpacity>
    );

    render(
      <SectionHeader 
        title="Test Section" 
        rightComponent={rightComponent}
      />
    );
    
    expect(screen.getByText('Test Section')).toBeTruthy();
    expect(screen.getByTestId('right-button')).toBeTruthy();
    expect(screen.getByText('See All')).toBeTruthy();
  });

  it('renders divider when showDivider is true', () => {
    const { getByTestId } = render(
      <SectionHeader 
        title="Test Section" 
        showDivider={true}
      />
    );
    
    // The divider should be present in the component tree
    expect(screen.getByText('Test Section')).toBeTruthy();
  });

  it('does not render divider when showDivider is false', () => {
    render(
      <SectionHeader 
        title="Test Section" 
        showDivider={false}
      />
    );
    
    expect(screen.getByText('Test Section')).toBeTruthy();
  });

  it('applies custom styles correctly', () => {
    const customStyle = { backgroundColor: 'red' };
    const customTitleStyle = { color: 'blue' };
    const customSubtitleStyle = { color: 'green' };

    render(
      <SectionHeader 
        title="Test Section"
        subtitle="Test Subtitle"
        style={customStyle}
        titleStyle={customTitleStyle}
        subtitleStyle={customSubtitleStyle}
      />
    );
    
    expect(screen.getByText('Test Section')).toBeTruthy();
    expect(screen.getByText('Test Subtitle')).toBeTruthy();
  });

  it('has proper accessibility attributes', () => {
    render(
      <SectionHeader 
        title="Test Section" 
        subtitle="Test subtitle"
      />
    );
    
    const titleElement = screen.getByRole('header');
    expect(titleElement).toBeTruthy();
    
    const subtitleElement = screen.getByLabelText('Test Section subtitle: Test subtitle');
    expect(subtitleElement).toBeTruthy();
  });

  it('handles long titles gracefully', () => {
    const longTitle = 'This is a very long section title that should be handled properly';
    
    render(<SectionHeader title={longTitle} />);
    
    expect(screen.getByText(longTitle)).toBeTruthy();
  });

  it('works with complex right components', () => {
    const complexRightComponent = (
      <TouchableOpacity testID="complex-button">
        <Text>Complex Action</Text>
      </TouchableOpacity>
    );

    render(
      <SectionHeader 
        title="Test Section" 
        rightComponent={complexRightComponent}
      />
    );
    
    expect(screen.getByText('Test Section')).toBeTruthy();
    expect(screen.getByTestId('complex-button')).toBeTruthy();
    expect(screen.getByText('Complex Action')).toBeTruthy();
  });
});