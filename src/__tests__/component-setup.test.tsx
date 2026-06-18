/**
 * Smoke test to verify React Native Testing Library is properly configured
 * for component testing.
 */
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

function SampleComponent({ onPress }: { onPress: () => void }) {
  return (
    <View>
      <Text accessibilityRole="header">Item Finder</Text>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Add Item"
      >
        <Text>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
}

describe('React Native Testing Library setup', () => {
  it('should render a component and query by text', () => {
    const { getByText } = render(<SampleComponent onPress={() => {}} />);
    expect(getByText('Item Finder')).toBeTruthy();
  });

  it('should query by accessibility role', () => {
    const { getByRole } = render(<SampleComponent onPress={() => {}} />);
    expect(getByRole('header')).toBeTruthy();
    expect(getByRole('button')).toBeTruthy();
  });

  it('should handle user interactions', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<SampleComponent onPress={onPress} />);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should query by accessibility label', () => {
    const { getByLabelText } = render(<SampleComponent onPress={() => {}} />);
    expect(getByLabelText('Add Item')).toBeTruthy();
  });
});
