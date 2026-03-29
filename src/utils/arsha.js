// Arsha.io — BDO Central Market price API
// Docs: https://github.com/guy0090/api.arsha.io

const BASE = 'https://api.arsha.io/v2';

// Known NPC vendor prices — these items aren't on the Central Market
const NPC_PRICES = {
  9001: 20,    // Salt
  9002: 20,    // Sugar
  9003: 40,    // Cooking Wine
  9004: 40,    // Olive Oil
  9005: 20,    // Leavening Agent
  // 9006 is "Dressing" on the market (craftable, ~550 silver) — NOT a cheap NPC item
  9007: 500,   // Cream
  9008: 40,    // Butter
  9009: 500,   // Cheese
  9010: 20,    // Flour
  9011: 40,    // Dough
  9012: 20,    // Eggs (NPC)
  9059: 30,    // Mineral Water
  9060: 60,    // Purified Water (NPC — also gatherable)
  9063: 500,   // Deep Frying Oil
  9066: 20,    // Pepper
  9201: 10,    // Rough Stone (vendor price)
  35100: 2000, // Cron Stone (NPC base)
  // Alchemy
  6351: 40,    // Purified Water (alchemy vendor)
  6352: 40,    // Clear Liquid Reagent base
  6353: 40,    // Pure Powder Reagent base
};

/**
 * Fetch current market price for an item.
 * Falls back to known NPC vendor prices for non-marketable items.
 * @param {number} itemId - BDO item ID
 * @param {string} region - na, eu, sea, sa
 * @returns {Promise<{price: number, stock: number, source: 'market'|'npc'}|null>}
 */
export const fetchMarketPrice = async (itemId, region = 'na') => {
  // Try market API first
  try {
    const res = await fetch(`${BASE}/${region}/item?id=${itemId}`);
    if (res.ok) {
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;
      const price = item?.lastSoldPrice > 0 ? item.lastSoldPrice
                  : item?.basePrice > 0 ? item.basePrice
                  : null;
      if (price != null) {
        return { price, stock: item.currentStock ?? 0, source: 'market' };
      }
    }
  } catch { /* fall through to NPC fallback */ }

  // Fallback: known NPC vendor prices for items that 404 or have no market data
  if (NPC_PRICES[itemId] != null) {
    return { price: NPC_PRICES[itemId], stock: Infinity, source: 'npc' };
  }

  return null;
};

/**
 * Fetch prices for multiple items at once.
 * @param {number[]} itemIds
 * @param {string} region
 * @returns {Promise<Map<number, {price: number, stock: number, source: string}>>}
 */
/**
 * Search marketplace items by name.
 * @param {string} name
 * @param {string} region
 * @returns {Promise<Array<{id: number, name: string, grade: number}>>}
 */
export const searchMarketItems = async (name, region = 'na') => {
  try {
    const res = await fetch(`${BASE}/${region}/util/search?lang=en&name=${encodeURIComponent(name)}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch { /* ignore */ }
  return [];
};

/**
 * Fetch full item data including priceMin, priceMax, currentStock.
 * @param {number} itemId
 * @param {string} region
 * @returns {Promise<{price: number, stock: number, priceMin: number, priceMax: number, source: string}|null>}
 */
export const fetchItemFullData = async (itemId, region = 'na') => {
  try {
    const res = await fetch(`${BASE}/${region}/item?id=${itemId}`);
    if (res.ok) {
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;
      if (item) {
        return {
          price: item.lastSoldPrice || item.basePrice || 0,
          stock: item.currentStock ?? 0,
          priceMin: item.priceMin ?? 0,
          priceMax: item.priceMax ?? 0,
          source: 'market',
        };
      }
    }
  } catch { /* ignore */ }
  return null;
};

/**
 * Fetch order book for an item — returns the lowest sell price with stock.
 * If no sellers, returns the priceMax (highest possible listing price).
 * @param {number} itemId
 * @param {string} region
 * @returns {Promise<{minListed: number, stock: number}|null>}
 */
export const fetchMinListedPrice = async (itemId, region = 'na') => {
  try {
    const res = await fetch(`${BASE}/${region}/orders?id=${itemId}`);
    if (res.ok) {
      const data = await res.json();
      const orders = data?.orders || [];
      // Find lowest price where sellers > 0
      const sellOrders = orders.filter(o => o.sellers > 0).sort((a, b) => a.price - b.price);
      if (sellOrders.length > 0) {
        return { minListed: sellOrders[0].price, stock: sellOrders[0].sellers };
      }
    }
  } catch { /* ignore */ }
  // Fallback: use item endpoint for priceMax
  try {
    const full = await fetchItemFullData(itemId, region);
    if (full) {
      return { minListed: full.priceMax || full.price, stock: full.stock };
    }
  } catch { /* ignore */ }
  return null;
};

/**
 * Fetch the best price to list an item at on the marketplace.
 * Strategy: use the cheapest current seller price (that's the going rate).
 * If no sellers at all, use priceMax.
 * @param {number} itemId
 * @param {string} region
 * @returns {Promise<{listPrice: number, stock: number, source: 'cheapest'|'maxPrice'}|null>}
 */
export const fetchBestSellPrice = async (itemId, region = 'na') => {
  try {
    const res = await fetch(`${BASE}/${region}/orders?id=${itemId}`);
    if (res.ok) {
      const data = await res.json();
      const orders = data?.orders || [];
      if (orders.length > 0) {
        // Find all sell orders (where sellers > 0), sorted by price ascending
        const sellOrders = orders.filter(o => o.sellers > 0).sort((a, b) => a.price - b.price);
        if (sellOrders.length > 0) {
          const totalStock = sellOrders.reduce((s, o) => s + o.sellers, 0);
          // Use the cheapest seller price — that's the current market rate
          return { listPrice: sellOrders[0].price, stock: totalStock, source: 'cheapest' };
        }
        // No sellers — use priceMax from item data
      }
    }
  } catch { /* ignore */ }
  // Fallback: use item endpoint for priceMax
  try {
    const full = await fetchItemFullData(itemId, region);
    if (full) {
      return { listPrice: full.priceMax || full.price, stock: full.stock, source: 'maxPrice' };
    }
  } catch { /* ignore */ }
  return null;
};

export const fetchMarketPrices = async (itemIds, region = 'na') => {
  const results = new Map();
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
