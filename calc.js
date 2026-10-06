const fs = require('fs');

const content = fs.readFileSync('./src/mock/mockTransactions.ts', 'utf8');
const match = content.match(/\[([\s\S]*)\];/);
if (match) {
  const json = '[' + match[1].replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"') + ']';
  try {
    const data = JSON.parse(json);
    
    let totalLiters = 0;
    let totalSpent = 0;
    
    data.forEach(txn => {
      totalLiters += txn.quantity;
      totalSpent += txn.amount;
    });
    
    console.log('totalLiters:', totalLiters.toFixed(1));
    console.log('totalSpent:', totalSpent);
  } catch(e) {
    console.error('Failed to parse:', e);
  }
}
