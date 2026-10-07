export const formatIndianCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    // Show 1 decimal point for thousands, e.g. 2357 -> 2.3k
    // If it's perfectly round (e.g., 2000), it'll show 2.0k or we can strip the .0
    const inK = amount / 1000;
    return `₹${Number.isInteger(inK) ? inK : inK.toFixed(1)}k`;
  }
  return `₹${(amount || 0).toLocaleString('en-IN')}`;
};

export const formatNumberCompact = (num: number): string => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) {
    const inK = num / 1000;
    return `${Number.isInteger(inK) ? inK : inK.toFixed(1)}k`;
  }
  return (num || 0).toLocaleString('en-IN');
};
