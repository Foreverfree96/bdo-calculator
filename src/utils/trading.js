// BDO Crate Trading — bargain bonus, sell price formula

// Trading level tiers and their level ranges
const TIERS = [
  { name: 'Beginner', levels: 10 },
  { name: 'Apprentice', levels: 10 },
  { name: 'Skilled', levels: 10 },
  { name: 'Professional', levels: 10 },
  { name: 'Artisan', levels: 10 },
  { name: 'Master', levels: 30 },
  { name: 'Guru', levels: 20 },
];

/** Build flat list of all trading levels for dropdown. */
export const TRADING_LEVELS = (() => {
  const list = [];
  let index = 0;
  for (const tier of TIERS) {
    for (let lvl = 1; lvl <= tier.levels; lvl++) {
      list.push({ label: `${tier.name} ${lvl}`, index });
      index++;
    }
  }
  return list;
})();

/**
 * Bargain bonus % for a given level index.
 * Beginner 1 = 5.5%, +0.5% per level.
 */
export const getBargainBonus = (levelIndex) => 5.5 + (levelIndex * 0.5);

/**
 * Calculate crate sell price.
 * @param {number} basePrice - crate base price
 * @param {number} distancePct - distance bonus as % (0–150)
 * @param {number} levelIndex - trading level index (0 = Beginner 1)
 * @returns {number} final sell price
 */
export const getCrateSellPrice = (basePrice, distancePct, levelIndex) => {
  const bargain = getBargainBonus(levelIndex);
  return Math.floor(basePrice * (1 + distancePct / 100) * (1 + bargain / 100));
};
