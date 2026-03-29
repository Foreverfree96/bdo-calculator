// BDO Processing recipes — category-based input→output conversions
// Quantities are per single processing action (before mastery yield)

export const PROCESSING_CATEGORIES = [
  'Heating', 'Grinding', 'Chopping', 'Drying', 'Filtering', 'Shaking',
];

export const PROCESSING_RECIPES = [
  // ═══ HEATING — Ore → Melted Shard ═══
  { category: 'Heating', name: 'Copper Ore → Melted Copper Shard', inputs: [{ name: 'Copper Ore', qty: 5 }], outputs: [{ name: 'Melted Copper Shard', qty: 2 }] },
  { category: 'Heating', name: 'Iron Ore → Melted Iron Shard', inputs: [{ name: 'Iron Ore', qty: 5 }], outputs: [{ name: 'Melted Iron Shard', qty: 2 }] },
  { category: 'Heating', name: 'Tin Ore → Melted Tin Shard', inputs: [{ name: 'Tin Ore', qty: 5 }], outputs: [{ name: 'Melted Tin Shard', qty: 2 }] },
  { category: 'Heating', name: 'Lead Ore → Melted Lead Shard', inputs: [{ name: 'Lead Ore', qty: 5 }], outputs: [{ name: 'Melted Lead Shard', qty: 2 }] },
  { category: 'Heating', name: 'Zinc Ore → Melted Zinc Shard', inputs: [{ name: 'Zinc Ore', qty: 5 }], outputs: [{ name: 'Melted Zinc Shard', qty: 2 }] },
  { category: 'Heating', name: 'Gold Ore → Melted Gold Shard', inputs: [{ name: 'Gold Ore', qty: 5 }], outputs: [{ name: 'Melted Gold Shard', qty: 2 }] },
  { category: 'Heating', name: 'Platinum Ore → Melted Platinum Shard', inputs: [{ name: 'Platinum Ore', qty: 5 }], outputs: [{ name: 'Melted Platinum Shard', qty: 2 }] },
  { category: 'Heating', name: 'Titanium Ore → Melted Titanium Shard', inputs: [{ name: 'Titanium Ore', qty: 5 }], outputs: [{ name: 'Melted Titanium Shard', qty: 2 }] },
  { category: 'Heating', name: 'Vanadium Ore → Melted Vanadium Shard', inputs: [{ name: 'Vanadium Ore', qty: 5 }], outputs: [{ name: 'Melted Vanadium Shard', qty: 2 }] },
  { category: 'Heating', name: 'Mythril Ore → Melted Mythril Shard', inputs: [{ name: 'Mythril Ore', qty: 5 }], outputs: [{ name: 'Melted Mythril Shard', qty: 2 }] },

  // ═══ HEATING — Melted Shard → Ingot ═══
  { category: 'Heating', name: 'Melted Copper Shard → Copper Ingot', inputs: [{ name: 'Melted Copper Shard', qty: 10 }], outputs: [{ name: 'Copper Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Iron Shard → Iron Ingot', inputs: [{ name: 'Melted Iron Shard', qty: 10 }], outputs: [{ name: 'Iron Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Tin Shard → Tin Ingot', inputs: [{ name: 'Melted Tin Shard', qty: 10 }], outputs: [{ name: 'Tin Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Lead Shard → Lead Ingot', inputs: [{ name: 'Melted Lead Shard', qty: 10 }], outputs: [{ name: 'Lead Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Zinc Shard → Zinc Ingot', inputs: [{ name: 'Melted Zinc Shard', qty: 10 }], outputs: [{ name: 'Zinc Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Gold Shard → Gold Ingot', inputs: [{ name: 'Melted Gold Shard', qty: 10 }], outputs: [{ name: 'Gold Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Platinum Shard → Platinum Ingot', inputs: [{ name: 'Melted Platinum Shard', qty: 10 }], outputs: [{ name: 'Platinum Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Titanium Shard → Titanium Ingot', inputs: [{ name: 'Melted Titanium Shard', qty: 10 }], outputs: [{ name: 'Titanium Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Vanadium Shard → Vanadium Ingot', inputs: [{ name: 'Melted Vanadium Shard', qty: 10 }], outputs: [{ name: 'Vanadium Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Melted Mythril Shard → Mythril Ingot', inputs: [{ name: 'Melted Mythril Shard', qty: 10 }], outputs: [{ name: 'Mythril Ingot', qty: 2 }] },

  // ═══ HEATING — Alloys ═══
  { category: 'Heating', name: 'Brass Ingot (Copper + Zinc)', inputs: [{ name: 'Melted Copper Shard', qty: 5 }, { name: 'Melted Zinc Shard', qty: 5 }], outputs: [{ name: 'Brass Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Bronze Ingot (Copper + Tin)', inputs: [{ name: 'Melted Copper Shard', qty: 5 }, { name: 'Melted Tin Shard', qty: 5 }], outputs: [{ name: 'Bronze Ingot', qty: 2 }] },
  { category: 'Heating', name: 'Steel (Iron + Coal)', inputs: [{ name: 'Melted Iron Shard', qty: 5 }, { name: 'Coal', qty: 5 }], outputs: [{ name: 'Steel', qty: 2 }] },

  // ═══ HEATING — Gems ═══
  { category: 'Heating', name: 'Rough Ruby → Ruby', inputs: [{ name: 'Rough Ruby', qty: 5 }], outputs: [{ name: 'Ruby', qty: 1 }] },
  { category: 'Heating', name: 'Rough Emerald → Emerald', inputs: [{ name: 'Rough Emerald', qty: 5 }], outputs: [{ name: 'Emerald', qty: 1 }] },
  { category: 'Heating', name: 'Rough Sapphire → Sapphire', inputs: [{ name: 'Rough Sapphire', qty: 5 }], outputs: [{ name: 'Sapphire', qty: 1 }] },
  { category: 'Heating', name: 'Rough Diamond → Diamond', inputs: [{ name: 'Rough Diamond', qty: 5 }], outputs: [{ name: 'Diamond', qty: 1 }] },
  { category: 'Heating', name: 'Rough Topaz → Topaz', inputs: [{ name: 'Rough Topaz', qty: 5 }], outputs: [{ name: 'Topaz', qty: 1 }] },

  // ═══ HEATING — Plywood ═══
  { category: 'Heating', name: 'Sturdy Ash Plywood', inputs: [{ name: 'Ash Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Ash Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Birch Plywood', inputs: [{ name: 'Birch Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Birch Plywood', qty: 1 }] },
  { category: 'Heating', name: 'Sturdy Pine Plywood', inputs: [{ name: 'Pine Plywood', qty: 10 }, { name: 'Plywood Hardener', qty: 3 }], outputs: [{ name: 'Sturdy Pine Plywood', qty: 1 }] },

  // ═══ HEATING — Black Stone Powder ═══
  { category: 'Heating', name: 'Rough Stone → Black Stone Powder', inputs: [{ name: 'Rough Stone', qty: 2 }], outputs: [{ name: 'Black Stone Powder', qty: 1 }] },

  // ═══ CHOPPING — Timber → Plank ═══
  { category: 'Chopping', name: 'Ash Timber → Ash Plank', inputs: [{ name: 'Ash Timber', qty: 5 }], outputs: [{ name: 'Ash Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Birch Timber → Birch Plank', inputs: [{ name: 'Birch Timber', qty: 5 }], outputs: [{ name: 'Birch Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Cedar Timber → Cedar Plank', inputs: [{ name: 'Cedar Timber', qty: 5 }], outputs: [{ name: 'Cedar Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Fir Timber → Fir Plank', inputs: [{ name: 'Fir Timber', qty: 5 }], outputs: [{ name: 'Fir Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Maple Timber → Maple Plank', inputs: [{ name: 'Maple Timber', qty: 5 }], outputs: [{ name: 'Maple Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Pine Timber → Pine Plank', inputs: [{ name: 'Pine Timber', qty: 5 }], outputs: [{ name: 'Pine Plank', qty: 2 }] },
  { category: 'Chopping', name: 'White Cedar Timber → White Cedar Plank', inputs: [{ name: 'White Cedar Timber', qty: 5 }], outputs: [{ name: 'White Cedar Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Acacia Timber → Acacia Plank', inputs: [{ name: 'Acacia Timber', qty: 5 }], outputs: [{ name: 'Acacia Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Palm Timber → Palm Plank', inputs: [{ name: 'Palm Timber', qty: 5 }], outputs: [{ name: 'Palm Plank', qty: 2 }] },
  { category: 'Chopping', name: 'Elder Tree Timber → Elder Tree Plank', inputs: [{ name: 'Elder Tree Timber', qty: 5 }], outputs: [{ name: 'Elder Tree Plank', qty: 2 }] },

  // ═══ CHOPPING — Plank → Plywood ═══
  { category: 'Chopping', name: 'Ash Plank → Ash Plywood', inputs: [{ name: 'Ash Plank', qty: 10 }], outputs: [{ name: 'Ash Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Birch Plank → Birch Plywood', inputs: [{ name: 'Birch Plank', qty: 10 }], outputs: [{ name: 'Birch Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Cedar Plank → Cedar Plywood', inputs: [{ name: 'Cedar Plank', qty: 10 }], outputs: [{ name: 'Cedar Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Fir Plank → Fir Plywood', inputs: [{ name: 'Fir Plank', qty: 10 }], outputs: [{ name: 'Fir Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Maple Plank → Maple Plywood', inputs: [{ name: 'Maple Plank', qty: 10 }], outputs: [{ name: 'Maple Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Pine Plank → Pine Plywood', inputs: [{ name: 'Pine Plank', qty: 10 }], outputs: [{ name: 'Pine Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'White Cedar Plank → White Cedar Plywood', inputs: [{ name: 'White Cedar Plank', qty: 10 }], outputs: [{ name: 'White Cedar Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Acacia Plank → Acacia Plywood', inputs: [{ name: 'Acacia Plank', qty: 10 }], outputs: [{ name: 'Acacia Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Palm Plank → Palm Plywood', inputs: [{ name: 'Palm Plank', qty: 10 }], outputs: [{ name: 'Palm Plywood', qty: 2 }] },
  { category: 'Chopping', name: 'Elder Tree Plank → Elder Tree Plywood', inputs: [{ name: 'Elder Tree Plank', qty: 10 }], outputs: [{ name: 'Elder Tree Plywood', qty: 2 }] },

  // ═══ GRINDING — Grain → Flour ═══
  { category: 'Grinding', name: 'Wheat → Flour', inputs: [{ name: 'Wheat', qty: 1 }], outputs: [{ name: 'Flour', qty: 1 }] },
  { category: 'Grinding', name: 'Barley → Flour', inputs: [{ name: 'Barley', qty: 1 }], outputs: [{ name: 'Flour', qty: 1 }] },
  { category: 'Grinding', name: 'Corn → Flour', inputs: [{ name: 'Corn', qty: 1 }], outputs: [{ name: 'Flour', qty: 1 }] },
  { category: 'Grinding', name: 'Potato → Flour', inputs: [{ name: 'Potato', qty: 1 }], outputs: [{ name: 'Flour', qty: 1 }] },
  { category: 'Grinding', name: 'Sweet Potato → Flour', inputs: [{ name: 'Sweet Potato', qty: 1 }], outputs: [{ name: 'Flour', qty: 1 }] },

  // ═══ GRINDING — Misc ═══
  { category: 'Grinding', name: 'Rough Stone → Polished Stone', inputs: [{ name: 'Rough Stone', qty: 10 }], outputs: [{ name: 'Polished Stone', qty: 1 }] },

  // ═══ DRYING — Hides ═══
  { category: 'Drying', name: 'Lamb Hide → Tough Hide', inputs: [{ name: 'Lamb Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Deer Hide → Tough Hide', inputs: [{ name: 'Deer Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Fox Hide → Tough Hide', inputs: [{ name: 'Fox Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Wolf Hide → Tough Hide', inputs: [{ name: 'Wolf Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Bear Hide → Tough Hide', inputs: [{ name: 'Bear Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Weasel Hide → Tough Hide', inputs: [{ name: 'Weasel Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Lizard Hide → Tough Hide', inputs: [{ name: 'Lizard Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Waragon Hide → Tough Hide', inputs: [{ name: 'Waragon Hide', qty: 5 }], outputs: [{ name: 'Tough Hide', qty: 1 }] },
  { category: 'Drying', name: 'Tough Hide → Fine Tough Hide', inputs: [{ name: 'Tough Hide', qty: 10 }], outputs: [{ name: 'Fine Tough Hide', qty: 1 }] },

  // ═══ DRYING — Crops ═══
  { category: 'Drying', name: 'Wheat → Dried Wheat', inputs: [{ name: 'Wheat', qty: 5 }], outputs: [{ name: 'Dried Wheat', qty: 1 }] },
  { category: 'Drying', name: 'Barley → Dried Barley', inputs: [{ name: 'Barley', qty: 5 }], outputs: [{ name: 'Dried Barley', qty: 1 }] },

  // ═══ FILTERING — Fabrics ═══
  { category: 'Filtering', name: 'Cotton → Cotton Fabric', inputs: [{ name: 'Cotton', qty: 5 }], outputs: [{ name: 'Cotton Fabric', qty: 1 }] },
  { category: 'Filtering', name: 'Flax → Flax Fabric', inputs: [{ name: 'Flax', qty: 5 }], outputs: [{ name: 'Flax Fabric', qty: 1 }] },
  { category: 'Filtering', name: 'Wool → Wool Fabric', inputs: [{ name: 'Wool', qty: 5 }], outputs: [{ name: 'Wool Fabric', qty: 1 }] },
  { category: 'Filtering', name: 'Silk → Silk Thread', inputs: [{ name: 'Silk', qty: 5 }], outputs: [{ name: 'Silk Thread', qty: 1 }] },

  // ═══ FILTERING — Water ═══
  { category: 'Filtering', name: 'River Water → Purified Water', inputs: [{ name: 'River Water', qty: 1 }], outputs: [{ name: 'Purified Water', qty: 1 }] },
  { category: 'Filtering', name: 'Muddy Water → Purified Water', inputs: [{ name: 'Muddy Water', qty: 1 }], outputs: [{ name: 'Purified Water', qty: 1 }] },

  // ═══ SHAKING — Alchemy Reagents ═══
  { category: 'Shaking', name: 'Flour + Mineral Water → Dough', inputs: [{ name: 'Flour', qty: 1 }, { name: 'Mineral Water', qty: 1 }], outputs: [{ name: 'Dough', qty: 1 }] },
  { category: 'Shaking', name: 'Cream + Sugar → Butter', inputs: [{ name: 'Cream', qty: 1 }, { name: 'Sugar', qty: 1 }], outputs: [{ name: 'Butter', qty: 1 }] },
  { category: 'Shaking', name: 'Milk + Sugar → Cream', inputs: [{ name: 'Milk', qty: 1 }, { name: 'Sugar', qty: 1 }], outputs: [{ name: 'Cream', qty: 1 }] },
  { category: 'Shaking', name: 'Milk + Leavening Agent → Cheese', inputs: [{ name: 'Milk', qty: 1 }, { name: 'Leavening Agent', qty: 1 }], outputs: [{ name: 'Cheese', qty: 1 }] },
];
