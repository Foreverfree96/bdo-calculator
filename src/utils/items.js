import { FISH_VENDOR_PRICES } from './processing.js';

// ═══ BDO COOKING SUBSTITUTION GROUPS ═══
// When a recipe shows a "group" icon, any item in that group can be used.
// Keyed by representative item IDs that BDO Codex uses for the group.
export const SUBSTITUTION_GROUPS = {
  // Grains (Corn, Wheat, Barley, Potato, Sweet Potato)
  7005: [{ name: 'Corn', id: 7005 }, { name: 'Wheat', id: 7001 }, { name: 'Barley', id: 7002 }, { name: 'Potato', id: 7006 }, { name: 'Sweet Potato', id: 7007 }],
  7001: [{ name: 'Wheat', id: 7001 }, { name: 'Corn', id: 7005 }, { name: 'Barley', id: 7002 }, { name: 'Potato', id: 7006 }, { name: 'Sweet Potato', id: 7007 }],
  7002: [{ name: 'Barley', id: 7002 }, { name: 'Wheat', id: 7001 }, { name: 'Corn', id: 7005 }, { name: 'Potato', id: 7006 }, { name: 'Sweet Potato', id: 7007 }],
  7006: [{ name: 'Potato', id: 7006 }, { name: 'Wheat', id: 7001 }, { name: 'Corn', id: 7005 }, { name: 'Barley', id: 7002 }, { name: 'Sweet Potato', id: 7007 }],
  7007: [{ name: 'Sweet Potato', id: 7007 }, { name: 'Wheat', id: 7001 }, { name: 'Corn', id: 7005 }, { name: 'Barley', id: 7002 }, { name: 'Potato', id: 7006 }],
  // Meat (Deer, Lamb, Fox, Wolf, Bear, Weasel, Lizard, Rhino, Lion, Cheetah, Scorpion, etc.)
  7901: [{ name: 'Deer Meat', id: 7901 }, { name: 'Lamb Meat', id: 7902 }, { name: 'Fox Meat', id: 7903 }, { name: 'Wolf Meat', id: 7904 }, { name: 'Bear Meat', id: 7905 }, { name: 'Weasel Meat', id: 7906 }, { name: 'Lizard Meat', id: 7907 }, { name: 'Rhino Meat', id: 7909 }, { name: 'Lion Meat', id: 7910 }, { name: 'Cheetah Meat', id: 7911 }],
  // Bird Meat (Chicken, Flamingo, Kuku, etc.)
  7921: [{ name: 'Chicken Meat', id: 7921 }, { name: 'Flamingo Meat', id: 7922 }, { name: 'Kuku Bird Meat', id: 7923 }],
  // Fish (any fish type — use cheapest available)
  8001: [{ name: 'Mudskipper', id: 8001 }, { name: 'Sardine', id: 8063 }, { name: 'Herring', id: 8062 }, { name: 'Flatfish', id: 8060 }, { name: 'Filefish', id: 8034 }],
  // Dried Fish (any dried fish)
  8501: [{ name: 'Dried Mudskipper', id: 8501 }, { name: 'Dried Sardine', id: 8563 }, { name: 'Dried Herring', id: 8562 }, { name: 'Dried Flatfish', id: 8560 }, { name: 'Dried Filefish', id: 8534 }],
  // Vegetables (Tomato, Paprika, Pumpkin, Cabbage, Olive)
  7203: [{ name: 'Tomato', id: 7203 }, { name: 'Paprika', id: 7202 }, { name: 'Pumpkin', id: 7204 }, { name: 'Cabbage', id: 7207 }, { name: 'Olive', id: 7210 }],
  7202: [{ name: 'Paprika', id: 7202 }, { name: 'Tomato', id: 7203 }, { name: 'Pumpkin', id: 7204 }, { name: 'Cabbage', id: 7207 }, { name: 'Olive', id: 7210 }],
  // Fruits (Grape, Strawberry, Apple, Cherry, Pear, Banana)
  7601: [{ name: 'Grape', id: 7601 }, { name: 'Strawberry', id: 7602 }, { name: 'Apple', id: 7603 }, { name: 'Cherry', id: 7604 }, { name: 'Pear', id: 7605 }, { name: 'Banana', id: 7606 }],
  7602: [{ name: 'Strawberry', id: 7602 }, { name: 'Grape', id: 7601 }, { name: 'Apple', id: 7603 }, { name: 'Cherry', id: 7604 }, { name: 'Pear', id: 7605 }],
  // Sugar / Honey
  9002: [{ name: 'Sugar', id: 9002 }, { name: 'Honey', id: 7318 }],
  // Cooking Wine / Fruits (sometimes interchangeable)
  9003: [{ name: 'Cooking Wine', id: 9003 }, { name: 'Fruit Wine', id: 9201 }],
  // Milk
  7310: [{ name: 'Milk', id: 7310 }],
  // Red Meat (interchangeable with regular meat in some recipes)
  7908: [{ name: 'Scorpion Meat', id: 7908 }, { name: 'Lizard Meat', id: 7907 }, { name: 'Rhino Meat', id: 7909 }],
  // Onion / Garlic (allium group)
  7201: [{ name: 'Onion', id: 7201 }, { name: 'Garlic', id: 7205 }, { name: 'Hot Pepper', id: 7206 }],
  7205: [{ name: 'Garlic', id: 7205 }, { name: 'Onion', id: 7201 }, { name: 'Hot Pepper', id: 7206 }],
};

