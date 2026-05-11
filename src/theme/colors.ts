export const palette = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F3F7',
  border: '#E5E7EB',

  primary: '#2F6BFF',
  primarySoft: '#E6EEFF',
  success: '#10B981',
  successSoft: '#DCFCE7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  warning: '#F59E0B',
  premium: '#F5B100',
  premiumSoft: '#FEF3C7',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  shadow: 'rgba(15, 23, 42, 0.08)',
} as const;

export type CategoryKey =
  | 'balance'
  | 'businesses'
  | 'stocks'
  | 'realEstate'
  | 'transport'
  | 'collections'
  | 'crypto'
  | 'residence';

export const categoryColors: Record<CategoryKey, { bar: string; tint: string }> = {
  balance:    { bar: '#2C7A8A', tint: '#E6F2F4' },
  businesses: { bar: '#F08773', tint: '#FCE8E2' },
  stocks:     { bar: '#F2B45A', tint: '#FCF1D7' },
  realEstate: { bar: '#9B6FB0', tint: '#EFE6F5' },
  transport:  { bar: '#5E9D7C', tint: '#E4F0EA' },
  collections:{ bar: '#8B7CE0', tint: '#EBE7FA' },
  crypto:     { bar: '#5CCFB1', tint: '#E0F6EF' },
  residence:  { bar: '#1F5B8A', tint: '#E2ECF4' },
};
