import type { Config } from 'tailwindcss';

/**
 * Susi Air brand tokens (per brief):
 * navy #0E2138, brand red #E63757, bg #F5F6F8, card #FFFFFF, secondary text #6B7280,
 * success #1FBF8F, warning #F59E0B, danger #E63757, chart accent #22C5E8.
 * Light theme only — no dark palette.
 */
export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: { DEFAULT: '#F5F6F8', raised: '#FFFFFF', line: '#E5E7EB' },
        ink: { DEFAULT: '#0E2138', soft: '#6B7280' },
        navy: { DEFAULT: '#0E2138', raised: '#16293F', line: '#24384F', text: '#E6EDF5', soft: '#9DB0C4' },
        brand: { DEFAULT: '#E63757', dark: '#C92849' },
        success: '#1FBF8F',
        warning: '#F59E0B',
        danger: '#E63757',
        chart: '#22C5E8',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
} satisfies Config;
