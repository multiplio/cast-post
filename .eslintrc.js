module.exports = {
  "env": {
    "browser": true,
    "es6": true,
  },
  "parserOptions": {
    "ecmaVersion": "es6",
    "sourceType": "module",
  },
  "rules": {
    "comma-dangle": ["error", "always-multiline"],
    "brace-style": ["error", "stroustrup"],
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }]
  },
  "extends": ["eslint:recommended", "standard"],
};
