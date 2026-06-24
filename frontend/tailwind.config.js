module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#006b2c',
        'primary-dark': '#005220',
        'primary-container': '#00873a',
        'inverse-primary': '#62df7d',
        'primary-fixed': '#7ffc97',
        'primary-fixed-dim': '#62df7d',
        'on-primary': '#ffffff',
        'on-primary-container': '#f7fff2',

        secondary: '#0051d5',
        'secondary-container': '#316bf3',
        'secondary-fixed': '#dbe1ff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#fefcff',

        tertiary: '#525d6c',
        'tertiary-container': '#6b7586',
        'on-tertiary': '#ffffff',

        background: '#f9f9ff',
        'on-background': '#151c27',

        surface: '#ffffff',
        'surface-dim': '#d3daea',
        'surface-bright': '#f9f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f0f3ff',
        'surface-container': '#e7eefe',
        'surface-container-high': '#e2e8f8',
        'surface-container-highest': '#dce2f3',
        'on-surface': '#151c27',
        'on-surface-variant': '#3e4a3d',
        'inverse-surface': '#2a313d',
        'inverse-on-surface': '#ebf1ff',

        outline: '#6e7b6c',
        'outline-variant': '#bdcaba',
        'surface-tint': '#006e2d',
        'surface-variant': '#dce2f3',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        success: '#006b2c',
        'success-container': '#d6f5e0',
        warning: '#e65100',
        'warning-container': '#fff3e0',
        info: '#0051d5',
        'info-container': '#dbe1ff',
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -1px rgba(0,0,0,0.03)',
        'card-md': '0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -2px rgba(0,0,0,0.04)',
        modal: '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)',
        sidebar: '4px 0 24px -4px rgba(0,0,0,0.08)',
      },
      spacing: {
        sidebar: '256px',
        'sidebar-collapsed': '72px',
      }
    }
  },
  plugins: []
}
