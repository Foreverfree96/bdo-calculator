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
  // Check NPC prices first — these will 404 on Arsha.io
  if (NPC_PRICES[itemId] != null) {
    return { price: NPC_PRICES[itemId], stock: Infinity, source: 'npc' };
  }

  try {
    const res = await fetch(`${BASE}/${region}/item?id=${itemId}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Response can be a single object or an array (enhancement levels)
    const item = Array.isArray(data) ? data[0] : data;
    if (item && (item.basePrice || item.lastSoldPrice)) {
      return {
        price: item.lastSoldPrice || item.basePrice || 0,
        stock: item.currentStock ?? 0,
        source: 'market',
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
 * @returns {Promise<Map<number, {price: number, stock: number, source: string}>>}
 */
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
