const fs = require('fs');
const p = 'node_modules/react-native-screens/package.json';
const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
delete pkg.codegenConfig;
fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
console.log('Removed codegenConfig successfully');
