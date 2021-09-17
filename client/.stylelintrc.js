const packageName = require('./package.json').name;

module.exports = {
    extends: 'stylelint-config-sass-guidelines',
    plugins: ['stylelint-force-app-name-prefix'],
    rules: {
        'selector-max-compound-selectors': 6,
        'plugin/stylelint-force-app-name-prefix': {
            appName: packageName,
        },
        'indentation': 4,
    },
};
