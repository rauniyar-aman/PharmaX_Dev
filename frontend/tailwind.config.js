const cv = v => `rgb(var(--c-${v}) / <alpha-value>)`

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:                    cv('primary'),
        'primary-dark':             cv('primary-dark'),
        'primary-container':        cv('primary-container'),
        'inverse-primary':          cv('inverse-primary'),
        'primary-fixed':            cv('primary-fixed'),
        'primary-fixed-dim':        cv('primary-fixed-dim'),
        'on-primary':               cv('on-primary'),
        'on-primary-fixed':         cv('on-primary-fixed'),
        'on-primary-fixed-variant': cv('on-primary-fixed-variant'),
        'on-primary-container':     cv('on-primary-container'),

        secondary:                    cv('secondary'),
        'secondary-container':        cv('secondary-container'),
        'secondary-fixed':            cv('secondary-fixed'),
        'secondary-fixed-dim':        cv('secondary-fixed-dim'),
        'on-secondary':               cv('on-secondary'),
        'on-secondary-container':     cv('on-secondary-container'),
        'on-secondary-fixed':         cv('on-secondary-fixed'),
        'on-secondary-fixed-variant': cv('on-secondary-fixed-variant'),

        tertiary:                    cv('tertiary'),
        'tertiary-container':        cv('tertiary-container'),
        'tertiary-fixed':            cv('tertiary-fixed'),
        'tertiary-fixed-dim':        cv('tertiary-fixed-dim'),
        'on-tertiary':               cv('on-tertiary'),
        'on-tertiary-container':     cv('on-tertiary-container'),
        'on-tertiary-fixed':         cv('on-tertiary-fixed'),
        'on-tertiary-fixed-variant': cv('on-tertiary-fixed-variant'),

        background:    cv('background'),
        'on-background': cv('on-background'),

        surface:                    cv('surface'),
        'surface-dim':              cv('surface-dim'),
        'surface-bright':           cv('surface-bright'),
        'surface-container-lowest': cv('surface-container-lowest'),
        'surface-container-low':    cv('surface-container-low'),
        'surface-container':        cv('surface-container'),
        'surface-container-high':   cv('surface-container-high'),
        'surface-container-highest':cv('surface-container-highest'),
        'on-surface':               cv('on-surface'),
        'on-surface-variant':       cv('on-surface-variant'),
        'inverse-surface':          cv('inverse-surface'),
        'inverse-on-surface':       cv('inverse-on-surface'),

        outline:          cv('outline'),
        'outline-variant':cv('outline-variant'),
        'surface-tint':   cv('surface-tint'),
        'surface-variant':cv('surface-variant'),

        error:               cv('error'),
        'on-error':          cv('on-error'),
        'error-container':   cv('error-container'),
        'on-error-container':cv('on-error-container'),

        success:             cv('success'),
        'success-container': cv('success-container'),
        warning:             cv('warning'),
        'warning-container': cv('warning-container'),
        info:                cv('info'),
        'info-container':    cv('info-container'),
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:    '0.25rem',
        DEFAULT:'0.5rem',
        md:    '0.75rem',
        lg:    '1rem',
        xl:    '1.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full:  '9999px',
      },
      boxShadow: {
        card:    '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -1px rgba(0,0,0,0.03)',
        'card-md':'0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -2px rgba(0,0,0,0.04)',
        modal:   '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)',
        sidebar: '4px 0 24px -4px rgba(0,0,0,0.08)',
      },
      spacing: {
        sidebar:           '256px',
        'sidebar-collapsed':'72px',
      }
    }
  },
  plugins: []
}
