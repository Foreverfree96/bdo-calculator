// Imperial Cooking — mastery bonus, box tiers, daily limit

// Confirmed in-game mastery bonus data points [mastery, bonusDecimal]
const MASTERY_BRACKETS = [
  [0, 0],
  [50, 0.005],
  [100, 0.015],
  [150, 0.03],
  [200, 0.05],
  [250, 0.07],
  [300, 0.095],
  [350, 0.12],
  [400, 0.148],
  [450, 0.18],
  [500, 0.2116],
  [550, 0.245],
  [600, 0.29],
  [650, 0.335],
  [700, 0.375],
  [750, 0.42],
  [800, 0.465],
  [850, 0.51],
  [900, 0.555],
  [950, 0.6147],
  [1000, 0.6724],
  [1100, 0.77],
  [1200, 0.86],
  [1300, 0.94],
  [1400, 1.03],
  [1500, 1.1109],
  [1600, 1.17],
  [1700, 1.23],
  [1800, 1.29],
  [1900, 1.37],
  [2000, 1.4496],
  [2250, 1.54],
  [2500, 1.6309],
  [2750, 1.72],
  [3000, 1.8125],
];

/**
 * Get mastery bonus as a decimal (e.g. 0.6147 for 61.47%).
 * Uses piecewise linear interpolation between known brackets.
 */
export const getMasteryBonus = (mastery) => {
  if (mastery <= 0) return 0;
  for (let i = 1; i < MASTERY_BRACKETS.length; i++) {
    if (mastery <= MASTERY_BRACKETS[i][0]) {
      const [m0, b0] = MASTERY_BRACKETS[i - 1];
      const [m1, b1] = MASTERY_BRACKETS[i];
      return b0 + (b1 - b0) * (mastery - m0) / (m1 - m0);
    }
  }
  return MASTERY_BRACKETS[MASTERY_BRACKETS.length - 1][1];
};

/** Imperial cooking box sell price after mastery bonus. */
export const getBoxSellPrice = (basePrice, mastery) => {
  return Math.floor(basePrice * (2.5 + getMasteryBonus(mastery)));
};

/** Daily box delivery limit from Contribution Points. */
export const getBoxLimit = (cp) => Math.floor((cp || 0) / 2);

/** Box tiers with base listed prices (not sell prices — sell = base × 2.5+). */
export const BOX_TIERS = [
  { name: 'Apprentice', level: 'Apprentice 1+', basePrice: 52000 },
  { name: 'Skilled', level: 'Skilled 1+', basePrice: 80000 },
  { name: 'Professional', level: 'Professional 1+', basePrice: 120000 },
  { name: 'Artisan', level: 'Artisan 1+', basePrice: 160000 },
  { name: 'Master', level: 'Master 1+', basePrice: 220000 },
  { name: 'Guru', level: 'Guru 1+', basePrice: 320000 },
];
