
// Override strict ESLint for development
module.exports = {
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
  }
}

