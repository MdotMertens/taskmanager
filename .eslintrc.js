module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
		"jest": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "settings": {
        "react": {
            "version": "detect",
        }
    },
    "rules": {
        "max-statements": ["error", 20],
		"no-useless-escape": 0
    }
};
