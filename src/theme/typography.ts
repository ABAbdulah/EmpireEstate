import { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 46,
  } satisfies TextStyle,
  hero: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 38,
  } satisfies TextStyle,
  headline: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 28,
  } satisfies TextStyle,
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } satisfies TextStyle,
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
    lineHeight: 18,
  } satisfies TextStyle,
  micro: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    lineHeight: 14,
  } satisfies TextStyle,
};
