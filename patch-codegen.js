const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.d.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const dir = path.join(__dirname, 'node_modules', 'react-native-screens', 'src');
const libDir = path.join(__dirname, 'node_modules', 'react-native-screens', 'lib');

const files = [...walk(dir), ...walk(libDir)];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('CT.')) {
    content = content.replace(/CT\.([A-Za-z0-9_]+)/g, '$1');
    changed = true;
  }
  
  if (content.includes('React.ComponentRef')) {
    content = content.replace(/React\.ComponentRef/g, 'React.ElementRef');
    changed = true;
  }
  
  if (changed && content.includes('CodegenTypes as CT')) {
    const additionalImports = [
      'WithDefault', 'Int32', 'Double', 'Float', 
      'DirectEventHandler', 'BubblingEventHandler'
    ];
    
    let regex = /import\s+type\s*\{\s*CodegenTypes\s+as\s+CT(.*?)\}\s+from\s+['"]react-native['"];/;
    let match = content.match(regex);
    if (match) {
        let existing = match[1];
        let needed = additionalImports.filter(type => {
           // check if we actually replaced CT.Type in this file
           return content.match(new RegExp(`\\b${type}\\b`)) && 
                  !existing.includes(type) && 
                  !content.includes(`import type { ${type}`) &&
                  !content.includes(`import { ${type}`);
        });
        
        if (needed.length > 0) {
            let replacement = `import type { CodegenTypes as CT${existing}, ${needed.join(', ')} } from 'react-native';`;
            content = content.replace(regex, replacement);
        }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
});

console.log('Patched react-native-screens successfully!');
