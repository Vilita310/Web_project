import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        // Browser globals
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Worker: 'readonly',
        self: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        location: 'readonly',
        performance: 'readonly',
        // Audio/Media globals
        Audio: 'readonly',
        MediaRecorder: 'readonly',
        // React globals
        React: 'readonly'
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-unknown-property': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General JavaScript rules (relaxed for development)
      'no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_|index|key|error|e',
        'varsIgnorePattern': '^_|React|useState|useEffect|t|Title|Space|Col|Row|maxValue|setMaxValue|Dropdown|error'
      }],
      'no-console': 'off', // Allow console for debugging
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'no-prototype-builtins': 'warn',

      // JSX A11y rules (basic accessibility)
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    // Ignore patterns
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      '*.config.js',
      'vite.config.js'
    ]
  }
]