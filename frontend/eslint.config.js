import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // This project doesn't use PropTypes anywhere (no `prop-types`
      // dependency exists), and JSX text legitimately contains raw
      // apostrophes/quotes throughout the copy — both rules were still at
      // their `eslint-plugin-react` recommended-config default of "error"
      // despite that, which is what made these the two largest categories
      // (441 of 448) of a real `npm run lint` run before this change. Kept
      // as warnings rather than turned off entirely, so a genuinely new
      // instance still shows up in `npm run lint` output — just doesn't
      // fail CI over pre-existing, non-bug findings.
      'react/prop-types': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
