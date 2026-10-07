const fs = require('fs');
const path = require('path');

function getEnv() {
  const env = {};
  try {
    const content = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        value = value.trim().replace(/^['"](.*)['"]$/, '$1');
        env[match[1]] = value;
      }
    });
  } catch (e) {}
  return env;
}

const env = getEnv();

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    function inlineEnv({ types: t }) {
      return {
        visitor: {
          MemberExpression(p) {
            if (p.get('object').matchesPattern('process.env')) {
              const key = p.node.property.name || p.node.property.value;
              if (env[key] !== undefined) {
                p.replaceWith(t.valueToNode(env[key]));
              }
            }
          }
        }
      };
    }
  ]
};