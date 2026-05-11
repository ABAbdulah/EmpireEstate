import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { palette, radius, shadow, spacing } from '../theme';

interface Props extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}

export function Card({ children, style, noPadding }: Props) {
  return (
    <View style={[styles.card, noPadding ? null : styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  padded: {
    padding: spacing.lg,
  },
});
