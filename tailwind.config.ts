import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'on-tertiary-fixed': '#301400',
        'inverse-primary': '#494bd6',
        'surface-container-high': '#292932',
        'secondary-container': '#03b5d3',
        'on-error-container': '#ffdad6',
        'surface-dim': '#13131b',
        'surface-container-highest': '#34343d',
        'on-primary-fixed': '#07006c',
        'on-surface': '#e4e1ed',
        'on-background': '#e4e1ed',
        'on-secondary': '#003640',
        'error': '#ffb4ab',
        'inverse-on-surface': '#303038',
        'primary-fixed-dim': '#c0c1ff',
        'on-secondary-fixed': '#001f26',
        'tertiary': '#ffb783',
        'on-tertiary-fixed-variant': '#703700',
        'tertiary-container': '#d97721',
        'inverse-surface': '#e4e1ed',
        'surface-tint': '#c0c1ff',
        'on-error': '#690005',
        'secondary-fixed': '#acedff',
        'primary-container': '#8083ff',
        'surface-container-lowest': '#0d0d15',
        'surface-container-low': '#1b1b23',
        'secondary': '#4cd7f6',
        'surface-container': '#1f1f27',
        'surface': '#13131b',
        'on-primary-fixed-variant': '#2f2ebe',
        'on-primary': '#1000a9',
        'secondary-fixed-dim': '#4cd7f6',
        'tertiary-fixed': '#ffdcc5',
        'on-tertiary': '#4f2500',
        'surface-bright': '#393841',
        'primary-fixed': '#e1e0ff',
        'primary': '#c0c1ff',
        'outline-variant': '#464554',
        'outline': '#908fa0',
        'on-secondary-fixed-variant': '#004e5c',
        'on-secondary-container': '#00424e',
        'background': '#13131b',
        'tertiary-fixed-dim': '#ffb783',
        'on-primary-container': '#0d0096',
        'on-surface-variant': '#c7c4d7',
        'surface-variant': '#34343d',
        'on-tertiary-container': '#452000',
        'error-container': '#93000a'
      },
      fontFamily: {
        'display-lg': ['Geist', '-apple-system', 'sans-serif'],
        'headline-md': ['Geist', '-apple-system', 'sans-serif'],
        'body-base': ['Inter', 'system-ui', 'sans-serif'],
        'body-sm': ['Inter', 'system-ui', 'sans-serif'],
        'code-label': ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 12s linear infinite'
      }
    }
  },
  plugins: []
} satisfies Config
