const fs = require('fs');

let parserSource = fs.readFileSync('./src/parser.js').toString();
parserSource = parserSource.replace('module.exports', 'module.exports_none');
parserSource += '\nexport const parse = peg$parse;\n';

fs.writeFileSync('./src/parser.js', parserSource);