/** Get the substitution group for an item ID, if any */
export const getSubstitutes = (itemId) => SUBSTITUTION_GROUPS[itemId] || null;

// Common BDO items for instant search suggestions across all calculators
// Prices are approximate NA market values — live price fetched on selection

export const COMMON_ITEMS = [
  // ═══ ORES ═══
  { name: 'Copper Ore', cat: 'Ore', price: 1300 },
  { name: 'Iron Ore', cat: 'Ore', price: 2000 },
  { name: 'Tin Ore', cat: 'Ore', price: 1200 },
  { name: 'Lead Ore', cat: 'Ore', price: 1800 },
  { name: 'Zinc Ore', cat: 'Ore', price: 2200 },
  { name: 'Gold Ore', cat: 'Ore', price: 5500 },
  { name: 'Platinum Ore', cat: 'Ore', price: 5200 },
  { name: 'Titanium Ore', cat: 'Ore', price: 5000 },
  { name: 'Vanadium Ore', cat: 'Ore', price: 4800 },
  { name: 'Mythril Ore', cat: 'Ore', price: 3500 },
  { name: 'Obsidian', cat: 'Ore', price: 3200 },
  { name: 'Jade', cat: 'Ore', price: 6500 },

  // ═══ MELTED SHARDS ═══
  { name: 'Melted Copper Shard', cat: 'Processed Ore', price: 3500 },
  { name: 'Melted Iron Shard', cat: 'Processed Ore', price: 5500 },
  { name: 'Melted Tin Shard', cat: 'Processed Ore', price: 3200 },
  { name: 'Melted Lead Shard', cat: 'Processed Ore', price: 5000 },
  { name: 'Melted Zinc Shard', cat: 'Processed Ore', price: 6000 },
  { name: 'Melted Gold Shard', cat: 'Processed Ore', price: 14000 },
  { name: 'Melted Platinum Shard', cat: 'Processed Ore', price: 13500 },
  { name: 'Melted Titanium Shard', cat: 'Processed Ore', price: 13000 },
  { name: 'Melted Vanadium Shard', cat: 'Processed Ore', price: 12500 },
  { name: 'Melted Mythril Shard', cat: 'Processed Ore', price: 9000 },

  // ═══ INGOTS ═══
  { name: 'Copper Ingot', cat: 'Ingot', price: 9500 },
  { name: 'Iron Ingot', cat: 'Ingot', price: 15000 },
  { name: 'Tin Ingot', cat: 'Ingot', price: 8500 },
  { name: 'Lead Ingot', cat: 'Ingot', price: 13000 },
  { name: 'Zinc Ingot', cat: 'Ingot', price: 16000 },
  { name: 'Gold Ingot', cat: 'Ingot', price: 38000 },
  { name: 'Platinum Ingot', cat: 'Ingot', price: 36000 },
  { name: 'Titanium Ingot', cat: 'Ingot', price: 35000 },
  { name: 'Vanadium Ingot', cat: 'Ingot', price: 34000 },
  { name: 'Mythril Ingot', cat: 'Ingot', price: 24000 },
  { name: 'Brass Ingot', cat: 'Ingot', price: 12000 },
  { name: 'Bronze Ingot', cat: 'Ingot', price: 11000 },
  { name: 'Steel', cat: 'Ingot', price: 17000 },

  // ═══ TIMBER ═══
  { name: 'Ash Timber', cat: 'Timber', price: 700 },
  { name: 'Birch Timber', cat: 'Timber', price: 900 },
  { name: 'Cedar Timber', cat: 'Timber', price: 800 },
  { name: 'Fir Timber', cat: 'Timber', price: 800 },
  { name: 'Maple Timber', cat: 'Timber', price: 700 },
  { name: 'Pine Timber', cat: 'Timber', price: 900 },
  { name: 'White Cedar Timber', cat: 'Timber', price: 1200 },
  { name: 'Acacia Timber', cat: 'Timber', price: 1800 },
  { name: 'Palm Timber', cat: 'Timber', price: 2500 },
  { name: 'Elder Tree Timber', cat: 'Timber', price: 3800 },
  { name: 'Thorn Tree Timber', cat: 'Timber', price: 3200 },
  { name: 'Snowfield Cedar Timber', cat: 'Timber', price: 4200 },

  // ═══ PLANKS ═══
  { name: 'Ash Plank', cat: 'Plank', price: 2000 },
  { name: 'Birch Plank', cat: 'Plank', price: 2500 },
  { name: 'Cedar Plank', cat: 'Plank', price: 2200 },
  { name: 'Fir Plank', cat: 'Plank', price: 2200 },
  { name: 'Maple Plank', cat: 'Plank', price: 2000 },
  { name: 'Pine Plank', cat: 'Plank', price: 2500 },
  { name: 'White Cedar Plank', cat: 'Plank', price: 3500 },
  { name: 'Acacia Plank', cat: 'Plank', price: 5000 },
  { name: 'Palm Plank', cat: 'Plank', price: 7000 },
  { name: 'Elder Tree Plank', cat: 'Plank', price: 10000 },

  // ═══ PLYWOOD ═══
  { name: 'Ash Plywood', cat: 'Plywood', price: 7000 },
  { name: 'Birch Plywood', cat: 'Plywood', price: 8500 },
  { name: 'Cedar Plywood', cat: 'Plywood', price: 7500 },
  { name: 'Fir Plywood', cat: 'Plywood', price: 7500 },
  { name: 'Maple Plywood', cat: 'Plywood', price: 7000 },
  { name: 'Pine Plywood', cat: 'Plywood', price: 8500 },
  { name: 'White Cedar Plywood', cat: 'Plywood', price: 11000 },
  { name: 'Acacia Plywood', cat: 'Plywood', price: 16000 },
  { name: 'Palm Plywood', cat: 'Plywood', price: 21000 },
  { name: 'Elder Tree Plywood', cat: 'Plywood', price: 30000 },

  // ═══ HIDES / LEATHER ═══
  { name: 'Lamb Hide', cat: 'Hide', price: 700 },
  { name: 'Deer Hide', cat: 'Hide', price: 1200 },
  { name: 'Fox Hide', cat: 'Hide', price: 1500 },
  { name: 'Wolf Hide', cat: 'Hide', price: 2000 },
  { name: 'Bear Hide', cat: 'Hide', price: 2500 },
  { name: 'Weasel Hide', cat: 'Hide', price: 1800 },
  { name: 'Lizard Hide', cat: 'Hide', price: 2200 },
  { name: 'Waragon Hide', cat: 'Hide', price: 3000 },
  { name: 'Tough Hide', cat: 'Processed Hide', price: 4500 },
  { name: 'Fine Tough Hide', cat: 'Processed Hide', price: 12000 },

  // ═══ FABRIC / CLOTH ═══
  { name: 'Cotton', cat: 'Fabric', price: 1200 },
  { name: 'Flax', cat: 'Fabric', price: 1400 },
  { name: 'Wool', cat: 'Fabric', price: 2500 },
  { name: 'Silk', cat: 'Fabric', price: 3500 },
  { name: 'Cotton Fabric', cat: 'Processed Fabric', price: 4500 },
  { name: 'Flax Fabric', cat: 'Processed Fabric', price: 5200 },
  { name: 'Wool Fabric', cat: 'Processed Fabric', price: 8000 },
  { name: 'Silk Thread', cat: 'Processed Fabric', price: 11000 },

  // ═══ FISH (commonly used in cooking) ═══
  // Dried fish — used in Fried Fish, Fish Fillet Chip, Steamed Fish, Seafood Combo, etc.
  { name: 'Dried Fish', cat: 'Fish', price: 1500 },
  { name: 'Dried Mudskipper', cat: 'Fish', price: 800, itemId: 8501 },
  { name: 'Dried Flounder', cat: 'Fish', price: 1200, itemId: 8504 },
  { name: 'Dried Mullet', cat: 'Fish', price: 1500, itemId: 8536 },
  { name: 'Dried Sardine', cat: 'Fish', price: 1200, itemId: 8563 },
  { name: 'Dried Herring', cat: 'Fish', price: 1200, itemId: 8562 },
  { name: 'Dried Crab', cat: 'Fish', price: 1800, itemId: 8513 },
  { name: 'Dried Squid', cat: 'Fish', price: 2500, itemId: 8511 },
  { name: 'Dried Octopus', cat: 'Fish', price: 2500, itemId: 8512 },
  { name: 'Dried Shellfish', cat: 'Fish', price: 1000, itemId: 8515 },
  { name: 'Dried Jellyfish', cat: 'Fish', price: 800, itemId: 8514 },
  { name: 'Dried Filefish', cat: 'Fish', price: 1500, itemId: 8534 },
  { name: 'Dried Croaker', cat: 'Fish', price: 2000, itemId: 8558 },
  { name: 'Dried Flatfish', cat: 'Fish', price: 1500, itemId: 8560 },
  { name: 'Dried Mackerel', cat: 'Fish', price: 2000, itemId: 8528 },
  { name: 'Dried Grunt', cat: 'Fish', price: 1200, itemId: 8561 },
  { name: 'Dried Porgy', cat: 'Fish', price: 2000, itemId: 8507 },
  { name: 'Dried Cuttlefish', cat: 'Fish', price: 2000, itemId: 8634 },
  { name: 'Dried Rockfish', cat: 'Fish', price: 2000, itemId: 8510 },
  { name: 'Dried Whiting', cat: 'Fish', price: 1500, itemId: 8566 },
  // Raw fish — used in Sushi, Steamed Fish, raw cooking recipes
  { name: 'Mudskipper', cat: 'Fish', price: 500 },
  { name: 'Flounder', cat: 'Fish', price: 1500 },
  { name: 'Sardine', cat: 'Fish', price: 1200 },
  { name: 'Herring', cat: 'Fish', price: 1200 },
  { name: 'Crab', cat: 'Fish', price: 2500 },
  { name: 'Squid', cat: 'Fish', price: 5000 },
  { name: 'Octopus', cat: 'Fish', price: 5000 },
  { name: 'Shellfish', cat: 'Fish', price: 1000 },
  { name: 'Jellyfish', cat: 'Fish', price: 500 },
  { name: 'Croaker', cat: 'Fish', price: 3000 },
  { name: 'Flatfish', cat: 'Fish', price: 2500 },
  { name: 'Mackerel', cat: 'Fish', price: 3000 },
  { name: 'Porgy', cat: 'Fish', price: 4000 },
  { name: 'Cuttlefish', cat: 'Fish', price: 3000 },
  { name: 'Salmon', cat: 'Fish', price: 5000 },
  { name: 'Sea Bass', cat: 'Fish', price: 10000 },
  { name: 'Tuna', cat: 'Fish', price: 8000 },
  { name: 'Swordfish', cat: 'Fish', price: 8000 },

  // ═══ COOKING INGREDIENTS ═══
  { name: 'Flour', cat: 'Cooking', price: 20 },
  { name: 'Dough', cat: 'Cooking', price: 40 },
  { name: 'Butter', cat: 'Cooking', price: 40 },
  { name: 'Cheese', cat: 'Cooking', price: 500 },
  { name: 'Cream', cat: 'Cooking', price: 500 },
  { name: 'Eggs', cat: 'Cooking', price: 20 },
  { name: 'Sugar', cat: 'Cooking', price: 20 },
  { name: 'Salt', cat: 'Cooking', price: 20 },
  { name: 'Cooking Wine', cat: 'Cooking', price: 40 },
  { name: 'Olive Oil', cat: 'Cooking', price: 40 },
  { name: 'Leavening Agent', cat: 'Cooking', price: 20 },
  { name: 'Mineral Water', cat: 'Cooking', price: 30 },
  { name: 'Purified Water', cat: 'Cooking', price: 60 },
  { name: 'Deep Frying Oil', cat: 'Cooking', price: 500 },
  { name: 'Pepper', cat: 'Cooking', price: 20 },
  { name: 'Vinegar', cat: 'Cooking', price: 250 },
  { name: 'Red Sauce', cat: 'Cooking', price: 350 },
  { name: 'White Sauce', cat: 'Cooking', price: 350 },
  { name: 'Fruit Wine', cat: 'Cooking', price: 300 },

  // ═══ CROPS ═══
  { name: 'Wheat', cat: 'Crop', price: 800 },
  { name: 'Barley', cat: 'Crop', price: 700 },
  { name: 'Corn', cat: 'Crop', price: 750 },
  { name: 'Potato', cat: 'Crop', price: 700 },
  { name: 'Sweet Potato', cat: 'Crop', price: 750 },
  { name: 'Carrot', cat: 'Crop', price: 1000 },
  { name: 'Tomato', cat: 'Crop', price: 1200 },
  { name: 'Paprika', cat: 'Crop', price: 1500 },
  { name: 'Pumpkin', cat: 'Crop', price: 1200 },
  { name: 'Onion', cat: 'Crop', price: 1000 },
  { name: 'Garlic', cat: 'Crop', price: 1100 },
  { name: 'Hot Pepper', cat: 'Crop', price: 1400 },
  { name: 'Olive', cat: 'Crop', price: 1300 },
  { name: 'Grape', cat: 'Crop', price: 1200 },
  { name: 'Strawberry', cat: 'Crop', price: 1800 },
  { name: 'Sunflower', cat: 'Crop', price: 1500 },
  { name: 'Pepper', cat: 'Crop', price: 1400 },

  // ═══ HERBS ═══
  { name: 'Sunrise Herb', cat: 'Herb', price: 2200 },
  { name: 'Silver Azalea', cat: 'Herb', price: 2000 },
  { name: 'Fire Flake Flower', cat: 'Herb', price: 2500 },
  { name: 'Dry Mane Grass', cat: 'Herb', price: 2100 },
  { name: 'Silk Honey Grass', cat: 'Herb', price: 3500 },
  { name: 'Everlasting Herb', cat: 'Herb', price: 4000 },

  // ═══ MUSHROOMS ═══
  { name: 'Purple Mushroom', cat: 'Mushroom', price: 3500 },
  { name: 'Pie Mushroom', cat: 'Mushroom', price: 3000 },
  { name: 'Bouquet Mushroom', cat: 'Mushroom', price: 3200 },
  { name: 'Truffle Mushroom', cat: 'Mushroom', price: 5000 },
  { name: 'Chanterelle Mushroom', cat: 'Mushroom', price: 4500 },
  { name: 'Leccinum Mushroom', cat: 'Mushroom', price: 4200 },

  // ═══ GEMS / CRYSTALS ═══
  { name: 'Rough Ruby', cat: 'Gem', price: 4500 },
  { name: 'Rough Emerald', cat: 'Gem', price: 4200 },
  { name: 'Rough Sapphire', cat: 'Gem', price: 4000 },
  { name: 'Rough Diamond', cat: 'Gem', price: 6000 },
  { name: 'Rough Topaz', cat: 'Gem', price: 3800 },
  { name: 'Ruby', cat: 'Gem', price: 14000 },
  { name: 'Emerald', cat: 'Gem', price: 13000 },
  { name: 'Sapphire', cat: 'Gem', price: 12000 },
  { name: 'Diamond', cat: 'Gem', price: 18000 },
  { name: 'Topaz', cat: 'Gem', price: 11000 },
  { name: 'Black Crystal', cat: 'Gem', price: 8500 },
  { name: 'Red Crystal', cat: 'Gem', price: 7500 },
  { name: 'Blue Crystal', cat: 'Gem', price: 7000 },
  { name: 'Green Crystal', cat: 'Gem', price: 6500 },

  // ═══ TRACES ═══
  { name: 'Trace of Savagery', cat: 'Trace', price: 15000 },
  { name: 'Trace of Violence', cat: 'Trace', price: 12000 },
  { name: 'Trace of Origin', cat: 'Trace', price: 11000 },
  { name: 'Trace of Memory', cat: 'Trace', price: 9500 },
  { name: 'Trace of the Earth', cat: 'Trace', price: 8000 },
  { name: 'Trace of Forest', cat: 'Trace', price: 7500 },
  { name: 'Trace of Despair', cat: 'Trace', price: 10000 },
  { name: 'Trace of Death', cat: 'Trace', price: 13000 },
  { name: 'Trace of Chaos', cat: 'Trace', price: 14000 },
  { name: 'Trace of Hunting', cat: 'Trace', price: 8500 },
  { name: 'Trace of Battle', cat: 'Trace', price: 9000 },
  { name: 'Trace of Ascension', cat: 'Trace', price: 16000 },

  // ═══ ALCHEMY REAGENTS ═══
  { name: 'Clear Liquid Reagent', cat: 'Alchemy', price: 2500 },
  { name: 'Pure Powder Reagent', cat: 'Alchemy', price: 2800 },
  { name: 'Blood of the Sinner', cat: 'Alchemy', price: 12000 },
  { name: 'Blood of the Wise', cat: 'Alchemy', price: 15000 },
  { name: 'Blood of the Brave', cat: 'Alchemy', price: 14000 },
  { name: 'Sinner\'s Blood', cat: 'Alchemy', price: 45000 },
  { name: 'Wise Man\'s Blood', cat: 'Alchemy', price: 55000 },
  { name: 'Legendary Beast\'s Blood', cat: 'Alchemy', price: 60000 },
  { name: 'Oil of Storms', cat: 'Alchemy', price: 85000 },
  { name: 'Oil of Corruption', cat: 'Alchemy', price: 80000 },
  { name: 'Oil of Regeneration', cat: 'Alchemy', price: 75000 },
  { name: 'Oil of Fortitude', cat: 'Alchemy', price: 70000 },
  { name: 'Oil of Tranquility', cat: 'Alchemy', price: 65000 },
  { name: 'Elixir of Will', cat: 'Alchemy', price: 35000 },
  { name: 'Elixir of Fury', cat: 'Alchemy', price: 40000 },
  { name: 'Elixir of Detection', cat: 'Alchemy', price: 32000 },
  { name: 'Elixir of Time', cat: 'Alchemy', price: 50000 },
  { name: 'Elixir of Human Hunt', cat: 'Alchemy', price: 45000 },
  { name: 'Elixir of Demihuman Hunt', cat: 'Alchemy', price: 42000 },

  // ═══ COOKING OUTPUTS ═══
  { name: 'Beer', cat: 'Cooking Product', price: 3270, itemId: 9213 },
  { name: 'Grilled Bird Meat', cat: 'Cooking Product', price: 4740, itemId: 9492 },
  { name: 'Meat Stew', cat: 'Cooking Product', price: 23800, itemId: 9414 },
  { name: 'Soft Bread', cat: 'Cooking Product', price: 1500 },
  { name: 'Cheese Pie', cat: 'Cooking Product', price: 4000 },
  { name: 'Meat Pie', cat: 'Cooking Product', price: 4500 },
  { name: 'Fish Fillet Chips', cat: 'Cooking Product', price: 11500, itemId: 9208 },
  { name: 'Fried Fish', cat: 'Cooking Product', price: 426, itemId: 9407 },
  { name: 'Pickled Vegetables', cat: 'Cooking Product', price: 2800 },
  { name: 'Hamburg', cat: 'Cooking Product', price: 6500 },
  { name: 'Meat Croquette', cat: 'Cooking Product', price: 50500, itemId: 9404 },
  { name: 'Fruit Pudding', cat: 'Cooking Product', price: 7500 },
  { name: 'Honey Wine', cat: 'Cooking Product', price: 1380, itemId: 9206 },
  { name: 'Essence of Liquor', cat: 'Cooking Product', price: 1800 },
  { name: 'Teff Sandwich', cat: 'Cooking Product', price: 55500, itemId: 9218 },
  { name: 'Coconut Pasta', cat: 'Cooking Product', price: 15000 },
  { name: 'Smoked Fish Steak', cat: 'Cooking Product', price: 5650, itemId: 9417 },
  { name: 'Steamed Fish', cat: 'Cooking Product', price: 494, itemId: 9409 },
  { name: 'Fish Soup', cat: 'Cooking Product', price: 775, itemId: 9418 },
  { name: 'Seafood Pasta', cat: 'Cooking Product', price: 1820, itemId: 9413 },
  { name: 'Stir-Fried Seafood', cat: 'Cooking Product', price: 2980, itemId: 9420 },
  { name: 'Steamed Seafood', cat: 'Cooking Product', price: 1510, itemId: 9411 },
  { name: 'Steak', cat: 'Cooking Product', price: 32700, itemId: 9401 },
  { name: 'Dark Pudding', cat: 'Cooking Product', price: 39500, itemId: 9422 },
  { name: 'Cheese Gratin', cat: 'Cooking Product', price: 43000, itemId: 9203 },
  { name: 'Sute Tea', cat: 'Cooking Product', price: 29000, itemId: 9207 },
  { name: 'Lean Meat Salad', cat: 'Cooking Product', price: 32100, itemId: 9425 },
  { name: 'Stir-Fried Meat', cat: 'Cooking Product', price: 23300, itemId: 9426 },
  { name: 'Grilled Sausage', cat: 'Cooking Product', price: 33600, itemId: 9427 },
  { name: 'Couscous', cat: 'Cooking Product', price: 42100, itemId: 9220 },
  { name: 'Freekeh Snake Stew', cat: 'Cooking Product', price: 42800, itemId: 9215 },
  { name: 'Valencia Meal', cat: 'Cooking Product', price: 31800, itemId: 9609 },
  { name: 'Balenos Meal', cat: 'Cooking Product', price: 24600, itemId: 9601 },
  { name: 'Serendia Meal', cat: 'Cooking Product', price: 39200, itemId: 9603 },
  { name: 'Calpheon Meal', cat: 'Cooking Product', price: 32500, itemId: 9605 },
  { name: 'Mediah Meal', cat: 'Cooking Product', price: 42500, itemId: 9607 },
  { name: 'Kamasylvia Meal', cat: 'Cooking Product', price: 28300, itemId: 9635 },
  { name: "O'dyllita Meal", cat: 'Cooking Product', price: 39300, itemId: 9638 },
  { name: 'Margoria Seafood Meal', cat: 'Cooking Product', price: 260000, itemId: 9634 },
  { name: 'Eilton Meal', cat: 'Cooking Product', price: 103000, itemId: 9640 },
  { name: 'Seafood Cron Meal', cat: 'Cooking Product', price: 383000, itemId: 9691 },
  { name: 'Simple Cron Meal', cat: 'Cooking Product', price: 373000, itemId: 9692 },
  { name: 'Exquisite Cron Meal', cat: 'Cooking Product', price: 273000, itemId: 9693 },
  { name: 'Knight Combat Rations', cat: 'Cooking Product', price: 33300, itemId: 9631 },
  { name: 'Oatmeal', cat: 'Cooking Product', price: 17500, itemId: 9261 },
  { name: 'Milk Tea', cat: 'Cooking Product', price: 18200, itemId: 9263 },
  { name: 'Meat Pie', cat: 'Cooking Product', price: 24300, itemId: 9265 },
  { name: 'Fruit Wine', cat: 'Cooking Product', price: 6600, itemId: 9201 },
  // Pet feed
  { name: 'Organic Feed', cat: 'Cooking Product', price: 53500, itemId: 54018 },
  { name: 'Good Feed', cat: 'Cooking Product', price: 29300, itemId: 54017 },
  { name: 'Cheap Feed', cat: 'Cooking Product', price: 560, itemId: 54016 },

  // ═══ ENHANCEMENT MATERIALS ═══
  { name: 'Black Stone (Weapon)', cat: 'Enhancement', price: 220000 },
  { name: 'Black Stone (Armor)', cat: 'Enhancement', price: 200000 },
  { name: 'Concentrated Magical Black Stone (Weapon)', cat: 'Enhancement', price: 2500000 },
  { name: 'Concentrated Magical Black Stone (Armor)', cat: 'Enhancement', price: 2200000 },
  { name: 'Cron Stone', cat: 'Enhancement', price: 2000000 },
  { name: 'Memory Fragment', cat: 'Enhancement', price: 1800000 },
  { name: 'Advice of Valks (+10)', cat: 'Enhancement', price: 80000 },
  { name: 'Advice of Valks (+20)', cat: 'Enhancement', price: 500000 },
  { name: 'Advice of Valks (+30)', cat: 'Enhancement', price: 2000000 },
  { name: 'Advice of Valks (+40)', cat: 'Enhancement', price: 8000000 },
  { name: 'Advice of Valks (+50)', cat: 'Enhancement', price: 25000000 },
  { name: "Manos' Honed Stone", cat: 'Enhancement', price: 3000000 },
  { name: 'Mass of Pure Magic', cat: 'Enhancement', price: 5000000 },
  { name: 'Flawless Magical Black Stone', cat: 'Enhancement', price: 1500000 },
  { name: 'Cleansed Magical Black Stone', cat: 'Enhancement', price: 1200000 },
  { name: 'Restored Magical Black Stone', cat: 'Enhancement', price: 1000000 },

  // ═══ POPULAR GEAR ═══
  { name: "Dim Tree Spirit's Armor", cat: 'Boss Gear', price: 230000000 },
  { name: "Red Nose's Armor", cat: 'Boss Gear', price: 95000000 },
  { name: "Giath's Helmet", cat: 'Boss Gear', price: 75000000 },
  { name: "Griffon's Helmet", cat: 'Boss Gear', price: 180000000 },
  { name: "Bheg's Gloves", cat: 'Boss Gear', price: 110000000 },
  { name: "Leebur's Gloves", cat: 'Boss Gear', price: 170000000 },
  { name: "Muskan's Shoes", cat: 'Boss Gear', price: 85000000 },
  { name: "Urugon's Shoes", cat: 'Boss Gear', price: 200000000 },
  { name: 'Kzarka Longsword', cat: 'Boss Weapon', price: 120000000 },
  { name: 'Dandelion Longsword', cat: 'Boss Weapon', price: 250000000 },
  { name: 'Offin Tett Longsword', cat: 'Boss Weapon', price: 180000000 },
  { name: 'Kutum Sub-weapon', cat: 'Boss Weapon', price: 200000000 },
  { name: 'Nouver Sub-weapon', cat: 'Boss Weapon', price: 150000000 },
  { name: 'Blackstar Longsword', cat: 'Boss Weapon', price: 900000000 },
  { name: 'Blackstar Armor', cat: 'Boss Gear', price: 1200000000 },
  { name: "Fallen God's Armor", cat: 'Boss Gear', price: 50000000000 },

  // ═══ ACCESSORIES ═══
  { name: 'Ring of Crescent Guardian', cat: 'Accessory', price: 45000000 },
  { name: 'Tungrad Ring', cat: 'Accessory', price: 80000000 },
  { name: 'Eye of the Ruins Ring', cat: 'Accessory', price: 120000000 },
  { name: 'Tungrad Earring', cat: 'Accessory', price: 75000000 },
  { name: 'Narc Ear Accessory', cat: 'Accessory', price: 55000000 },
  { name: 'Dawn Earring', cat: 'Accessory', price: 100000000 },
  { name: 'Ogre Ring', cat: 'Accessory', price: 95000000 },
  { name: 'Laytenn\'s Power Stone', cat: 'Accessory', price: 85000000 },
  { name: 'Tungrad Necklace', cat: 'Accessory', price: 110000000 },
  { name: 'Deboreka Necklace', cat: 'Accessory', price: 400000000 },
  { name: 'Basilisk\'s Belt', cat: 'Accessory', price: 32000000 },
  { name: 'Valtarra Eclipsed Belt', cat: 'Accessory', price: 60000000 },
  { name: 'Tungrad Belt', cat: 'Accessory', price: 90000000 },
  { name: 'Orkinrad\'s Belt', cat: 'Accessory', price: 150000000 },

  // ═══ LIFE SKILL GEAR ═══
  { name: 'Manos Cook\'s Clothes', cat: 'Life Skill', price: 250000000 },
  { name: 'Manos Alchemist\'s Clothes', cat: 'Life Skill', price: 250000000 },
  { name: 'Manos Processing Stone', cat: 'Life Skill', price: 200000000 },
  { name: 'Manos Gatherer\'s Clothes', cat: 'Life Skill', price: 300000000 },
  { name: 'Manos Trainer\'s Clothes', cat: 'Life Skill', price: 200000000 },
  { name: 'Manos Fisher\'s Clothes', cat: 'Life Skill', price: 200000000 },
  { name: 'Manos Hunting Rifle', cat: 'Life Skill', price: 150000000 },
  { name: 'Manos Riding Crop', cat: 'Life Skill', price: 180000000 },
  { name: 'Manos Butcher Knife', cat: 'Life Skill', price: 120000000 },
  { name: 'Manos Hoe', cat: 'Life Skill', price: 120000000 },
  { name: 'Manos Fluid Collector', cat: 'Life Skill', price: 120000000 },
  { name: 'Manos Lumbering Axe', cat: 'Life Skill', price: 120000000 },
  { name: 'Manos Mining Pickaxe', cat: 'Life Skill', price: 120000000 },
  { name: 'Manos Tanning Knife', cat: 'Life Skill', price: 120000000 },

  // ═══ MISC PROCESSED ═══
  { name: 'Rough Stone', cat: 'Misc', price: 650 },
  { name: 'Powder of Flame', cat: 'Misc', price: 1500 },
  { name: 'Powder of Darkness', cat: 'Misc', price: 1600 },
  { name: 'Powder of Earth', cat: 'Misc', price: 1400 },
  { name: 'Powder of Crevice', cat: 'Misc', price: 1300 },
  { name: 'Powder of Time', cat: 'Misc', price: 1800 },
  { name: 'Bloody Tree Knot', cat: 'Misc', price: 8500 },
  { name: 'Spirit Pouch of Ferocious Beast', cat: 'Misc', price: 12000 },
  { name: 'Sturdy Plywood', cat: 'Misc', price: 18000 },
  { name: 'Polished Stone', cat: 'Misc', price: 2000 },
  { name: 'Monk\'s Branch', cat: 'Misc', price: 5500 },
  { name: 'Log', cat: 'Misc', price: 600 },
  { name: 'Coal', cat: 'Misc', price: 3000 },
  { name: 'Charcoal', cat: 'Misc', price: 2500 },
  { name: 'Black Stone Powder', cat: 'Misc', price: 3500 },
  { name: 'Gem Polisher', cat: 'Misc', price: 5000 },
];

