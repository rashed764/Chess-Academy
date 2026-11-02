/**
 * Chess Academy design tokens, color palette, and styling constants.
 */

export const THEME_COLORS = {
  background: {
    main: '#0B0D14',
    sidebar: '#10121B',
    card: '#171A24',
    elevated: '#1D2230',
    surface: '#151821',
  },
  accent: {
    gold: '#D6B36A',
    goldLight: '#E8CF96',
    goldDark: '#B89345',
    goldGlow: 'rgba(214, 179, 106, 0.15)',
  },
  text: {
    primary: '#F4F4F5',
    secondary: '#9297A5',
    muted: '#656A7A',
    inverse: '#0B0D14',
  },
  border: {
    subtle: '#242938',
    elevated: '#2E3547',
    goldSubtle: 'rgba(214, 179, 106, 0.25)',
  },
  status: {
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#60A5FA',
  },
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
