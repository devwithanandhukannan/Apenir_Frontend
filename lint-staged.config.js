const path = require('path');

// Run ESLint on staged files directly using the eslint CLI to support auto-fixing
const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

module.exports = {
  // Lint and format JavaScript and TypeScript files
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, 'prettier --write'],

  // Format styles, markup, configuration, and documentation files
  '*.{json,md,css,scss,html,yaml,yml}': ['prettier --write'],
};
