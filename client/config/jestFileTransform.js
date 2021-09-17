// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const charUpperCase = (_, char) => char.toUpperCase();

function pascalCase(input) {
    input = input
        .trim()
        .replace(/^[_.\- ]+/, '')
        .toLowerCase();

    input = input.charAt(0).toUpperCase() + input.slice(1);

    return input.replace(/[_.\- ]+(\w|$)/g, charUpperCase).replace(/\d+(\w|$)/g, charUpperCase);
}

module.exports = {
    process(src, filename) {
        const assetFilename = JSON.stringify(path.basename(filename));

        if (filename.match(/\.svg$/)) {
            // Based on how SVGR generates a component name.
            const pascalCaseFilename = pascalCase(path.parse(filename).name);
            const componentName = `Svg${pascalCaseFilename}`;
            return `const React = require('react');
      module.exports = {
        __esModule: true,
        default: ${assetFilename},
        ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
          return {
            $$typeof: Symbol.for('react.element'),
            type: 'svg',
            ref: ref,
            key: null,
            props: Object.assign({}, props, {
              children: ${assetFilename}
            })
          };
        }),
      };`;
        }

        return `module.exports = ${assetFilename};`;
    },
};
