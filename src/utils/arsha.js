// Arsha.io — BDO Central Market price API
// Docs: https://github.com/guy0090/api.arsha.io

const BASE = 'https://api.arsha.io/v2';

/**
 * Fetch current market price for an item.
 * @param {number} itemId - BDO item ID
 * @param {string} region - na, eu, sea, sa
 * @returns {Promise<{price: number, stock: number}|null>}
 */
export const fetchMarketPrice = async (itemId, region = 'na') => {
  try {
    const res = await fetch(`${BASE}/${region}/item?id=${itemId}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Response is an array of sub-items (enhancement levels)
    // For base items, take the first entry
    if (Array.isArray(data) && data.length) {
      return {
        price: data[0].price || data[0].basePrice || 0,
        stock: data[0].currentStock ?? data[0].totalTradeCount ?? 0,
      };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Fetch prices for multiple items at once.
 * @param {number[]} itemIds
 * @param {string} region
 * @returns {Promise<Map<number, {price: number, stock: number}>>}
 */
export const fetchMarketPrices = async (itemIds, region = 'na') => {
  const results = new Map();
  // Arsha.io doesn't have a batch endpoint, so we fetch in parallel with a small concurrency limit
  const chunks = [];
  for (let i = 0; i < itemIds.length; i += 5) {
    chunks.push(itemIds.slice(i, i + 5));
  }
  for (const chunk of chunks) {
    const promises = chunk.map(async (id) => {
      const data = await fetchMarketPrice(id, region);
      if (data) results.set(id, data);
    });
    await Promise.all(promises);
  }
  return results;
};
