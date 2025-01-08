import { FlatCompat } from '@eslint/eslintrc';

const config = [
    ...new FlatCompat().extends('next/core-web-vitals'),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        ignores: ['**/node_modules/**', '**/public/**', '**/.next/**'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
            },
        },
        rules: {
            '@next/next/no-img-element': 'off',
            'import/no-unresolved': 'off',
            'no-empty': 'off',
            'no-undef': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/rules-of-hooks': 'error',
            'react/display-name': 'off',
        },
    },
];

export default config;