/** Look up static price by exact item name */
export const getStaticPrice = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  const item = COMMON_ITEMS.find(i => i.name.toLowerCase() === lower);
  if (item?.price) return item.price;
  // Fallback: check raw fish vendor prices (covers 100+ fish not in COMMON_ITEMS)
  const vendorPrice = FISH_VENDOR_PRICES[name];
  if (vendorPrice) return vendorPrice;
  // Fallback: "Dried X" → derive from raw fish vendor price
  if (lower.startsWith('dried ')) {
    const rawName = name.slice(6); // strip "Dried "
    const rawPrice = FISH_VENDOR_PRICES[rawName];
    if (rawPrice) return rawPrice;
  }
  return null;
};

/** Format silver values for display */
const formatPrice = (p) => {
  if (p >= 1_000_000_000) return (p / 1_000_000_000).toFixed(1) + 'B';
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1) + 'M';
  if (p >= 1_000) return (p / 1_000).toFixed(1) + 'K';
  return p.toString();
};

/** Search local items by query string. Returns instant matches with price hints. */
export const searchLocalItems = (query) => {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return COMMON_ITEMS.filter(i =>
    i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)
  ).slice(0, 20).map(i => ({
    ...i,
    priceHint: i.price ? formatPrice(i.price) : null,
  }));
};
